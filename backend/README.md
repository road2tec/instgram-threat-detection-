# Cyber Incident Feed Monitoring Tool - Backend

Flask-based backend API for monitoring and analyzing cyber security incidents.

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── config/               # Configuration files
│   ├── __init__.py
│   └── config.py
├── routes/               # API routes
│   ├── __init__.py
│   ├── incidents.py
│   └── analysis.py
├── services/             # Business logic
│   ├── __init__.py
│   └── incident_service.py
├── models/               # Data models
│   ├── __init__.py
│   └── incident.py
├── ml_module/            # Machine Learning module
│   ├── __init__.py
│   └── classifier.py
├── data/                 # Data storage
├── requirements.txt      # Python dependencies
└── .env                  # Environment variables
```

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Incidents
- `GET /api/incidents` - Get all incidents
- `GET /api/incidents/<id>` - Get specific incident
- `POST /api/incidents/refresh` - Refresh incidents from feeds
- `GET /api/incidents/stats` - Get incident statistics

### Analysis
- `GET /api/analysis/trends` - Get incident trends
- `GET /api/analysis/severity-distribution` - Get severity distribution
- `GET /api/analysis/category-distribution` - Get category distribution
- `GET /api/analysis/timeline` - Get incident timeline

## Features

- RSS feed parsing for cyber incident data
- Machine Learning-based incident classification
- Severity and category detection
- Trend analysis
- RESTful API design
- CORS enabled for frontend integration
