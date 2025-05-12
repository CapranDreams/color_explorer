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
import os
import random

# Get the base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount("/colorgame/static", StaticFiles(directory=os.path.join(BASE_DIR, "app", "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# Add this class for request validation
class LoginRequest(BaseModel):
    username: str

# Add this class with the other models
class RankColorRequest(BaseModel):
    username: str
    color: str
    rating: int

@app.get("/colorgame/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/colorgame/color_rank", response_class=HTMLResponse)
async def color_rank_page(request: Request):
    return templates.TemplateResponse("color_rank.html", {"request": request})

@app.get("/colorgame/analytics", response_class=HTMLResponse)
async def analytics_page(request: Request):
    return templates.TemplateResponse("analytics.html", {"request": request})

@app.post("/colorgame/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user:
        user = models.User(username=request.username, color_rankings={})
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"username": user.username}

def rgb_to_hsv(r, g, b):
    r, g, b = r/255, g/255, b/255
    max_val = max(r, g, b)
    min_val = min(r, g, b)
    diff = max_val - min_val

    if max_val == min_val:
        h = 0
    elif max_val == r:
        h = (60 * ((g-b)/diff) + 360) % 360
    elif max_val == g:
        h = (60 * ((b-r)/diff) + 120) % 360
    else:
        h = (60 * ((r-g)/diff) + 240) % 360

    s = 0 if max_val == 0 else (diff / max_val)
    v = max_val
    return h, s, v

def generate_color_in_category(category):
    max_attempts = 250
    for _ in range(max_attempts):
        r = random.randint(0, 255)
        g = random.randint(0, 255)
        b = random.randint(0, 255)
        h, s, v = rgb_to_hsv(r, g, b)
        
        # Standard HSV color wheel segments
        if category == 'random':
            return f"#{r:02x}{g:02x}{b:02x}"
            
        # Dark colors: any hue, moderate-high saturation, very low value
        elif category == 'dark' and 0.3 <= s <= 0.8 and v <= 0.3:
            return f"#{r:02x}{g:02x}{b:02x}"
            
        # Light colors: any hue, very low saturation, very high value
        elif category == 'light' and s <= 0.3 and v >= 0.8:
            return f"#{r:02x}{g:02x}{b:02x}"
        
        # Red: hue 345-15, high saturation and value
        elif category == 'red' and (h >= 345 or h <= 15) and s >= 0.7 and v >= 0.5:
            return f"#{r:02x}{g:02x}{b:02x}"
        
        # Orange: hue 15-45, high saturation and value
        elif category == 'orange' and 15 < h <= 45 and s >= 0.7 and v >= 0.5:
            return f"#{r:02x}{g:02x}{b:02x}"
        
        # Yellow: hue 45-75, high saturation and value
        elif category == 'yellow' and 45 < h <= 75 and s >= 0.5 and v >= 0.8:
            return f"#{r:02x}{g:02x}{b:02x}"
        
        # Green: hue 75-165, moderate-high saturation and value
        elif category == 'green' and 75 < h <= 165 and s >= 0.5 and v >= 0.4:
            return f"#{r:02x}{g:02x}{b:02x}"
        
        # Cyan: hue 165-195, high saturation and value
        elif category == 'cyan' and 165 < h <= 195 and s >= 0.6 and v >= 0.6:
            return f"#{r:02x}{g:02x}{b:02x}"
        
        # Blue: hue 195-255, high saturation and value
        elif category == 'blue' and 195 < h <= 255 and s >= 0.6 and v >= 0.5:
            return f"#{r:02x}{g:02x}{b:02x}"
        
        # Purple: hue 255-285, moderate-high saturation and value
        elif category == 'purple' and 255 < h <= 285 and s >= 0.4 and v >= 0.4:
            return f"#{r:02x}{g:02x}{b:02x}"
        
        # Pink: hue 285-345, high saturation, high value
        elif category == 'pink' and 285 < h <= 345 and s >= 0.3 and v >= 0.8:
            return f"#{r:02x}{g:02x}{b:02x}"
        
        # Earth tones: muted natural colors
        # Includes browns, tans, warm grays, forest greens, clay reds
        elif category == 'earth' and (
            # Browns and tans (orange-red hues)
            ((0 <= h <= 45) and 0.2 <= s <= 0.6 and 0.2 <= v <= 0.7) or
            # Forest greens
            ((70 <= h <= 150) and 0.2 <= s <= 0.5 and 0.2 <= v <= 0.5) or
            # Clay reds and burgundies
            ((345 <= h <= 360) and 0.2 <= s <= 0.5 and 0.2 <= v <= 0.6)
        ):
            return f"#{r:02x}{g:02x}{b:02x}"

    # Update fallback ranges
    h_ranges = {
        'red': (0, 15),
        'orange': (15, 45),
        'yellow': (45, 75),
        'green': (75, 165),
        'cyan': (165, 195),
        'blue': (195, 255),
        'purple': (255, 285),
        'pink': (285, 345),
        'dark': (0, 360),  # Any hue for dark
        'light': (0, 360), # Any hue for light
        'earth': [(0, 45), (70, 150), (345, 360)]
    }
    
    if category == 'dark':
        h = random.uniform(0, 360)
        s = random.uniform(0.3, 0.9)
        v = random.uniform(0.05, 0.15)  # Very dark
    elif category == 'light':
        h = random.uniform(0, 360)
        s = random.uniform(0.0, 0.15)   # Very desaturated
        v = random.uniform(0.9, 1.0)    # Very bright
    elif category == 'earth':
        # Randomly choose one of the earth tone ranges
        h_range = random.choice(h_ranges['earth'])
        h = random.uniform(h_range[0], h_range[1])
        s = random.uniform(0.2, 0.6)  # Muted saturation
        v = random.uniform(0.2, 0.7)  # Moderate value
    elif category in h_ranges:
        h_min, h_max = h_ranges[category]
        h = random.uniform(h_min, h_max)
        s = random.uniform(0.5, 1.0)
        v = random.uniform(0.5, 1.0)
        
        # Convert HSV back to RGB
        c = v * s
        x = c * (1 - abs((h / 60) % 2 - 1))
        m = v - c
        
        if h < 60:
            r, g, b = c, x, 0
        elif h < 120:
            r, g, b = x, c, 0
        elif h < 180:
            r, g, b = 0, c, x
        elif h < 240:
            r, g, b = 0, x, c
        elif h < 300:
            r, g, b = x, 0, c
        else:
            r, g, b = c, 0, x
            
        r = int((r + m) * 255)
        g = int((g + m) * 255)
        b = int((b + m) * 255)
        
        return f"#{r:02x}{g:02x}{b:02x}"
    
    return f"#{random.randint(0, 0xFFFFFF):06x}"

@app.get("/colorgame/get_color/{username}")
async def get_color(username: str, mode: str = 'random'):
    color = generate_color_in_category(mode)
    return {"color": color}

@app.post("/colorgame/rank_color")
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

@app.get("/colorgame/analytics/{username}")
async def get_analytics(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"rankings": user.color_rankings}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=16480, reload=True) 