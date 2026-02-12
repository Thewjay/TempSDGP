from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from visualSearchBackend.services.config import get_config
from visualSearchBackend.services.gemini_service import init_gemini
from visualSearchBackend.routes import api_bp




load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)
    config_obj = get_config()
    app.config.from_object(config_obj)

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    

    from lessonPlanBackend import lessons_bp
    from reinforcedLearningBackend  import mochi_bp

    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(lessons_bp)
    app.register_blueprint(mochi_bp)

    # from quizzes import quizzes_bp
    # app.register_blueprint(quizzes_bp)
    with app.app_context():
    # This ensures init_gemini can use current_app.config['GEMINI_API_KEY']
        try:
            init_gemini()
        except Exception as e:
            print(f"Error initializing Gemini: {e}")
            

    return app

if __name__ == '__main__':
    app = create_app()
    print("Starting main Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
