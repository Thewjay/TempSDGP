"""
Lesson Generator Blueprint
Register this in your main Flask app.
"""

import os
import json
import re
import requests
from flask import Blueprint, request, jsonify
import google.generativeai as genai
from .lesson_config import LessonConfig

# LessonConfig.validate()

GEMINI_API_KEY = LessonConfig.GEMINI_API_KEY

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


lessons_bp = Blueprint('lessons', __name__, url_prefix='/api')

# GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# if GEMINI_API_KEY:
#     genai.configure(api_key=GEMINI_API_KEY)


def generate_image_with_rest_api(prompt: str) -> str:
    if not GEMINI_API_KEY:
        return ''
    # url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key={GEMINI_API_KEY}"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{LessonConfig.IMAGE_MODEL}:generateContent?key={LessonConfig.GEMINI_API_KEY}"

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]}
    }
    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        candidates = data.get('candidates', [])
        if candidates:
            for part in candidates[0].get('content', {}).get('parts', []):
                if 'inlineData' in part:
                    mime = part['inlineData'].get('mimeType', 'image/png')
                    img = part['inlineData'].get('data', '')
                    if img:
                        return f"data:{mime};base64,{img}"
        return ''
    except Exception as e:
        print(f"Image generation error: {e}")
        return ''


@lessons_bp.route('/generate-lesson', methods=['POST'])
def generate_lesson():
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        item_count = data.get('item_count', 5)
        if not topic:
            return jsonify({'success': False, 'error': 'Topic is required'}), 400
        if not GEMINI_API_KEY:
            return jsonify({'success': False, 'error': 'GEMINI_API_KEY not configured'}), 500

        # model = genai.GenerativeModel('gemini-2.0-flash')
        model = genai.GenerativeModel(LessonConfig.TEXT_MODEL)

        content_prompt = f"""Generate an educational lesson about "{topic}" for children aged 4-8.
Return a valid JSON object with this exact structure:
{{"title": "Learn About {topic}", "description": "A fun lesson about {topic}.", "items": [{{"name": "item name", "spokenText": "Simple text (1-2 sentences)"}}]}}
Generate exactly {item_count} items. Only return JSON."""

        content_response = model.generate_content(content_prompt)
        json_match = re.search(r'\{[\s\S]*\}', content_response.text)
        if not json_match:
            raise ValueError('Could not parse JSON')
        lesson_content = json.loads(json_match.group())

        items_with_images = []
        for item in lesson_content.get('items', []):
            image_prompt = f'Create a simple, colorful, child-friendly cartoon illustration of "{item["name"]}" for a children\'s app about "{topic}". Bright colors, simple shapes, no text, white background.'
            image_data = generate_image_with_rest_api(image_prompt)
            items_with_images.append({
                'name': item['name'],
                'spokenText': item['spokenText'],
                'image': image_data
            })

        return jsonify({
            'success': True,
            'title': lesson_content.get('title', f'Learn About {topic}'),
            'description': lesson_content.get('description', ''),
            'items': items_with_images
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@lessons_bp.route('/generate-lesson-content', methods=['POST'])
def generate_lesson_content():
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        item_count = data.get('item_count', 5)
        if not topic:
            return jsonify({'success': False, 'error': 'Topic is required'}), 400
        if not GEMINI_API_KEY:
            return jsonify({'success': False, 'error': 'GEMINI_API_KEY not configured'}), 500

        # model = genai.GenerativeModel('gemini-2.0-flash')
        model = genai.GenerativeModel(LessonConfig.TEXT_MODEL)

        prompt = f"""Generate an educational lesson about "{topic}" for children aged 4-8.
Return JSON: {{"title": "...", "description": "...", "items": [{{"name": "...", "spokenText": "..."}}]}}
Generate exactly {item_count} items. Only return JSON."""

        response = model.generate_content(prompt)
        json_match = re.search(r'\{[\s\S]*\}', response.text)
        if not json_match:
            raise ValueError('Could not parse JSON')
        lesson_data = json.loads(json_match.group())

        return jsonify({
            'success': True,
            'title': lesson_data.get('title', f'Learn About {topic}'),
            'description': lesson_data.get('description', ''),
            'items': lesson_data.get('items', [])
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@lessons_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'gemini_configured': GEMINI_API_KEY is not None})
