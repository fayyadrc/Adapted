from flask import Blueprint, jsonify, request
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import os
from ..utils.text_extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.ai_service import generate_infographic_data_from_text

canva_bp = Blueprint('canva', __name__)

def draw_text_wrapped(draw, text, font, max_width, start_pos, fill, line_spacing=1.2, align="left"):
    """
    Draws text wrapped to a specific width.
    Returns the bottom Y coordinate of the drawn text.
    """
    x, y = start_pos
    if not text:
        return y

    words = text.split()
    lines = []
    current_line = []

    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        width = bbox[2] - bbox[0]
        
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                # Word itself is too long, force split
                lines.append(word)
                current_line = []
    
    if current_line:
        lines.append(' '.join(current_line))

    # Draw lines
    line_height = font.getbbox("Ay")[3] * line_spacing
    
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_width = bbox[2] - bbox[0]
        
        draw_x = x
        if align == "center":
            draw_x = x - (line_width / 2)
        elif align == "right":
            draw_x = x - line_width
            
        draw.text((draw_x, y), line, font=font, fill=fill)
        y += line_height
        
    return y

def create_infographic_image(data):
    """
    Creates an infographic image using Pillow based on structured data.
    Style: Modern Dark & Bold (Refined)
    """
    width = 800
    # Initial height, will be cropped
    height = 2000 
    
    # Modern Dark Theme Colors
    bg_color = (15, 23, 42)       # Slate-900
    text_color = (248, 250, 252)  # Slate-50
    accent_color = (99, 102, 241) # Indigo-500
    secondary_color = (236, 72, 153) # Pink-500
    card_bg = (30, 41, 59)        # Slate-800
    
    img = Image.new('RGB', (width, height), bg_color)
    d = ImageDraw.Draw(img)
    
    # Load fonts - Targeting macOS Helvetica
    try:
        font_path = "/System/Library/Fonts/Helvetica.ttc"
        # Fallback to a common linux path if needed in future, but for this user we know it's Mac
        
        title_font = ImageFont.truetype(font_path, 64) 
        subtitle_font = ImageFont.truetype(font_path, 28)
        header_font = ImageFont.truetype(font_path, 32)
        text_font = ImageFont.truetype(font_path, 24)
        stat_value_font = ImageFont.truetype(font_path, 60)
        stat_label_font = ImageFont.truetype(font_path, 20)
        footer_font = ImageFont.truetype(font_path, 22)
    except IOError:
        # If Helvetica fails, try Arial
        try:
            font_path = "Arial.ttf"
            title_font = ImageFont.truetype(font_path, 64)
            subtitle_font = ImageFont.truetype(font_path, 28)
            header_font = ImageFont.truetype(font_path, 32)
            text_font = ImageFont.truetype(font_path, 24)
            stat_value_font = ImageFont.truetype(font_path, 60)
            stat_label_font = ImageFont.truetype(font_path, 20)
            footer_font = ImageFont.truetype(font_path, 22)
        except IOError:
            # Absolute fallback
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            header_font = ImageFont.load_default()
            text_font = ImageFont.load_default()
            stat_value_font = ImageFont.load_default()
            stat_label_font = ImageFont.load_default()
            footer_font = ImageFont.load_default()

    current_y = 80
    margin = 50
    content_width = width - (2 * margin)

    # 1. Header Section
    # Gradient-like top bar
    for i in range(10):
        color_val = int(99 + (i * 5)) # Gradient effect on indigo
        d.rectangle([0, i*2, width, (i+1)*2], fill=(color_val, 102, 241))
    
    # Title
    title = data.get('title', 'INFOGRAPHIC').upper()
    # Draw title shadow
    draw_text_wrapped(d, title, title_font, content_width, ((width/2)+2, current_y+2), (0,0,0), align="center")
    current_y = draw_text_wrapped(d, title, title_font, content_width, (width/2, current_y), text_color, align="center")
    current_y += 25
    
    # Subtitle
    subtitle = data.get('subtitle', '')
    if subtitle:
        current_y = draw_text_wrapped(d, subtitle, subtitle_font, content_width, (width/2, current_y), (148, 163, 184), align="center") # Slate-400
        current_y += 50

    # Decorative Divider
    d.line([(margin + 50, current_y), (width - margin - 50, current_y)], fill=secondary_color, width=4)
    current_y += 60

    # 2. Stats Section
    stats = data.get('stats', [])
    if stats:
        num_stats = len(stats)
        if num_stats > 0:
            # Stats container
            stat_bg_height = 200
            # Draw rounded rect background for stats
            d.rectangle([margin, current_y, width - margin, current_y + stat_bg_height], fill=card_bg)
            # Add a top border to the stats card
            d.rectangle([margin, current_y, width - margin, current_y + 5], fill=accent_color)
            
            col_width = (width - (2 * margin)) / num_stats
            for i, stat in enumerate(stats):
                center_x = margin + (i * col_width) + (col_width / 2)
                stat_y = current_y + 40
                
                # Value
                val_text = str(stat.get('value', ''))
                draw_text_wrapped(d, val_text, stat_value_font, col_width - 20, (center_x, stat_y), secondary_color, align="center")
                
                # Label
                label_text = stat.get('label', '').upper()
                draw_text_wrapped(d, label_text, stat_label_font, col_width - 20, (center_x, stat_y + 80), (203, 213, 225), align="center") # Slate-300
        
            current_y += stat_bg_height + 60

    # 3. Key Points Section
    key_points = data.get('key_points', [])
    for i, point in enumerate(key_points):
        # Card Background
        card_y_start = current_y
        
        # Point Title
        point_title = point.get('title', f'POINT {i+1}')
        
        # Draw accent circle/bullet
        bullet_y = current_y + 10
        d.ellipse([margin, bullet_y, margin + 15, bullet_y + 15], fill=accent_color)
        
        title_height = draw_text_wrapped(d, point_title, header_font, content_width - 40, (margin + 30, current_y), text_color, align="left")
        
        # Description
        point_desc = point.get('description', '')
        desc_y_start = title_height + 15
        final_y = draw_text_wrapped(d, point_desc, text_font, content_width - 20, (margin + 30, desc_y_start), (203, 213, 225), align="left")
        
        current_y = final_y + 50

    # 4. Conclusion
    conclusion = data.get('conclusion', '')
    if conclusion:
        current_y += 30
        # Footer Background
        d.rectangle([0, current_y, width, current_y + 250], fill=card_bg)
        d.rectangle([0, current_y, width, current_y + 5], fill=secondary_color)
        
        # "KEY TAKEAWAY" Label
        d.text((width/2, current_y + 40), "KEY TAKEAWAY", font=stat_label_font, fill=accent_color, anchor="ms")
        
        # Text
        draw_text_wrapped(d, conclusion, subtitle_font, content_width - 40, (width/2, current_y + 80), text_color, align="center")
        current_y += 200

    # Crop image
    final_height = current_y
    img = img.crop((0, 0, width, final_height))

    return img

@canva_bp.route('/generate-infographic', methods=['POST'])
def generate_infographic():
    try:
        # Check if file is uploaded
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
            # Fallback for testing without file
            text_content = "This is a placeholder text for testing infographic generation."

        if not text_content:
             return jsonify({"error": "No content to process"}), 400

        # 1. Get Structured Data from AI
        infographic_data = generate_infographic_data_from_text(text_content)
        
        # 2. Generate Image
        img = create_infographic_image(infographic_data)
        
        # 3. Save to buffer
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        buf.seek(0)
        
        # Convert to base64 for frontend display
        img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
        base64_url = f"data:image/jpeg;base64,{img_str}"
        
        # Placeholder public URL for Canva
        public_url = "https://www.canva.dev/example-assets/image-import/image.jpg"
        
        return jsonify({
            "message": "Infographic generated successfully",
            "url": public_url,
            "image_data": base64_url,
            "data_used": infographic_data
        })

    except Exception as e:
        print(f"Error in generate_infographic: {e}")
        return jsonify({"error": str(e)}), 500
