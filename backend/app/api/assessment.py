from flask import Blueprint, request, jsonify

assessment_bp = Blueprint('assessment', __name__)

@assessment_bp.route('/submit', methods=['POST'])
def submit_assessment():
    try:
        data = request.get_json()
        
        # Extract the assessment data
        scores = data.get('scores', {})
        preferences = data.get('preferences', '')
        additional_info = data.get('additionalInfo', '')
        
        # Validate required fields
        required_scores = ['verbal', 'quantitative', 'nonVerbal', 'spatial']
        for score_type in required_scores:
            if not scores.get(score_type):
                return jsonify({"error": f"Missing {score_type} score"}), 400
        
        # Simple recommendation logic based on scores
        recommendations = generate_recommendations(scores, preferences)
        
        # In a real app, you'd save this to a database
        response_data = {
            "message": "Assessment submitted successfully!",
            "recommendations": recommendations,
            "user_profile": {
                "scores": scores,
                "preferences": preferences,
                "additional_info": additional_info
            }
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to process assessment: {str(e)}"}), 500

def generate_recommendations(scores, preferences):
    """Generate learning format recommendations based on CAT4 scores"""
    recommendations = []
    
    # Convert scores to integers for comparison
    try:
        verbal = int(scores.get('verbal', 0))
        quantitative = int(scores.get('quantitative', 0))
        non_verbal = int(scores.get('nonVerbal', 0))
        spatial = int(scores.get('spatial', 0))
    except ValueError:
        # If scores aren't valid numbers, provide general recommendations
        return [
            {
                "format": "Mind Maps",
                "reason": "Great for organizing and visualizing information",
                "confidence": "medium"
            },
            {
                "format": "Summary Notes", 
                "reason": "Effective for quick review and comprehension",
                "confidence": "medium"
            }
        ]
    
    # Recommendation logic based on strongest areas
    max_score = max(verbal, quantitative, non_verbal, spatial)
    
    if spatial == max_score and spatial > 110:
        recommendations.append({
            "format": "Mind Maps",
            "reason": "Your strong spatial ability makes visual diagrams perfect for you",
            "confidence": "high"
        })
        recommendations.append({
            "format": "Infographics",
            "reason": "Visual representations will help you understand complex concepts",
            "confidence": "high"
        })
    
    if verbal == max_score and verbal > 110:
        recommendations.append({
            "format": "Summary Notes",
            "reason": "Your excellent verbal reasoning skills make text-based learning ideal",
            "confidence": "high"
        })
        recommendations.append({
            "format": "Audio Content",
            "reason": "Listening to explanations will complement your verbal strengths",
            "confidence": "medium"
        })
    
    if non_verbal == max_score and non_verbal > 110:
        recommendations.append({
            "format": "Mind Maps", 
            "reason": "Your strong pattern recognition skills are perfect for visual learning",
            "confidence": "high"
        })
        recommendations.append({
            "format": "Interactive Diagrams",
            "reason": "Visual problem-solving matches your non-verbal reasoning strength",
            "confidence": "high"
        })
    
    if quantitative == max_score and quantitative > 110:
        recommendations.append({
            "format": "Structured Notes",
            "reason": "Your analytical thinking benefits from organized, logical layouts",
            "confidence": "high"
        })
        recommendations.append({
            "format": "Step-by-step Breakdowns",
            "reason": "Sequential learning matches your quantitative reasoning skills",
            "confidence": "medium"
        })
    
    # Check preferences for additional recommendations
    if preferences and "visual" in preferences.lower():
        recommendations.append({
            "format": "Mind Maps",
            "reason": "Matches your stated preference for visual learning",
            "confidence": "high"
        })
    
    if preferences and "audio" in preferences.lower():
        recommendations.append({
            "format": "Audio Content",
            "reason": "Aligns with your preference for auditory learning",
            "confidence": "high"
        })
    
    # Remove duplicates while preserving order
    seen = set()
    unique_recommendations = []
    for rec in recommendations:
        if rec["format"] not in seen:
            seen.add(rec["format"])
            unique_recommendations.append(rec)
    
    # If no specific recommendations, provide defaults
    if not unique_recommendations:
        unique_recommendations = [
            {
                "format": "Mind Maps",
                "reason": "Effective for most learning styles and content types",
                "confidence": "medium"
            },
            {
                "format": "Summary Notes",
                "reason": "Reliable method for organizing and reviewing information", 
                "confidence": "medium"
            }
        ]
    
    return unique_recommendations[:3]  # Return top 3 recommendations