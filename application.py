# Elastic Beanstalk entry point
from backend.main import app

# WSGI application variable 
application = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(application, host="0.0.0.0", port=8000)