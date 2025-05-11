from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from . import models, database
from .database import engine, get_db
from .color_utils import generate_random_color
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
from sqlalchemy import event

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="templates")

# Add this class for request validation
class LoginRequest(BaseModel):
    username: str

# Add this class with the other models
class RankColorRequest(BaseModel):
    username: str
    color: str
    rating: int

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/color_rank", response_class=HTMLResponse)
async def color_rank_page(request: Request):
    return templates.TemplateResponse("color_rank.html", {"request": request})

@app.get("/analytics", response_class=HTMLResponse)
async def analytics_page(request: Request):
    return templates.TemplateResponse("analytics.html", {"request": request})

@app.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user:
        user = models.User(username=request.username, color_rankings={})
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"username": user.username}

@app.get("/get_color/{username}")
async def get_color(username: str, db: Session = Depends(get_db)):
    try:
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Ensure color_rankings is a dictionary
        rankings = user.color_rankings if user.color_rankings is not None else {}
        existing_colors = list(rankings.keys())
        
        new_color = generate_random_color(existing_colors)
        return {"color": new_color}
    except Exception as e:
        print(f"Error in get_color: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rank_color")
async def rank_color(request: RankColorRequest, db: Session = Depends(get_db)):
    if not 1 <= request.rating <= 9:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 9")
    
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Debug logging
    print(f"Before update - User {user.username} rankings: {user.color_rankings}")
    
    # Create a new dictionary with existing rankings plus the new one
    current_rankings = dict(user.color_rankings or {})
    current_rankings[request.color] = request.rating
    
    # Assign the new dictionary to force SQLAlchemy to detect the change
    user.color_rankings = current_rankings
    
    # Commit the changes
    try:
        db.commit()
        print(f"After update - User {user.username} rankings: {user.color_rankings}")
    except Exception as e:
        print(f"Error committing to database: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save ranking")
    
    return {"success": True}

@app.get("/analytics/{username}")
async def get_analytics(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"rankings": user.color_rankings}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=16480, reload=True) 