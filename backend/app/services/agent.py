import os, re, json, pandas as pd
from dataclasses import dataclass
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.config import settings

# ── Paths — works locally and on Render ──
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_DIR   = os.path.join(BASE_DIR, "data", "science_db_pro")
CSV_PATH = os.path.join(BASE_DIR, "data", "East_Africa_Food_Dataset_FINAL.csv")

@dataclass
class AthleteProfile:
    weight_kg:     float
    age_group:     str
    sex:           str
    sport:         str
    intensity:     str
    duration_mins: float
    goal:          str

class NutritionAgent:

    def __init__(self):
        print(f"BASE_DIR resolved to: {BASE_DIR}")
        print(f"CSV_PATH: {CSV_PATH}")
        print(f"DB_DIR: {DB_DIR}")

        print("Loading embeddings...")
        embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-en-v1.5")

        print("Loading vector store...")
        self.retriever = Chroma(
            persist_directory=DB_DIR,
            embedding_function=embeddings
        ).as_retriever(search_kwargs={"k": 5})

        print("Loading food dataset...")
        self.food_df = pd.read_csv(CSV_PATH)

        print("Loading LLM...")
        self.llm = ChatGroq(
            model       = "llama-3.3-70b-versatile",
            api_key     = settings.GROQ_API_KEY,
            temperature = 0.7,
            max_tokens  = 1024
        )
        self._normalize_dataset()
        print("✅ NutritionAgent ready.")

    def _normalize_dataset(self):
        def extract(text, nutrient):
            m = re.search(rf'([0-9.]+)g\s+{nutrient}', str(text), re.IGNORECASE)
            return float(m.group(1)) if m else 0.0
        self.food_df['Carbs_Parsed']   = self.food_df['Macros per 100g (C / P / F)'].apply(lambda x: extract(x, 'Carbs'))
        self.food_df['Protein_Parsed'] = self.food_df['Macros per 100g (C / P / F)'].apply(lambda x: extract(x, 'Pro'))

    def _llm(self, prompt: str) -> str:
        result = self.llm.invoke(prompt)
        return result.content if hasattr(result, 'content') else str(result)

    def _gatekeeper_check(self, text: str):
        raw = self._llm(f"""
        Analyze: "{text}"
        Is this a physical sport, exercise, or athletic activity requiring sports nutrition?
        Output ONLY valid JSON: {{"is_sport": true or false, "reason": "short friendly explanation if false"}}
        """)
        try:
            d = json.loads(re.search(r'\{.*\}', raw, re.DOTALL).group(0))
            return d.get('is_sport', True), d.get('reason', '')
        except:
            return True, ""

    def _auto_detect(self, text: str) -> dict:
        raw = self._llm(f"""
        Analyze this athlete description and extract every field possible: "{text}"
        EXTRACTION RULES:
        - sport name → "sport"
        - hours/minutes → "duration_mins" (convert hours to minutes)
        - kg/lbs number → "weight_kg" (convert lbs: divide by 2.2)
        - age/years old → "age_group": youth(<18), adult(18-40), veteran(>40)
        - male/man/boy/guy → sex: "male" | female/woman/girl → sex: "female"
        - recovery/muscle/weight loss/performance → "goal"
        - basketball/soccer/football/rugby/sprinting = "heavy" intensity
        - jogging/cycling = "moderate" | walking/yoga = "light"
        - goal default: "recovery" for post-game context
        Only add to "missing" if truly not mentioned at all.
        Output ONLY valid JSON:
        {{"weight_kg": 68.0, "age_group": "adult", "sex": "male", "sport": "basketball",
          "intensity": "heavy", "duration_mins": 180.0, "goal": "recovery", "missing": []}}
        """)
        try:
            return json.loads(re.search(r'\{.*\}', raw, re.DOTALL).group(0))
        except:
            return {"weight_kg": None, "age_group": None, "sex": None, "sport": "sport",
                    "intensity": "moderate", "duration_mins": None, "goal": "recovery",
                    "missing": ["weight_kg", "sex", "age_group", "duration_mins"]}

    def _calculate_macros(self, p: AthleteProfile) -> dict:
        base     = {'light': 0.5, 'moderate': 0.8, 'heavy': 1.0}.get(p.intensity, 0.8)
        dur_adj  = 0.2 if p.duration_mins > 90 else (-0.2 if p.duration_mins < 45 else 0.0)
        age_adj  = {'youth': 0.1, 'adult': 0.0, 'veteran': -0.1}.get(p.age_group, 0.0)
        sex_adj  = -0.1 if p.sex.lower() == 'female' else 0.0
        goal_adj = {'muscle_gain': 0.2, 'performance': 0.1, 'recovery': 0.0, 'weight_loss': -0.2}.get(p.goal, 0.0)
        multiplier     = round(max(0.3, min(base + dur_adj + age_adj + sex_adj + goal_adj, 1.5)), 2)
        target_carbs   = round(p.weight_kg * multiplier, 1)
        prot_mult      = 1.6 if p.goal == 'muscle_gain' else 1.2
        if p.age_group == 'veteran': prot_mult += 0.1
        target_protein = round(p.weight_kg * prot_mult, 1)
        return {
            'multiplier': multiplier, 'target_carbs': target_carbs,
            'target_protein': target_protein, 'prot_mult': prot_mult,
            'weight_kg': p.weight_kg,
            'breakdown': f"Base {base} + duration {dur_adj:+} + age {age_adj:+} + sex {sex_adj:+} + goal {goal_adj:+} = {multiplier} g/kg"
        }

    def _get_meal(self, target_carbs: float, p: AthleteProfile) -> dict:
        def safe_sample(df):
            return df.sample(n=1) if not df.empty else pd.DataFrame()

        junk_pattern = 'Biscuit|Mandazi|Corn Flakes|Sweet Bread|Chapati'
        carb_pool = self.food_df[
            self.food_df['Primary Category'].str.contains('Slow Carbohydrate|Fast Carbohydrate|Carbohydrate', case=False, na=False) &
            (self.food_df['Carbs_Parsed'] > 0) &
            (~self.food_df['Food Item'].str.contains(junk_pattern, case=False, na=False)) &
            (~self.food_df['Valid Preparation'].str.contains('Deep Fried', case=False, na=False))
        ].sort_values('Carbs_Parsed', ascending=False).head(15)
        if carb_pool.empty:
            carb_pool = self.food_df[self.food_df['Carbs_Parsed'] > 0].sort_values('Carbs_Parsed', ascending=False).head(15)

        snack_pattern = 'Seeds|Nuts|Peanut Butter|Powder|Oil|Macadamia|Walnut|Almond'
        if p.sex.lower() == 'female':
            prot_pool = self.food_df[
                self.food_df['Primary Category'].str.contains('Lean Protein|Protein|Micronutrient', case=False, na=False) &
                (self.food_df['Protein_Parsed'] > 0) &
                (~self.food_df['Food Item'].str.contains(snack_pattern, case=False, na=False))
            ].sort_values('Protein_Parsed', ascending=False).head(10)
            iron_note = "Iron-rich protein prioritized (ACSM female athlete guidelines)"
        else:
            prot_pool = self.food_df[
                self.food_df['Primary Category'].str.contains('Lean Protein|Protein', case=False, na=False) &
                (self.food_df['Protein_Parsed'] > 0) &
                (~self.food_df['Food Item'].str.contains(snack_pattern, case=False, na=False))
            ].sort_values('Protein_Parsed', ascending=False).head(10)
            iron_note = ""
        if prot_pool.empty:
            prot_pool = self.food_df[self.food_df['Protein_Parsed'] > 0].sort_values('Protein_Parsed', ascending=False).head(10)

        liquid_pool = self.food_df[self.food_df['Primary Category'].str.contains('Hydration', case=False, na=False)]
        if liquid_pool.empty:
            liquid_pool = self.food_df[self.food_df['Food Item'].str.contains('Water|Juice|Milk|Tea|Coconut|Drink', case=False, na=False)]

        carb_choice   = safe_sample(carb_pool)
        prot_choice   = safe_sample(prot_pool)
        liquid_choice = safe_sample(liquid_pool)

        carb_str = "Local starch base"
        if not carb_choice.empty:
            row = carb_choice.iloc[0]
            grams = int(round((target_carbs / row['Carbs_Parsed']) * 100, -1))
            carb_str = f"{row['Food Item'].replace('Raw ', '')}: {grams}g"

        return {
            'carb_str':   carb_str,
            'prot_str':   prot_choice.iloc[0]['Food Item'] if not prot_choice.empty else "Lean protein source",
            'liquid_str': liquid_choice.iloc[0]['Food Item'] if not liquid_choice.empty else "Water with electrolytes",
            'iron_note':  iron_note
        }

    def _generate_plan(self, p: AthleteProfile, macros: dict, meal: dict) -> str:
        rag_query = f"{p.sport} {p.intensity} nutrition {p.goal} {p.sex} {p.age_group}"
        docs = self.retriever.invoke(rag_query)
        rag_context = "\n".join([
            f"[{doc.metadata.get('source','?').split('/')[-1]}]\n{doc.page_content[:300]}"
            for doc in docs
        ])
        return self._llm(f"""
You are a professional sports nutrition AI for East African athletes.
Scientific knowledge base:
{rag_context}

Athlete: {p.sport} | {p.duration_mins:.0f} min | {p.intensity} | {p.sex} | {p.age_group} | {p.goal} | {p.weight_kg}kg

RULES:
1. Start with one direct sentence about their sport + duration + physiological need.
   NEVER use: "Great job!", "As an athlete", "Certainly!", "Sure!", "Here is"
2. Nutrition Tip = food/timing/nutrients ONLY. No exercise or stretching advice.

OUTPUT FORMAT — copy exactly:

[Direct sentence: sport + duration + physiological consequence]

**✅ What Your Body Needs Right Now**
* **Carbohydrates:** {macros['target_carbs']}g
  _{macros['breakdown']}_
* **Protein:** {macros['target_protein']}g
  _({macros['prot_mult']}g/kg × {macros['weight_kg']}kg — ACSM guideline for {p.goal})_
* **Hydration:** Minimum 500ml water + electrolyte replenishment

**🥗 Your Recovery Plate**
* **🍚 Carb Source:** {meal['carb_str']}
* **🍗 Protein Source:** {meal['prot_str']}
* **💧 Hydration:** {meal['liquid_str']}
{f"* **🩸 Iron Note:** {meal['iron_note']}" if meal['iron_note'] else ""}

**💡 Nutrition Tip**
[Specific food/timing tip for {p.sport} {p.goal}. No exercise advice.]
""")

    def chat(self, messages: list) -> tuple:
        conversation  = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
        last_user_msg = messages[-1]['content']
        user_messages = [m for m in messages if m['role'] == 'user']

        # Gatekeeper on first message only
        if len(user_messages) == 1:
            is_sport, reason = self._gatekeeper_check(last_user_msg)
            if not is_sport:
                return (f"😊 {reason}\n\nCome back after your next training session!", False)

        # Extract profile from full conversation
        full_text = " ".join([m['content'] for m in messages if m['role'] == 'user'])
        detected  = self._auto_detect(full_text)
        missing   = detected.get('missing', [])

        # Ask ONE missing field at a time
        priority_order   = ['weight_kg', 'sex', 'age_group', 'duration_mins', 'goal']
        priority_missing = [f for f in priority_order if f in missing]

        if priority_missing:
            next_field = priority_missing[0]
            questions  = {
                "weight_kg":     "⚖️ What's your body weight? (e.g. '70kg' or '154lbs')",
                "duration_mins": f"⏱️ How long was your {detected.get('sport', 'session')}? (e.g. '90 minutes' or '2 hours')",
                "sex":           "👤 Are you male or female? This affects your iron and carbohydrate recommendations.",
                "age_group":     "🎂 How old are you?",
                "goal":          "🎯 What's your main goal? (recovery / muscle gain / weight loss / performance)",
            }
            return (questions[next_field], False)

        # Check if follow-up question or new plan
        if len(user_messages) > 1:
            check = self._llm(f"""
            Conversation: {conversation}
            Is the latest user message a follow-up question about the meal plan, or a new workout description?
            Output ONLY JSON: {{"type": "followup" or "new_plan"}}
            """)
            try:
                msg_type = json.loads(re.search(r'\{.*\}', check, re.DOTALL).group(0)).get('type', 'new_plan')
            except:
                msg_type = 'new_plan'

            if msg_type == 'followup':
                return (self._llm(f"""
                You are a sports nutrition AI for East African athletes.
                Conversation: {conversation}
                Answer the latest question. Be concise, specific, nutrition-focused only.
                Never mention exercise or stretching.
                """), False)

        # Generate full meal plan
        defaults = {"weight_kg": 70.0, "age_group": "adult", "sex": "male",
                    "sport": "general sport", "intensity": "moderate",
                    "duration_mins": 60.0, "goal": "recovery"}
        for k, v in defaults.items():
            if not detected.get(k):
                detected[k] = v

        profile = AthleteProfile(
            weight_kg     = float(detected["weight_kg"]),
            age_group     = detected["age_group"],
            sex           = detected["sex"],
            sport         = detected["sport"],
            intensity     = detected["intensity"],
            duration_mins = float(detected["duration_mins"]),
            goal          = detected["goal"]
        )
        macros = self._calculate_macros(profile)
        meal   = self._get_meal(macros['target_carbs'], profile)
        plan   = self._generate_plan(profile, macros, meal)
        return (plan, True)

# Single instance loaded at startup
agent = NutritionAgent()