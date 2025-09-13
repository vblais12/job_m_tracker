
from data.skills_dic import US_CITIES, CA_CITIES


# TODO: FINISH THIS
def fetch_salary(country: str, role: str):
    
    url = "https://jsearch.p.rapidapi.com/estimated-salary"
    if country == "US":
        cities = US_CITIES

        for city in cities:
            params = {
                "job_title": role,
                "location": city,
                "fields": ["min_salary", "min_base_salary", "median_base_salary", "median_salary"]
            }



