import sys
import os
from pathlib import Path

# Add backend folder to sys.path so Django apps can be imported
BASE_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dost.settings')

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
