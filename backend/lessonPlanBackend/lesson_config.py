import os
from dotenv import load_dotenv

load_dotenv()

class LessonConfig:
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

    TEXT_MODEL = os.environ.get(
        "GEMINI_TEXT_MODEL",
        "gemini-2.0-flash"
    )

    IMAGE_MODEL = os.environ.get(
        "GEMINI_IMAGE_MODEL",
        "gemini-2.0-flash-exp-image-generation"
    )

    IMAGE_TIMEOUT = int(os.environ.get("IMAGE_TIMEOUT", 60))
