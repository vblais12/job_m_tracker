import os
import psycopg2
from typing import List, Tuple
from dotenv import load_dotenv
from transformers import AutoModelForTokenClassification, AutoTokenizer, pipeline
from backend.data.skills_dic import SPECIAL_UPPER, ALIASES, SKILL_BLACKLIST, SKILLS_DIC

load_dotenv()


# DB CRED
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")

# MODEL
MODEL_ID = os.getenv('MODEL', 'ihk/skillner')  # get model
DEVICE = 0 if os.getenv("USE_GPU") == "1" else -1    # Define processing unit (GPU should be default)



# Adds a table to our database. Table includes job_id and extracted skills from job desc
def DB_migration(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD):

    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    with conn.cursor() as c:

        c.execute("""
            CREATE TABLE IF NOT EXISTS job_skills (
                job_id TEXT NOT NULL,
                skill  TEXT NOT NULL,
                confidence REAL,
                search_query TEXT,
                source_model TEXT,
                PRIMARY KEY (job_id, skill),
                FOREIGN KEY (job_id) REFERENCES job_listings(id)
            )
        """)

    conn.commit()
    conn.close()



# Function to split input text (job desc) into smaller chunks to stay within token limits
# This function also attempts to split at end of a sentence if possible, else just hard splits
def chunk_text(text, max_chars = 1000) -> List[str]:

    text = (text or "").strip()
    # If no desc, return empty list (no skills to extract)
    if not text:
        return []
    # If the desc is short enough, simply return that in a single chunk
    if len(text) < max_chars:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        cut = text.rfind(".", start, end)  # Avoid splitting mid sentence. Finds occurence of last period (.) and splits there
        if cut == -1 or cut < (start + (0.5 * max_chars)):   # if no period found or if period is too early in the current chunk (<50%), just cut at end
            cut = end
        else:
            cut += 1   # cut right after the period
        chunks.append(text[start:cut].strip())   # appends chunk
        start = cut
    return [chunk for chunk in chunks if chunk] # Returns list of chunks



# Function nornmalizes all skills for consistency and use for dashboard/predictions later
def normalize_skill(skill):

    skill = (skill or "").strip()
    # Handles if skill is empty after strip
    if not skill:
        return skill
    skill = " ".join(skill.split())
    lower = skill.lower()
    if lower in ALIASES:       # returns ALIAS 
        return ALIASES[lower]
    if skill.upper() in SPECIAL_UPPER:   # Returns all uppercase
        return skill.upper()
    title = skill.title()   # First letter uppercase


    return title


# Function tests a skill to make sure it is valid. Checks against a pre-defined BLACKLIST, also checks if skill < 2 character and not in SPECIAL_UPPER
def is_valid_skill(skill):
    if not skill:
        return False
    skill_lower = skill.lower()
    if skill_lower in SKILL_BLACKLIST:
        return False
    if len(skill) < 2 and skill.upper() not in SPECIAL_UPPER:
        return False
    if skill not in SKILLS_DIC:
        return False
    
    # Default return (passed all tests)
    return True
    


# Function that handles duplicate skills (i.e, "python" vs "Python"), keeps the one with highest confidence score
# Also checks if skill is valid
def sort_skills(skills):
    best = {}
    for s, score in skills:
        skill = normalize_skill(s)
        if not is_valid_skill(skill):
            continue
        if skill not in best or score > best[skill]:
            best[skill] = score
    # Returns a sorted list. First sorts by confidence score (descending order), then alphabetically
    return sorted(best.items(), key=lambda x: (-x[1], x[0].lower()))  



# Function initializes and returns a hugging face token-classification pipeline ready to process job descriptions
def build_pipeline():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model = AutoModelForTokenClassification.from_pretrained(MODEL_ID)
    NLP = pipeline(
        "token-classification",
        model = model,
        tokenizer = tokenizer,
        aggregation_strategy="simple",   # merge consecutive tokens flagged as part of the same SKILL in a single span
        device = DEVICE
    )

    return NLP



# Should've documented this when i wrote it because i honestly forgot it all
def extract_skills(NLP, text):

    # Handle empty job desc
    if not text:
        return []
    
    skills = []

    chunks = chunk_text(text)

    for chunk in chunks:
        entities = NLP(chunk)

        current_skill = ""
        current_scores = []

        for ent in entities:
            token = ent['word']

            if ent.get('entity_group') == 'SKILL':
                if token.startswith('##'):
                    current_skill += token[2:]
                else:
                    if current_skill:
                        avg_score = sum(current_scores) / len(current_scores)
                        skills.append((current_skill, avg_score))
                    current_skill = token
                    current_scores = []
                current_scores.append(ent['score'])

            elif token.startswith('##') and current_skill:
                current_skill += token[2:]
                current_scores.append(ent['score'])
            
            else:
                if current_skill:
                    avg_score = sum(current_scores) / len(current_scores)
                    skills.append((current_skill, avg_score))
                    current_skill = ""
                    current_scores = []
        
        # In case last token is a skill
        if current_skill:
            avg_score = sum(current_scores) / len(current_scores)
            skills.append((current_skill, avg_score))
        
    
    # Normalize skills and handle duplicates
    normalized_skills = [(normalize_skill(s), score) for s, score in skills]


    return sort_skills(normalized_skills)
