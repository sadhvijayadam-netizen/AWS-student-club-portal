"""
AWS Student Builder Groups - Contact-Aware Fallback Router
Routes unsupported questions to appropriate campus leadership contacts extracted strictly from 01-onboarding-faq.md.
"""

# Full Directory strictly extracted from 01-onboarding-faq.md
CAMPUS_DIRECTORY = {
    "group_leader": {
        "name": "Shanmukha Sasi Sadineni",
        "role": "AWS Student Builder Group Leader",
        "email": "sadinenisasi@gmail.com",
        "phone": "7396025334",
        "department": "Group Leadership",
        "area": "General Club Help & Overall Leadership"
    },
    "technical_lead": {
        "name": "Revan Kumar Goud Bommagoni",
        "role": "Technical Lead",
        "email": "brevankumargoud@gmail.com",
        "phone": "8106105746",
        "department": "Technical Lead",
        "area": "Technical Architecture, Code & Workshop Support"
    },
    "community_lead": {
        "name": "Rashesh Reddy Yarram",
        "role": "Community Outreach & Engagement Director",
        "email": "yarramradheshreddy@gmail.com",
        "phone": "8985468719",
        "department": "Community Outreach",
        "area": "Community Outreach, Partnerships & Student Engagement"
    },
    "events_lead": {
        "name": "Panala Aditya",
        "role": "Events & Operations Director",
        "email": "Contact via Group Lead",
        "phone": "9133770055",
        "department": "Events & Operations",
        "area": "Events, Venues & Operations Management"
    },
    "media_lead": {
        "name": "Boda Sandeep Kumar",
        "role": "Media & Creative Director",
        "email": "sandeepkumarboda777@gmail.com",
        "phone": "8019294885",
        "department": "Media & Creative",
        "area": "Media, Posters & Creative Design"
    },
    "pr_lead": {
        "name": "Chittukuri Anil Kumar",
        "role": "Public Relations & Social Media Director",
        "email": "anilkumarchittuluri@gmail.com",
        "phone": "6281852558",
        "department": "Public Relations",
        "area": "Public Relations & Social Media Publicity"
    }
}

def detect_topic_and_director(question_text):
    """
    Detects whether the question matches a specific department responsibility.
    Returns (detected_area, director_dict or None).
    """
    q_lower = question_text.lower()

    # Media & Creative (Checked first for specific keywords like poster/graphics/design)
    media_words = ['poster', 'graphics', 'design', 'logo', 'video', 'recording', 'photo', 'slide', 'creative', 'banner']
    if any(w in q_lower for w in media_words):
        return ("Media & Creative Design", CAMPUS_DIRECTORY['media_lead'])

    # PR & Social Media
    pr_words = ['social media', 'instagram', 'linkedin', 'twitter', 'post', 'publicity', 'announcement', 'pr']
    if any(w in q_lower for w in pr_words):
        return ("Public Relations & Social Media", CAMPUS_DIRECTORY['pr_lead'])

    # Technical / AWS / Code / Architecture
    tech_words = ['code', 'technical', 'lambda', 'bedrock', 'api', 'backend', 'bug', 'deploy', 'error', 'database', 'python', 'javascript', 'serverless', 'sdk', 'iam', 'billing alarm', 'account setup', 'aws error', 'function']
    if any(w in q_lower for w in tech_words):
        return ("Technical & Architecture Support", CAMPUS_DIRECTORY['technical_lead'])

    # Events, Operations & Workshops
    event_words = ['room', 'schedule', 'event', 'timing', 'operation', 'venue', 'catering', 'food', 'pizza', 'workshop date', 'location', 'hall']
    if any(w in q_lower for w in event_words):
        return ("Events & Operations Management", CAMPUS_DIRECTORY['events_lead'])

    # Community & Outreach
    outreach_words = ['outreach', 'community', 'partner', 'collab', 'promote', 'sponsor', 'student engagement', 'register']
    if any(w in q_lower for w in outreach_words):
        return ("Community Outreach & Engagement", CAMPUS_DIRECTORY['community_lead'])

    # Completely general or unrelated
    return (None, None)

def determine_fallback_contact(question_text):
    """Legacy compatibility helper returning single director contact or Group Leader."""
    _, director = detect_topic_and_director(question_text)
    return director or CAMPUS_DIRECTORY['group_leader']

def build_fallback_response(question_text):
    """
    Constructs a structured directory-aware fallback response.
    Includes Group Leader, Technical Lead, and detected Relevant Director.
    """
    detected_area, relevant_director = detect_topic_and_director(question_text)
    
    group_leader = CAMPUS_DIRECTORY['group_leader']
    tech_lead = CAMPUS_DIRECTORY['technical_lead']

    answer_msg = (
        "I couldn't find a verified answer to this question in the 8 official club documents.\n"
        "To get official details, please reach out directly to our campus club leads listed below."
    )

    # Filter relevant director if it's already Group Leader or Tech Lead
    if relevant_director and relevant_director['name'] in [group_leader['name'], tech_lead['name']]:
        relevant_director = None

    return {
        "grounded": False,
        "fallback": True,
        "status_title": "Connect with the right club lead",
        "answer": answer_msg,
        "detected_area": detected_area,
        "group_leader": group_leader,
        "tech_lead": tech_lead,
        "relevant_director": relevant_director,
        "contact": relevant_director or group_leader,
        "sources": []
    }
