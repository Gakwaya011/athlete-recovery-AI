import os, re, json, random, pandas as pd
from dataclasses import dataclass
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.config import settings

# ── Paths ──
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
            temperature = 0.3,
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

    def _is_small_talk(self, text: str) -> bool:
        small_talk_patterns = [
            r'^(hi+|hello|hey|hii|sup|yo|howdy|greetings)[\s!.]*$',
            r'^(good\s?(morning|evening|afternoon|night))[\s!.]*$',
            r'^(thanks?|thank you|thx|ty)[\s!.]*$',
            r'^(ok(ay)?|sure|alright|got it|cool|great|nice|perfect)[\s!.]*$',
            r'^(bye|goodbye|see you|cya|later|take care)[\s!.]*$',
            r'^(yes|no|yeah|nah|yep|nope)[\s!.]*$',
        ]
        cleaned = text.strip().lower()
        return any(re.match(p, cleaned) for p in small_talk_patterns)

    def _gatekeeper_check(self, text: str):
        raw = self._llm(f"""
You are a strict sports nutrition assistant gatekeeper.

Analyze this message: "{text}"

RULES:
- Only return is_sport=true for REAL physical exercise or sport activities that require sports nutrition.
- ACCEPTED: football, basketball, running, gym, cycling, swimming, rugby, volleyball, boxing, wrestling, hiking, yoga, martial arts, athletics, tennis, weightlifting, CrossFit, HIIT, or any real sport/exercise.
- REJECTED: casual games like hide and seek, board games, video games, watching sports, non-physical activities, greetings, random questions, jokes, coding, working, studying, anything that is NOT real physical exercise.
- If unsure, reject it.

Output ONLY valid JSON, nothing else:
{{"is_sport": true or false, "reason": "one short friendly sentence explaining why if false"}}
        """)
        try:
            d = json.loads(re.search(r'\{.*\}', raw, re.DOTALL).group(0))
            return d.get('is_sport', False), d.get('reason', '')
        except:
            return False, "I can only help with real sports and exercise nutrition."

    def _auto_detect(self, text: str) -> dict:
        raw = self._llm(f"""
Analyze this athlete description and extract every field possible: "{text}"

EXTRACTION RULES:
- sport name → "sport"
- hours/minutes → "duration_mins" (convert hours to minutes, e.g. "2 hours" = 120)
- kg/lbs number → "weight_kg" (convert lbs: divide by 2.2)
- age number → "age_group": youth(<18), adult(18-40), veteran(>40)
- IMPORTANT: Do NOT infer sex from context. Only extract sex if the user explicitly says male/female/man/woman/boy/girl. If not explicitly stated, add "sex" to missing array.
- recovery/muscle/weight loss/performance → "goal"

INTENSITY RULES (be strict):
- football/soccer/basketball/rugby/boxing/sprinting/HIIT/CrossFit = "heavy"
- gym/weightlifting/cycling/swimming/jogging/tennis/volleyball = "moderate"
- walking/yoga/stretching/light exercise = "light"

GOAL RULES:
- "build muscle" / "muscle gain" / "gain mass" → goal: "muscle_gain"
- "lose weight" / "cut" / "weight loss" → goal: "weight_loss"
- "performance" / "energy" / "speed" → goal: "performance"
- default → goal: "recovery"

Only add field to "missing" array if truly not mentioned.

Output ONLY valid JSON:
{{"weight_kg": 68.0, "age_group": "adult", "sex": "male", "sport": "basketball", "intensity": "heavy", "duration_mins": 180.0, "goal": "recovery", "missing": []}}
        """)
        try:
            return json.loads(re.search(r'\{.*\}', raw, re.DOTALL).group(0))
        except:
            return {"weight_kg": None, "age_group": None, "sex": None, "sport": "sport",
                    "intensity": "moderate", "duration_mins": None, "goal": "recovery",
                    "missing": ["weight_kg", "sex", "age_group", "duration_mins"]}

    def _calculate_macros(self, p: AthleteProfile) -> dict:
        base = {'light': 0.4, 'moderate': 0.7, 'heavy': 1.0}.get(p.intensity, 0.7)

        if p.duration_mins >= 90:
            dur_adj = 0.2
        elif p.duration_mins >= 45:
            dur_adj = 0.0
        else:
            dur_adj = -0.15

        age_adj  = {'youth': 0.1, 'adult': 0.0, 'veteran': -0.1}.get(p.age_group, 0.0)
        sex_adj  = -0.1 if p.sex.lower() == 'female' else 0.0
        goal_adj = {'muscle_gain': 0.2, 'performance': 0.1, 'recovery': 0.0, 'weight_loss': -0.2}.get(p.goal, 0.0)

        multiplier   = round(max(0.3, min(base + dur_adj + age_adj + sex_adj + goal_adj, 1.6)), 2)
        target_carbs = round(p.weight_kg * multiplier, 1)

        # Protein multiplier — intensity boost only for non-recovery goals
        prot_mult = {
            'muscle_gain': 1.8,
            'performance': 1.4,
            'recovery':    1.2,
            'weight_loss': 1.3,
        }.get(p.goal, 1.2)

        # Only boost protein for intensity if athlete is training for more than recovery
        if p.intensity == 'heavy' and p.goal != 'recovery':
            prot_mult = min(prot_mult + 0.2, 2.0)
        if p.age_group == 'veteran':
            prot_mult = min(prot_mult + 0.1, 2.0)

        target_protein = round(p.weight_kg * prot_mult, 1)

        return {
            'multiplier':     multiplier,
            'target_carbs':   target_carbs,
            'target_protein': target_protein,
            'prot_mult':      prot_mult,
            'weight_kg':      p.weight_kg,
            'breakdown':      f"Base {base} + duration {dur_adj:+} + age {age_adj:+} + sex {sex_adj:+} + goal {goal_adj:+} = {multiplier} g/kg"
        }

    def _get_meal(self, target_carbs: float, p: AthleteProfile) -> dict:
        def safe_sample(df):
            return df.sample(n=1) if not df.empty else pd.DataFrame()

        # Block junk, non-staple, and ALL fried foods
        junk_pattern = 'Biscuit|Mandazi|Corn Flakes|Sweet Bread|Chapati|Raisin|Amaranth|Sorghum|Millet|Pilau|Flatbread'
        carb_pool = self.food_df[
            self.food_df['Primary Category'].str.contains('Slow Carbohydrate|Fast Carbohydrate|Carbohydrate', case=False, na=False) &
            (self.food_df['Carbs_Parsed'] > 0) &
            (~self.food_df['Food Item'].str.contains(junk_pattern, case=False, na=False)) &
            (~self.food_df['Food Item'].str.contains('Fried', case=False, na=False)) &
            (~self.food_df['Valid Preparation'].str.contains('Deep Fried|Fried', case=False, na=False))
        ].sort_values('Carbs_Parsed', ascending=False).head(20)

        # Prefer real athlete staple foods
        preferred_staples = 'Ugali|Rice|Sweet Potato|Potato|Cassava|Matoke|Banana|Maize|Yam'
        staple_pool = carb_pool[carb_pool['Food Item'].str.contains(preferred_staples, case=False, na=False)]
        if not staple_pool.empty:
            carb_pool = staple_pool
        elif carb_pool.empty:
            carb_pool = self.food_df[
                (self.food_df['Carbs_Parsed'] > 0) &
                (~self.food_df['Food Item'].str.contains('Fried', case=False, na=False))
            ].sort_values('Carbs_Parsed', ascending=False).head(15)

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

        # Hydration — block milk and dairy
        liquid_pool = self.food_df[
            self.food_df['Primary Category'].str.contains('Hydration', case=False, na=False) &
            (~self.food_df['Food Item'].str.contains('Milk|Dairy|Yogurt|Ikivuguto|Inshyushyu', case=False, na=False))
        ]
        if liquid_pool.empty:
            liquid_pool = self.food_df[
                self.food_df['Food Item'].str.contains('Water|Juice|Tea|Coconut|Drink', case=False, na=False) &
                (~self.food_df['Food Item'].str.contains('Milk|Dairy|Yogurt', case=False, na=False))
            ]

        carb_choice   = safe_sample(carb_pool)
        prot_choice   = safe_sample(prot_pool)
        liquid_choice = safe_sample(liquid_pool)

        carb_str = "Local starch base"
        if not carb_choice.empty:
            row   = carb_choice.iloc[0]
            grams = int(round((target_carbs / row['Carbs_Parsed']) * 100, -1))
            grams = max(50, min(grams, 500))
            carb_str = f"{row['Food Item'].replace('Raw ', '').replace('Boiled ', '')}: {grams}g"

        return {
            'carb_str':   carb_str,
            'prot_str':   prot_choice.iloc[0]['Food Item'] if not prot_choice.empty else "Lean protein source",
            'liquid_str': liquid_choice.iloc[0]['Food Item'] if not liquid_choice.empty else "Water with electrolytes",
            'iron_note':  iron_note
        }

    def _get_rag_sources(self, p: AthleteProfile) -> tuple:
        """Retrieve RAG docs and return context + source names for grounded citation."""
        rag_query   = f"{p.sport} {p.intensity} nutrition {p.goal} {p.sex} {p.age_group}"
        docs        = self.retriever.invoke(rag_query)
        rag_context = "\n\n".join([
            f"[SOURCE {i+1} — {doc.metadata.get('source','?').split('/')[-1]}]\n{doc.page_content[:400]}"
            for i, doc in enumerate(docs)
        ])
        source_names = list({doc.metadata.get('source','?').split('/')[-1] for doc in docs})
        return rag_context, source_names

    def _generate_plan(self, p: AthleteProfile, macros: dict, meal: dict) -> str:
        rag_context, source_names = self._get_rag_sources(p)
        sources_display = ", ".join(source_names) if source_names else "ACSM guidelines"

        return self._llm(f"""
You are a professional sports nutrition AI for East African athletes.

RETRIEVED SCIENTIFIC DOCUMENTS — your Nutrition Tip MUST be grounded in these documents only:
{rag_context}

---
Athlete: {p.sport} | {p.duration_mins:.0f} min | {p.intensity} intensity | {p.sex} | {p.age_group} | goal: {p.goal} | {p.weight_kg}kg

STRICT RULES:
1. Start with ONE direct sentence about their sport + duration + specific physiological consequence (glycogen depletion, muscle protein breakdown, dehydration).
   NEVER start with: "Great job!", "As an athlete", "Certainly!", "Sure!", "Here is", "I recommend"
2. The Nutrition Tip MUST directly quote or paraphrase a specific finding from the retrieved documents above.
   State EXACTLY which source supports it using the source filename.
   NEVER invent citations. ONLY cite sources that appear in the retrieved documents above.
   Available sources: {sources_display}
3. Nutrition Tip = food and timing advice ONLY. No exercise, stretching, or sleep advice.
4. Do NOT repeat the meal plan items in the nutrition tip.

OUTPUT FORMAT — copy exactly:

[One direct sentence: sport + duration + physiological consequence]

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
[1-2 sentences grounded in the retrieved documents. Include source filename in parentheses. No exercise advice.]

_📚 Sources: {sources_display}_
""")

    def chat(self, messages: list) -> tuple:
        conversation       = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
        last_user_msg      = messages[-1]['content']
        user_messages      = [m for m in messages if m['role'] == 'user']
        assistant_messages = [m for m in messages if m['role'] == 'assistant']

        # Check if a full plan has already been delivered
        plan_generated = any('What Your Body Needs' in m['content'] for m in assistant_messages)

        # ── POST-PLAN: handle follow-ups and small talk ──
        if plan_generated:
            if self._is_small_talk(last_user_msg):
                return (random.choice([
                    "Happy to help! Come back after your next session. 💪",
                    "You're welcome! Rest well and eat right. 🥗",
                    "Anytime! Good luck with your recovery. 🙌",
                ]), False)

            check = self._llm(f"""
Conversation: {conversation}
Is the latest user message a follow-up nutrition question about the meal plan already given, OR a completely new workout description?
Output ONLY JSON: {{"type": "followup" or "new_plan"}}
            """)
            try:
                msg_type = json.loads(re.search(r'\{.*\}', check, re.DOTALL).group(0)).get('type', 'followup')
            except:
                msg_type = 'followup'

            if msg_type == 'followup':
                return (self._llm(f"""
You are a sports nutrition AI for East African athletes.
Conversation: {conversation}
Answer the latest question concisely. Nutrition-focused only.
Never mention exercise or stretching. Never invent citations.
Only reference sources if they were already cited in this conversation.
                """), False)
            else:
                # New workout — run gatekeeper before proceeding
                is_sport, reason = self._gatekeeper_check(last_user_msg)
                if not is_sport:
                    return (f"😊 {reason}\n\nTell me about your next real workout and I'll build a new plan! 💪", False)
                # Fall through to collect fresh profile below

        # ── PRE-PLAN small talk ──
        if self._is_small_talk(last_user_msg):
            return ("👋 Hi! Tell me about your workout or training session and I'll build you a personalised recovery meal plan!", False)

        # ── GATEKEEPER — only on the FIRST real (non-small-talk) message ──
        non_small_talk_msgs = [m['content'] for m in user_messages if not self._is_small_talk(m['content'])]
        if len(non_small_talk_msgs) == 1 and non_small_talk_msgs[0] == last_user_msg:
            is_sport, reason = self._gatekeeper_check(last_user_msg)
            if not is_sport:
                return (f"😊 {reason}\n\nI'm designed specifically for real sports and exercise recovery. Tell me about your next workout and I'll build you a personalised meal plan! 💪", False)

        # ── PROFILE COLLECTION ──
        full_text = " ".join([m['content'] for m in user_messages])
        detected  = self._auto_detect(full_text)
        missing   = detected.get('missing', [])

        # Always explicitly ask sex — never infer from context
        if detected.get('sex') not in ['male', 'female']:
            if 'sex' not in missing:
                missing.append('sex')

        priority_order   = ['weight_kg', 'sex', 'age_group', 'duration_mins', 'goal']
        priority_missing = [f for f in priority_order if f in missing]

        if priority_missing:
            next_field = priority_missing[0]
            questions  = {
                "weight_kg":     "⚖️ What's your body weight? (e.g. '70kg' or '154lbs')",
                "duration_mins": f"⏱️ How long was your {detected.get('sport', 'session')}? (e.g. '90 minutes' or '2 hours')",
                "sex":           "👤 Are you male or female? This helps with your iron and carbohydrate recommendations.",
                "age_group":     "🎂 How old are you?",
                "goal":          "🎯 What's your main goal? (recovery / muscle gain / weight loss / performance)",
            }
            return (questions[next_field], False)

        # ── GENERATE PLAN ──
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