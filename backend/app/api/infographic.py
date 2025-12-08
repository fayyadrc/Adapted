from flask import Blueprint, jsonify, request, current_app
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import os
import matplotlib
import random
import re

import matplotlib.pyplot as plt
from ..utils.text_extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.ai_service import generate_infographic_data_from_text
from ..services.canva_service import create_design_autofill_job, poll_design_autofill_job
matplotlib.use('Agg')
infographic_bp = Blueprint('infographic', __name__)

# --- THEME PRESETS ---
THEME_PRESETS = {
    'modern_dark': {
        'name': 'Modern Dark',
        'bg': '#0f172a',           # Slate-900
        'header_bg': '#1e293b',    # Slate-800
        'secondary_bg': '#1e293b', # Slate-800
        'card_bg': '#334155',      # Slate-700
        'accent': '#f97316',       # Orange-500
        'accent_secondary': '#fb923c', # Orange-400
        'text_dark': '#f8fafc',    # Slate-50
        'text_light': '#94a3b8',   # Slate-400
        'text_white': '#ffffff',
        'chart_bg': '#475569',     # Slate-600
        'border_radius': 16,
        'card_style': 'elevated',  # elevated, flat, bordered
        'stat_style': 'donut',     # donut, bar, number
    },
    'ocean_breeze': {
        'name': 'Ocean Breeze',
        'bg': '#f0f9ff',           # Sky-50
        'header_bg': '#0c4a6e',    # Sky-900
        'secondary_bg': '#e0f2fe', # Sky-100
        'card_bg': '#ffffff',
        'accent': '#0ea5e9',       # Sky-500
        'accent_secondary': '#38bdf8', # Sky-400
        'text_dark': '#0c4a6e',    # Sky-900
        'text_light': '#64748b',   # Slate-500
        'text_white': '#ffffff',
        'chart_bg': '#bae6fd',     # Sky-200
        'border_radius': 20,
        'card_style': 'bordered',
        'stat_style': 'donut',
    },
    'forest_green': {
        'name': 'Forest Green',
        'bg': '#f0fdf4',           # Green-50
        'header_bg': '#14532d',    # Green-900
        'secondary_bg': '#dcfce7', # Green-100
        'card_bg': '#ffffff',
        'accent': '#22c55e',       # Green-500
        'accent_secondary': '#4ade80', # Green-400
        'text_dark': '#14532d',    # Green-900
        'text_light': '#4b5563',   # Gray-600
        'text_white': '#ffffff',
        'chart_bg': '#bbf7d0',     # Green-200
        'border_radius': 12,
        'card_style': 'flat',
        'stat_style': 'bar',
    },
    'sunset_warm': {
        'name': 'Sunset Warm',
        'bg': '#fffbeb',           # Amber-50
        'header_bg': '#78350f',    # Amber-900
        'secondary_bg': '#fef3c7', # Amber-100
        'card_bg': '#ffffff',
        'accent': '#f59e0b',       # Amber-500
        'accent_secondary': '#fbbf24', # Amber-400
        'text_dark': '#78350f',    # Amber-900
        'text_light': '#57534e',   # Stone-600
        'text_white': '#ffffff',
        'chart_bg': '#fde68a',     # Amber-200
        'border_radius': 8,
        'card_style': 'elevated',
        'stat_style': 'number',
    },
    'royal_purple': {
        'name': 'Royal Purple',
        'bg': '#faf5ff',           # Purple-50
        'header_bg': '#581c87',    # Purple-900
        'secondary_bg': '#f3e8ff', # Purple-100
        'card_bg': '#ffffff',
        'accent': '#a855f7',       # Purple-500
        'accent_secondary': '#c084fc', # Purple-400
        'text_dark': '#581c87',    # Purple-900
        'text_light': '#6b7280',   # Gray-500
        'text_white': '#ffffff',
        'chart_bg': '#e9d5ff',     # Purple-200
        'border_radius': 24,
        'card_style': 'bordered',
        'stat_style': 'donut',
    },
    'coral_reef': {
        'name': 'Coral Reef',
        'bg': '#fff1f2',           # Rose-50
        'header_bg': '#9f1239',    # Rose-800
        'secondary_bg': '#ffe4e6', # Rose-100
        'card_bg': '#ffffff',
        'accent': '#f43f5e',       # Rose-500
        'accent_secondary': '#fb7185', # Rose-400
        'text_dark': '#881337',    # Rose-900
        'text_light': '#71717a',   # Zinc-500
        'text_white': '#ffffff',
        'chart_bg': '#fecdd3',     # Rose-200
        'border_radius': 16,
        'card_style': 'flat',
        'stat_style': 'donut',
    },
    'midnight_blue': {
        'name': 'Midnight Blue',
        'bg': '#020617',           # Slate-950
        'header_bg': '#1e3a8a',    # Blue-900
        'secondary_bg': '#0f172a', # Slate-900
        'card_bg': '#1e293b',      # Slate-800
        'accent': '#3b82f6',       # Blue-500
        'accent_secondary': '#60a5fa', # Blue-400
        'text_dark': '#e2e8f0',    # Slate-200
        'text_light': '#94a3b8',   # Slate-400
        'text_white': '#ffffff',
        'chart_bg': '#334155',     # Slate-700
        'border_radius': 12,
        'card_style': 'elevated',
        'stat_style': 'bar',
    },
    'minimalist': {
        'name': 'Minimalist',
        'bg': '#ffffff',
        'header_bg': '#18181b',    # Zinc-900
        'secondary_bg': '#f4f4f5', # Zinc-100
        'card_bg': '#ffffff',
        'accent': '#18181b',       # Zinc-900
        'accent_secondary': '#3f3f46', # Zinc-700
        'text_dark': '#18181b',    # Zinc-900
        'text_light': '#71717a',   # Zinc-500
        'text_white': '#ffffff',
        'chart_bg': '#e4e4e7',     # Zinc-200
        'border_radius': 4,
        'card_style': 'bordered',
        'stat_style': 'number',
    },
}

# Content category keywords for smart theme selection
CONTENT_CATEGORIES = {
    'technology': {
        'keywords': ['software', 'code', 'programming', 'ai', 'machine learning', 'data', 'computer', 'digital', 'tech', 'algorithm', 'api', 'cloud', 'cyber'],
        'themes': ['modern_dark', 'midnight_blue', 'minimalist']
    },
    'nature': {
        'keywords': ['environment', 'climate', 'plant', 'animal', 'ecosystem', 'nature', 'green', 'sustainable', 'organic', 'wildlife', 'forest', 'ocean'],
        'themes': ['forest_green', 'ocean_breeze']
    },
    'business': {
        'keywords': ['business', 'finance', 'market', 'economy', 'profit', 'revenue', 'company', 'corporate', 'investment', 'strategy', 'management'],
        'themes': ['minimalist', 'modern_dark', 'midnight_blue']
    },
    'health': {
        'keywords': ['health', 'medical', 'wellness', 'fitness', 'mental', 'therapy', 'disease', 'treatment', 'patient', 'hospital', 'doctor'],
        'themes': ['ocean_breeze', 'coral_reef', 'forest_green']
    },
    'creative': {
        'keywords': ['art', 'design', 'creative', 'music', 'culture', 'style', 'fashion', 'aesthetic', 'visual', 'media', 'entertainment'],
        'themes': ['royal_purple', 'coral_reef', 'sunset_warm']
    },
    'education': {
        'keywords': ['education', 'learning', 'student', 'school', 'university', 'academic', 'research', 'study', 'knowledge', 'teaching'],
        'themes': ['ocean_breeze', 'royal_purple', 'forest_green']
    },
    'science': {
        'keywords': ['science', 'research', 'experiment', 'hypothesis', 'biology', 'chemistry', 'physics', 'laboratory', 'scientific'],
        'themes': ['midnight_blue', 'ocean_breeze', 'minimalist']
    },
}

def detect_content_category(text):
    """Analyze text content to determine the best category."""
    text_lower = text.lower()
    scores = {}
    
    for category, data in CONTENT_CATEGORIES.items():
        score = sum(1 for keyword in data['keywords'] if keyword in text_lower)
        if score > 0:
            scores[category] = score
    
    if scores:
        best_category = max(scores, key=scores.get)
        return best_category
    return None

def select_theme(text_content=None, theme_name=None):
    """Select a theme based on content analysis or user preference."""
    # If specific theme requested, use it
    if theme_name and theme_name in THEME_PRESETS:
        return THEME_PRESETS[theme_name]
    
    # Try content-aware selection
    if text_content:
        category = detect_content_category(text_content)
        if category:
            theme_options = CONTENT_CATEGORIES[category]['themes']
            selected_theme = random.choice(theme_options)
            return THEME_PRESETS[selected_theme]
    
    # Random selection as fallback
    return THEME_PRESETS[random.choice(list(THEME_PRESETS.keys()))]

# Global theme variable (will be set per request)
THEME = THEME_PRESETS['modern_dark']

def get_font(name, size):
    """Robust font loader that handles missing system fonts gracefully across all platforms."""
    import platform
    system = platform.system()
    
    
    if "Bold" in name:
        font_candidates = [
            #windows 
            "C:\\Windows\\Fonts\\arialbd.ttf",
            "C:\\Windows\\Fonts\\Arial Bold.ttf",
            #macOS 
            "/Library/Fonts/Arial Bold.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "Arial Bold.ttf",
            "Arialbd.ttf",
            #for linux/docker
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        ]
    else:
        font_candidates = [
            "C:\\Windows\\Fonts\\arial.ttf",
            "C:\\Windows\\Fonts\\Arial.ttf",
            "/Library/Fonts/Arial.ttf",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "Arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/TTF/DejaVuSans.ttf",
        ]
    
    # Try each font path
    for font_path in font_candidates:
        try:
            return ImageFont.truetype(font_path, size)
        except (IOError, OSError):
            continue
    
    # Absolute fallback to default bitmap font (will look pixelated but works)
    print(f"Warning: Could not load any system font, using default. Platform: {system}")
    return ImageFont.load_default()

# --- HELPER: Text Wrapping Logic ---
def wrap_text(text, font, max_width, draw):
    """
    Splits text into lines that strictly fit within max_width.
    Uses 'draw.textlength' for accuracy.
    """
    if not text: return []
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        w = draw.textlength(test_line, font=font)
        
        if w <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                # Word is wider than line, force split
                lines.append(word)
                current_line = []
    if current_line:
        lines.append(' '.join(current_line))
    return lines

# --- HELPER: Calculate Block Height ---
def get_text_block_height(lines, font, line_spacing=1.4):
    if not lines: return 0
    # Use a dummy character to get consistent line height
    bbox = font.getbbox("Mg") 
    single_line_h = (bbox[3] - bbox[1]) * line_spacing
    # Ensure min height
    single_line_h = max(single_line_h, font.size * 1.2)
    return len(lines) * single_line_h

# --- HELPER: Draw Text Block ---
def draw_text_block(draw, lines, font, x, y, fill, align="left", line_spacing=1.4):
    """
    Draws pre-wrapped lines and returns the bottom Y coordinate.
    """
    bbox = font.getbbox("Mg")
    line_h = max((bbox[3] - bbox[1]) * line_spacing, font.size * 1.2)
    
    current_y = y
    for line in lines:
        w = draw.textlength(line, font=font)
        draw_x = x
        
        if align == "center":
            draw_x = x - (w / 2)
        elif align == "right":
            draw_x = x - w
            
        draw.text((draw_x, current_y), line, font=font, fill=fill)
        current_y += line_h
        
    return current_y

# --- HELPER: Charts ---
def create_donut_chart(value, theme):
    """Create a donut chart with theme colors."""
    try:
        val_float = float(str(value).replace('%', '').strip())
    except:
        val_float = 50

    fig, ax = plt.subplots(figsize=(2.5, 2.5), subplot_kw=dict(aspect="equal"))
    data = [val_float, 100 - val_float]
    
    # Donut with themed colors
    wedges, texts = ax.pie(
        data, 
        startangle=90, 
        colors=[theme['accent'], theme.get('chart_bg', '#cbd5e1')], 
        wedgeprops=dict(width=0.35, edgecolor=theme['card_bg'], linewidth=3)
    )
    
    fig.patch.set_alpha(0)
    ax.axis('equal')  
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', transparent=True, dpi=120)
    plt.close(fig)
    buf.seek(0)
    return Image.open(buf)

def create_bar_chart(value, theme, width=120, height=20):
    """Create a horizontal bar indicator."""
    try:
        val_float = float(str(value).replace('%', '').strip())
    except:
        val_float = 50
    
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background bar
    radius = height // 2
    draw.rounded_rectangle([0, 0, width, height], radius=radius, fill=theme.get('chart_bg', '#cbd5e1'))
    
    # Filled portion
    fill_width = int((val_float / 100) * width)
    if fill_width > 0:
        draw.rounded_rectangle([0, 0, fill_width, height], radius=radius, fill=theme['accent'])
    
    return img

# --- HELPER: Decorative Elements ---
def draw_decorative_shapes(draw, img, theme, width, height, header_height):
    """Add subtle decorative elements based on theme style."""
    accent = theme['accent']
    accent_secondary = theme.get('accent_secondary', accent)
    
    # Random decorative pattern
    pattern = random.choice(['corner_accent', 'none', 'none'])  # Less frequent decorations
    
    if pattern == 'corner_accent':
        # Accent shape in top-right corner of header only
        hex_color = accent_secondary.lstrip('#')
        rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        # Draw a subtle accent triangle in corner
        overlay = Image.new('RGBA', (150, 150), (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.polygon([(50, 0), (150, 0), (150, 100)], fill=(*rgb, 60))
        img.paste(overlay, (width - 150, 0), overlay)

# --- SECTION 1: HEADER ---
def draw_header(draw, img, data, width, theme):
    title_font = get_font("Bold", 48)
    sub_font = get_font("Regular", 22)
    
    # Wrap text with safety margin (80% of width)
    title_lines = wrap_text(data.get('title', 'INFOGRAPHIC').upper(), title_font, width * 0.80, draw)
    sub_lines = wrap_text(data.get('subtitle', 'Generated Summary'), sub_font, width * 0.85, draw)
    
    # Calculate heights
    title_h = get_text_block_height(title_lines, title_font)
    sub_h = get_text_block_height(sub_lines, sub_font)
    
    # Header Height = padding + title + gap + sub + padding
    padding = 60
    gap = 20
    header_height = padding + title_h + gap + sub_h + padding
    
    # Draw Background
    draw.rectangle([0, 0, width, header_height], fill=theme['header_bg'])
    
    # Add accent bar at top
    accent_bar_height = 6
    draw.rectangle([0, 0, width, accent_bar_height], fill=theme['accent'])
    
    # Header style variation (only subtle ones that don't overlap text)
    header_style = random.choice(['solid', 'bottom_accent'])
    
    if header_style == 'bottom_accent':
        # Draw accent line at bottom of header
        draw.rectangle([0, header_height-4, width, header_height], fill=theme['accent'])
    
    # Draw Text
    curr_y = padding
    curr_y = draw_text_block(draw, title_lines, title_font, width/2, curr_y, theme['accent'], align="center")
    curr_y += gap
    draw_text_block(draw, sub_lines, sub_font, width/2, curr_y, theme['text_white'], align="center")
    
    return header_height

# --- SECTION 2: STATS ---
def draw_stats(draw, img, data, start_y, width, theme):
    stats = data.get('stats', [])[:3]
    if not stats: return start_y
    
    margin = 40
    col_gap = 20
    # 3 columns
    col_width = (width - (margin * 2) - (col_gap * 2)) / 3
    
    # Fonts
    val_font = get_font("Bold", 32)
    lbl_font = get_font("Bold", 12)
    
    stat_style = theme.get('stat_style', 'donut')
    
    # 1. Pre-calculate row height
    # We need to know the tallest label to align everything
    max_label_h = 0
    max_val_h = 0
    stat_objects = []
    
    for stat in stats:
        # Wrap label text
        label_lines = wrap_text(str(stat.get('label','')).upper(), lbl_font, col_width - 20, draw)
        label_h = get_text_block_height(label_lines, lbl_font)
        max_label_h = max(max_label_h, label_h)
        
        # Wrap value text (for long values like "5.35 Billion (66.2% Pop.)")
        val_str = str(stat.get('value', ''))
        val_lines = wrap_text(val_str, val_font, col_width - 10, draw)
        val_h = get_text_block_height(val_lines, val_font)
        max_val_h = max(max_val_h, val_h)
        
        stat_objects.append({'val': val_str, 'val_lines': val_lines, 'lines': label_lines})
    
    # Calculate section height based on style
    inner_padding = 35
    value_area_height = max_val_h + 20  # Space for value text
    bar_height = 28 if stat_style == 'bar' else 0
    label_gap = 20
    
    section_height = inner_padding + value_area_height + bar_height + label_gap + max_label_h + inner_padding
    
    # Draw Background
    draw.rectangle([0, start_y, width, start_y + section_height], fill=theme['secondary_bg'])
    
    # Draw Columns
    for i, obj in enumerate(stat_objects):
        x_center = margin + (i * (col_width + col_gap)) + (col_width / 2)
        curr_y = start_y + inner_padding
        
        # Draw value text (always)
        val_bottom = draw_text_block(draw, obj['val_lines'], val_font, x_center, curr_y, theme['text_dark'], align="center")
        
        # Draw bar indicator below value (for bar style)
        if stat_style == 'bar':
            bar_y = curr_y + max_val_h + 10
            bar_width = int(col_width * 0.7)
            bar = create_bar_chart(obj['val'], theme, width=bar_width, height=24)
            paste_x = int(x_center - (bar_width / 2))
            img.paste(bar, (paste_x, int(bar_y)), bar)
        
        # Label below everything
        label_y = curr_y + max_val_h + bar_height + label_gap
        draw_text_block(draw, obj['lines'], lbl_font, x_center, label_y, theme['text_light'], align="center")
        
    return start_y + section_height

# --- SECTION 3: CARDS ---
def draw_cards(draw, img, data, start_y, width, theme):
    points = data.get('key_points', [])
    if not points: return start_y
    
    margin = 40
    col_gap = 30
    row_gap = 30
    col_width = (width - (margin * 2) - col_gap) / 2
    
    title_font = get_font("Bold", 20)
    desc_font = get_font("Regular", 16)
    padding = 25
    
    card_style = theme.get('card_style', 'elevated')
    border_radius = theme.get('border_radius', 12)
    
    curr_y = start_y + 40 # Top margin
    
    # Grid logic
    for i in range(0, len(points), 2):
        row_items = points[i:i+2]
        
        # Calculate max height for this row
        max_h = 0
        prepared_items = []
        
        for item in row_items:
            # Wrap text narrowly to fit inside card padding
            t_lines = wrap_text(item.get('title',''), title_font, col_width - (padding*2.5), draw)
            d_lines = wrap_text(item.get('description',''), desc_font, col_width - (padding*2.5), draw)
            
            t_h = get_text_block_height(t_lines, title_font)
            d_h = get_text_block_height(d_lines, desc_font)
            
            card_h = padding + t_h + 10 + d_h + padding
            max_h = max(max_h, card_h)
            prepared_items.append({'t': t_lines, 'd': d_lines})
            
        max_h = max(max_h, 180) # Minimum aesthetic height
        
        # Draw row
        for j, item in enumerate(prepared_items):
            x_start = margin + (j * (col_width + col_gap))
            
            if card_style == 'elevated':
                # Shadow effect (draw darker rectangle slightly offset)
                shadow_offset = 4
                hex_color = theme['text_light'].lstrip('#')
                shadow_rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
                # Draw shadow
                shadow_img = Image.new('RGBA', (int(col_width)+shadow_offset, int(max_h)+shadow_offset), (0,0,0,0))
                shadow_draw = ImageDraw.Draw(shadow_img)
                shadow_draw.rounded_rectangle(
                    [shadow_offset, shadow_offset, col_width+shadow_offset, max_h+shadow_offset],
                    radius=border_radius, fill=(*shadow_rgb, 30)
                )
                img.paste(shadow_img, (int(x_start), int(curr_y)), shadow_img)
                
                # Card Body
                draw.rounded_rectangle(
                    [x_start, curr_y, x_start + col_width, curr_y + max_h],
                    radius=border_radius, fill=theme['card_bg']
                )
                
            elif card_style == 'bordered':
                # Card with border
                draw.rounded_rectangle(
                    [x_start, curr_y, x_start + col_width, curr_y + max_h],
                    radius=border_radius, fill=theme['card_bg'], outline=theme['accent'], width=2
                )
                
            else:  # flat
                # Simple flat card
                draw.rounded_rectangle(
                    [x_start, curr_y, x_start + col_width, curr_y + max_h],
                    radius=border_radius, fill=theme['card_bg']
                )
            
            # Accent indicator (varies by style)
            accent_style = random.choice(['left_bar', 'top_bar', 'corner_dot', 'none'])
            
            if accent_style == 'left_bar':
                draw.rounded_rectangle(
                    [x_start, curr_y + 15, x_start + 6, curr_y + max_h - 15],
                    radius=4, fill=theme['accent']
                )
            elif accent_style == 'top_bar':
                draw.rounded_rectangle(
                    [x_start + 20, curr_y, x_start + 80, curr_y + 4],
                    radius=2, fill=theme['accent']
                )
            elif accent_style == 'corner_dot':
                draw.ellipse(
                    [x_start + padding - 5, curr_y + padding - 5, x_start + padding + 10, curr_y + padding + 10],
                    fill=theme['accent']
                )
            
            # Text
            tx = x_start + padding + (10 if accent_style == 'left_bar' else 0)
            ty = curr_y + padding + (5 if accent_style == 'top_bar' else 0)
            ty = draw_text_block(draw, item['t'], title_font, tx, ty, theme['text_dark'])
            ty += 10
            draw_text_block(draw, item['d'], desc_font, tx, ty, theme['text_light'])
            
        curr_y += max_h + row_gap
        
    return curr_y + 20

# --- SECTION 4: FOOTER ---
def draw_footer(draw, img, data, start_y, width, theme):
    conclusion = data.get('conclusion', '')
    if not conclusion: return start_y
    
    lbl_font = get_font("Bold", 18)
    txt_font = get_font("Regular", 18)
    
    lines = wrap_text(conclusion, txt_font, width * 0.8, draw)
    text_h = get_text_block_height(lines, txt_font)
    
    padding = 50
    footer_h = padding + 30 + 15 + text_h + padding
    
    draw.rectangle([0, start_y, width, start_y + footer_h], fill=theme['header_bg'])
    
    # Add accent bar at bottom
    draw.rectangle([0, start_y + footer_h - 6, width, start_y + footer_h], fill=theme['accent'])
    
    curr_y = start_y + padding
    draw.text((width/2, curr_y), "KEY TAKEAWAY", font=lbl_font, fill=theme['accent'], anchor="mm")
    
    curr_y += 40
    draw_text_block(draw, lines, txt_font, width/2, curr_y, theme['text_white'], align="center")
    
    return start_y + footer_h

# --- MAIN CONTROLLER ---
def create_infographic_image(data, theme):
    width = 800
    height = 3500 # Temporary canvas
    
    img = Image.new('RGB', (width, height), theme['bg'])
    draw = ImageDraw.Draw(img)
    
    # 1. Header
    header_height = draw_header(draw, img, data, width, theme)
    y_pos = header_height
    
    # 2. Stats (Dynamic check)
    if data.get('stats'):
        y_pos = draw_stats(draw, img, data, y_pos, width, theme)
        
    # 3. Cards
    y_pos = draw_cards(draw, img, data, y_pos, width, theme)
    
    # 4. Footer
    y_pos = draw_footer(draw, img, data, y_pos, width, theme)
    
    # 5. Add decorative elements (after everything else, with header info)
    draw_decorative_shapes(draw, img, theme, width, int(y_pos), header_height)
    
    # Final Crop
    return img.crop((0, 0, width, int(y_pos)))

@infographic_bp.route('/generate', methods=['POST'])
def generate_infographic():
    try:
        text_content = ""
        if 'file' in request.files:
            file = request.files['file']
            filename = file.filename.lower()
            if filename.endswith('.pdf'):
                text_content = extract_text_from_pdf(file.stream.read())
            elif filename.endswith('.docx'):
                text_content = extract_text_from_docx(file)
            else:
                return jsonify({"error": "Unsupported file type"}), 400
        elif 'text' in request.form:
            text_content = request.form['text']
        else:
            text_content = "Placeholder text."

        # Get optional theme parameter from request
        requested_theme = request.form.get('theme', None)
        
        # Select theme based on content or user preference
        theme = select_theme(text_content=text_content, theme_name=requested_theme)
        print(f"Selected theme: {theme['name']}")

        infographic_data = generate_infographic_data_from_text(text_content)
        img = create_infographic_image(infographic_data, theme)
        
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=95)
        buf.seek(0)
        
        # Upload logic (Supabase)
        from flask import current_app
        from supabase import create_client
        import uuid

        url = current_app.config.get('SUPABASE_URL')
        key = current_app.config.get('SUPABASE_KEY')
        public_url = ""
        
        if url and key:
            try:
                supabase = create_client(url, key)
                filename = f"infographic-{uuid.uuid4()}.jpg"
                bucket_name = "generated-content"
                
                supabase.storage.from_(bucket_name).upload(
                    path=filename,
                    file=buf.getvalue(),
                    file_options={"content-type": "image/jpeg"}
                )
                
                public_url = supabase.storage.from_(bucket_name).get_public_url(filename)
            except Exception as e:
                print(f"Upload failed: {e}")

        buf.seek(0)
        img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
        base64_url = f"data:image/jpeg;base64,{img_str}"
        
        return jsonify({
            "message": "Success",
            "url": public_url or base64_url,
            "image_data": base64_url,
            "data_used": infographic_data,
            "theme_used": theme['name']
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


    return jsonify({"themes": themes})

@infographic_bp.route('/generate-canva', methods=['POST'])
def generate_canva_infographic():
    """
    Generates an infographic using the Canva Connect API.
    """
    try:
        # 1. Get Access Token (from header or session)
        # For this MVP, we expect it in the Authorization header or form data
        auth_header = request.headers.get('Authorization')
        access_token = None
        if auth_header and auth_header.startswith("Bearer "):
             access_token = auth_header.split(" ")[1]
        
        if not access_token:
            access_token = request.form.get('canva_token')
            
        if not access_token:
            return jsonify({"error": "Missing Canva Access Token"}), 401
            
        # 2. Extract Text (Same logic as existing)
        text_content = ""
        if 'file' in request.files:
            file = request.files['file']
            filename = file.filename.lower()
            if filename.endswith('.pdf'):
                text_content = extract_text_from_pdf(file.stream.read())
            elif filename.endswith('.docx'):
                text_content = extract_text_from_docx(file)
            else:
                return jsonify({"error": "Unsupported file type"}), 400
        elif 'text' in request.form:
            text_content = request.form['text']
        else:
             # Just for testing/demo
            text_content = "Placeholder text content about biology."

        # 3. Generate Data using AI Service
        infographic_data = generate_infographic_data_from_text(text_content)
        
        # 4. Map to Canva Data Structure
        # We need to flatten the structure or match the template fields.
        # Let's assume a generic template with these fields:
        # title, subtitle, stat_1_val, stat_1_label, point_1_title, point_1_desc...
        
        canva_data = {
            "title": infographic_data.get('title', 'Infographic'),
            "subtitle": infographic_data.get('subtitle', ''),
            "conclusion": infographic_data.get('conclusion', '')
        }
        
        # Stats
        stats = infographic_data.get('stats', [])
        for i, stat in enumerate(stats[:3]):
            canva_data[f"stat_{i+1}_value"] = stat.get('value', '')
            canva_data[f"stat_{i+1}_label"] = stat.get('label', '')
            
        # Key Points
        points = infographic_data.get('key_points', [])
        for i, point in enumerate(points[:3]):
            canva_data[f"point_{i+1}_title"] = point.get('title', '')
            canva_data[f"point_{i+1}_desc"] = point.get('description', '')

        # 5. Create Autofill Job
        # Ideally, passed from frontend, but we can have a default
        template_id = request.form.get('template_id', 'DAF12345678') 
        
        job_response = create_design_autofill_job(
            {"data": canva_data, "title": canva_data['title']}, 
            template_id, 
            access_token
        )
        
        job_id = job_response.get('job', {}).get('id')
        
        if not job_id:
             return jsonify({"error": "Failed to create Canva job"}), 500
             
        # 6. Poll for completion (Short wait, else return job_id)
        # We'll wait up to 10 seconds.
        try:
            result = poll_design_autofill_job(job_id, access_token, max_attempts=5, delay=2)
            design_url = result.get('job', {}).get('result', {}).get('design', {}).get('url')
            edit_url = result.get('job', {}).get('result', {}).get('design', {}).get('edit_url')
            
            return jsonify({
                "message": "Success",
                "canva_url": design_url,
                "edit_url": edit_url, # Useful for 'Edit in Canva' button
                "job_id": job_id
            })
            
        except Exception as e:
            # If timeout, return job_id so frontend can keep polling
            return jsonify({
                "message": "Processing",
                "job_id": job_id,
                "status": "pending"
            }), 202
            
    except Exception as e:
        print(f"Canva Gen Error: {e}")
        return jsonify({"error": str(e)}), 500