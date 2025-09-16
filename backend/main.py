from fastapi import FastAPI, HTTPException, Depends
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .scraper import job_counts
from .analysis import top_skills, remote_vs_onsite, geographic_distribution
from .process_skills import top_skills_per_query
from .salary import query_salaries
from .recent_info import get_recent_listings
from .models import *

app = FastAPI()


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)



@app.get('/')
def main():
    return {"name" : "Viktor Blais"}


# ACTUAL API ROUTE FOR PROJECT

# Get total job count and count per query/role
@app.get('/job_listings/counts')
def job_count(location = "US"):
    try:
        count = job_counts(location=location)
        return count
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get top skills
@app.get('/skills/top', response_model=SkillsResponse)
def get_top_skils(request: SkillsRequest = Depends()):
    try:
        if request.role:
            df = top_skills(role = request.role, top_k = request.top_k)
            # Convert DF to list of skill objects
            skills_data = df.to_dict(orient="records")
            skills_list = [{"search_query": request.role, "skills": skills_data}]
        else:
            skills_dic = top_skills_per_query(top_n = request.top_k)
            skills_list = [
                {
                    "search_query": query, 
                    "skills": [{"skill": skill, "freq": freq} for skill, freq in skill_list]
                }
                for query, skill_list in skills_dic.items()
            ]
        return SkillsResponse(skills=skills_list, role = request.role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Gets data for remote vs onsite position
@app.get("/remote_v_onsite")
def remote_v_onsite():
    df = remote_vs_onsite()
    dict = df.to_dict(orient="records")
    return {"data": dict}


# Get geographic distribution by state/province/territory
@app.get("/geographic_distribution")
def get_geographic_distribution(location:str = None):
    df = geographic_distribution(location=location)
    dict = df.to_dict(orient="records")
    return {"data": dict}


# Get salary data
@app.get("/salaries")
def get_salary_data(location:str = None):
    df = query_salaries(location=location)
    dict = df.to_dict(orient="records")
    return {"data": dict}


# Returns info for recent job listings
@app.get("/recent_listings")
def get_listings(location:str = None):
    df = get_recent_listings(location=location)
    dict = df.to_dict(orient="records")
    return {"data": dict}



## END
