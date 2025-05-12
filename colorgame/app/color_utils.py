import random
import colorsys
import numpy as np
from colormath.color_objects import LabColor, sRGBColor
from colormath.color_conversions import convert_color
from colormath.color_diff import delta_e_cie2000

def hex_to_lab(hex_color):
    """Convert hex color to LAB color space"""
    hex_color = hex_color.lstrip('#')
    rgb = tuple(int(hex_color[i:i+2], 16)/255 for i in (0, 2, 4))
    rgb_color = sRGBColor(*rgb)
    lab_color = convert_color(rgb_color, LabColor)
    return lab_color

def lab_to_hex(lab_color):
    """Convert LAB color to hex"""
    rgb_color = convert_color(lab_color, sRGBColor)
    rgb_values = (
        min(255, max(0, round(rgb_color.rgb_r * 255))),
        min(255, max(0, round(rgb_color.rgb_g * 255))),
        min(255, max(0, round(rgb_color.rgb_b * 255)))
    )
    return f'#{rgb_values[0]:02x}{rgb_values[1]:02x}{rgb_values[2]:02x}'

def generate_random_color(existing_colors=None):
    """Generate a random hex color that hasn't been used before."""
    if existing_colors is None:
        existing_colors = []
    
    def random_hex_color():
        r = random.randint(0, 255)
        g = random.randint(0, 255)
        b = random.randint(0, 255)
        return f"#{r:02x}{g:02x}{b:02x}"

    # Try to generate a unique color
    max_attempts = 100
    for _ in range(max_attempts):
        color = random_hex_color()
        if color not in existing_colors:
            return color
            
    # If we couldn't find a unique color, just return a random one
    return random_hex_color() 