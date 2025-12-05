from flask import Blueprint, jsonify, request, current_app
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import os
import matplotlib
# Set backend to Agg before importing pyplot to avoid GUI requirement errors
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from ..utils.text_extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.ai_service import generate_infographic_data_from_text

canva_bp = Blueprint('canva', __name__)

# --- CONFIGURATION ---
THEME = {
    'bg': '#f8fafc',          # Slate-50
    'header_bg': '#1e293b',   # Slate-900
    'secondary_bg': '#f1f5f9', # Slate-100
    'card_bg': '#ffffff',
    'accent': '#f97316',      # Orange-500
    'text_dark': '#1e293b',   # Slate-800
    'text_light': '#475569',  # Slate-600
    'text_white': '#ffffff'
}

# --- HELPER: Font Loading ---
def get_font(name, size):
    """Robust font loader that handles missing system fonts gracefully."""
    try:
        if "Bold" in name:
            try:
                return ImageFont.truetype("Arial Bold.ttf", size)
            except:
                try:
                    return ImageFont.truetype("Arialbd.ttf", size)
                except:
                    # Linux/Docker fallback
                    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
        else:
            try:
                return ImageFont.truetype("Arial.ttf", size)
            except:
                return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except:
        # Absolute fallback to default bitmap font (will look pixelated but works)
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
def create_donut_chart(value, color):
    try:
        val_float = float(str(value).replace('%', '').strip())
    except:
        val_float = 50

    fig, ax = plt.subplots(figsize=(2.5, 2.5), subplot_kw=dict(aspect="equal"))
    data = [val_float, 100 - val_float]
    
    # Donut with white border
    wedges, texts = ax.pie(
        data, 
        startangle=90, 
        colors=[color, '#cbd5e1'], 
        wedgeprops=dict(width=0.35, edgecolor='white', linewidth=3)
    )
    
    fig.patch.set_alpha(0)
    ax.axis('equal')  
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', transparent=True, dpi=120)
    plt.close(fig)
    buf.seek(0)
    return Image.open(buf)

# --- SECTION 1: HEADER ---
def draw_header(draw, img, data, width):
    title_font = get_font("Bold", 48)
    sub_font = get_font("Regular", 22)
    
    # Wrap text with safety margin (80% of width)
    title_lines = wrap_text(data.get('title', 'INFOGRAPHIC').upper(), title_font, width * 0.85, draw)
    sub_lines = wrap_text(data.get('subtitle', 'Generated Summary'), sub_font, width * 0.85, draw)
    
    # Calculate heights
    title_h = get_text_block_height(title_lines, title_font)
    sub_h = get_text_block_height(sub_lines, sub_font)
    
    # Header Height = padding + title + gap + sub + padding
    padding = 60
    gap = 20
    header_height = padding + title_h + gap + sub_h + padding
    
    # Draw Background
    draw.rectangle([0, 0, width, header_height], fill=THEME['header_bg'])
    
    # Draw Text
    curr_y = padding
    curr_y = draw_text_block(draw, title_lines, title_font, width/2, curr_y, THEME['accent'], align="center")
    curr_y += gap
    draw_text_block(draw, sub_lines, sub_font, width/2, curr_y, THEME['text_white'], align="center")
    
    return header_height

# --- SECTION 2: STATS ---
def draw_stats(draw, img, data, start_y, width):
    stats = data.get('stats', [])[:3]
    if not stats: return start_y
    
    margin = 40
    col_gap = 20
    # 3 columns
    col_width = (width - (margin * 2) - (col_gap * 2)) / 3
    
    # Fonts
    val_font = get_font("Bold", 28)
    lbl_font = get_font("Bold", 14)
    
    # 1. Pre-calculate row height
    # We need to know the tallest label to align everything
    max_label_h = 0
    stat_objects = []
    
    for stat in stats:
        label_lines = wrap_text(str(stat.get('label','')).upper(), lbl_font, col_width - 10, draw)
        h = get_text_block_height(label_lines, lbl_font)
        max_label_h = max(max_label_h, h)
        stat_objects.append({'val': stat.get('value'), 'lines': label_lines})
        
    chart_size = 140
    inner_padding = 30
    section_height = inner_padding + chart_size + 20 + max_label_h + inner_padding
    
    # Draw Background
    draw.rectangle([0, start_y, width, start_y + section_height], fill=THEME['secondary_bg'])
    
    # Draw Columns
    for i, obj in enumerate(stat_objects):
        x_center = margin + (i * (col_width + col_gap)) + (col_width / 2)
        curr_y = start_y + inner_padding
        
        # Chart
        try:
            chart = create_donut_chart(obj['val'], THEME['accent'])
            chart.thumbnail((chart_size, chart_size), Image.Resampling.LANCZOS)
            paste_x = int(x_center - (chart.width / 2))
            img.paste(chart, (paste_x, int(curr_y)), chart)
        except:
            pass
            
        # Value (Centered in Chart)
        draw.text((x_center, curr_y + (chart_size/2)), str(obj['val']), font=val_font, fill=THEME['text_dark'], anchor="mm")
        
        # Label
        label_y = curr_y + chart_size + 15
        draw_text_block(draw, obj['lines'], lbl_font, x_center, label_y, THEME['text_light'], align="center")
        
    return start_y + section_height

# --- SECTION 3: CARDS ---
def draw_cards(draw, img, data, start_y, width):
    points = data.get('key_points', [])
    if not points: return start_y
    
    margin = 40
    col_gap = 30
    row_gap = 30
    col_width = (width - (margin * 2) - col_gap) / 2
    
    title_font = get_font("Bold", 20)
    desc_font = get_font("Regular", 16)
    padding = 25
    
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
            
            # Card Body
            draw.rounded_rectangle(
                [x_start, curr_y, x_start + col_width, curr_y + max_h],
                radius=12, fill=THEME['card_bg']
            )
            # Accent Border
            draw.rounded_rectangle(
                [x_start, curr_y + 15, x_start + 6, curr_y + max_h - 15],
                radius=4, fill=THEME['accent']
            )
            
            # Text
            tx = x_start + padding
            ty = curr_y + padding
            ty = draw_text_block(draw, item['t'], title_font, tx, ty, THEME['text_dark'])
            ty += 10
            draw_text_block(draw, item['d'], desc_font, tx, ty, THEME['text_light'])
            
        curr_y += max_h + row_gap
        
    return curr_y + 20

# --- SECTION 4: FOOTER ---
def draw_footer(draw, img, data, start_y, width):
    conclusion = data.get('conclusion', '')
    if not conclusion: return start_y
    
    lbl_font = get_font("Bold", 18)
    txt_font = get_font("Regular", 18)
    
    lines = wrap_text(conclusion, txt_font, width * 0.8, draw)
    text_h = get_text_block_height(lines, txt_font)
    
    padding = 50
    footer_h = padding + 30 + 15 + text_h + padding
    
    draw.rectangle([0, start_y, width, start_y + footer_h], fill=THEME['header_bg'])
    
    curr_y = start_y + padding
    draw.text((width/2, curr_y), "KEY TAKEAWAY", font=lbl_font, fill=THEME['accent'], anchor="mm")
    
    curr_y += 40
    draw_text_block(draw, lines, txt_font, width/2, curr_y, THEME['text_white'], align="center")
    
    return start_y + footer_h

# --- MAIN CONTROLLER ---
def create_infographic_image(data):
    width = 800
    height = 3500 # Temporary canvas
    
    img = Image.new('RGB', (width, height), THEME['bg'])
    draw = ImageDraw.Draw(img)
    
    # 1. Header
    y_pos = draw_header(draw, img, data, width)
    
    # 2. Stats (Dynamic check)
    if data.get('stats'):
        y_pos = draw_stats(draw, img, data, y_pos, width)
        
    # 3. Cards
    y_pos = draw_cards(draw, img, data, y_pos, width)
    
    # 4. Footer
    y_pos = draw_footer(draw, img, data, y_pos, width)
    
    # Final Crop
    return img.crop((0, 0, width, int(y_pos)))

@canva_bp.route('/generate-infographic', methods=['POST'])
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

        infographic_data = generate_infographic_data_from_text(text_content)
        img = create_infographic_image(infographic_data)
        
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
            "data_used": infographic_data
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500