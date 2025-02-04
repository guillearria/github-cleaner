# GitHub Cleaner

A modern web application for efficiently managing and archiving GitHub repositories in bulk.

## Overview

GitHub Cleaner provides a user-friendly interface to help developers and organizations manage their GitHub repositories by enabling bulk archiving operations. This tool is perfect for users who need to clean up and organize their GitHub accounts by archiving multiple inactive repositories simultaneously.

## Features

- 🔐 Secure GitHub token-based authentication
- 📋 List all accessible repositories with detailed information
- ✅ Bulk selection of repositories for archiving
- 🔍 Search and filter repositories
- 📊 Progress tracking for archive operations
- 🎯 Simple and intuitive user interface

## Tech Stack

### Backend
- Python FastAPI
- PyGithub for GitHub API integration
- Pydantic for data validation
- Docker for containerization
- AWS (ECR & ECS) for deployment

### Frontend (Coming Soon)
- React with TypeScript
- Material-UI for components
- Axios for API calls

## Prerequisites

- Python 3.11 (Required - newer versions not yet supported)
- Node.js 16+
- GitHub Personal Access Token with repo scope
- Git
- Docker (for production deployment)

## Quick Start

### Local Development

1. **Clone and Setup**
```bash
# Clone the repository
git clone https://github.com/guillearria/github-cleaner.git
cd github-cleaner/backend

# Create virtual environment
py -3.11 -m venv venv
source venv/Scripts/activate  # On Windows with Git Bash: source venv/Scripts/activate

# Install the package in development mode
pip install -e .  # This installs the project as an editable package
```

2. **Configure Environment**
```bash
# Copy environment file and edit it
cp .env.example .env

# Required variables in .env:
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
FRONTEND_URL=http://localhost:3000
GH_TEST_TOKEN=your_github_token_here  # Your GitHub Personal Access Token
```

3. **Run the Server**
```bash
uvicorn app.main:app --reload
```

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run tests with coverage
cd backend
pytest
```

### Docker Build (Production)

```bash
cd backend
docker build -t github-cleaner-backend .
docker run -p 8000:8000 github-cleaner-backend
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment.

### CI Pipeline (on every push and PR)
- Runs Python 3.11 tests
- Performs code linting (black & flake8)
- Generates test coverage reports
- Uploads coverage to Codecov

### CD Pipeline (on main branch and tags)
- Builds Docker image
- Pushes to Amazon ECR
- Deploys to ECS

### Required Secrets
Set these in your GitHub repository settings:
```
GH_TEST_TOKEN - For running tests (GitHub Personal Access Token)
AWS_ACCESS_KEY_ID - For AWS access
AWS_SECRET_ACCESS_KEY - For AWS access
AWS_REGION - Your AWS region
```

## API Documentation

### Authentication
All endpoints require GitHub token:
```
Authorization: Bearer <github_token>
```

### Endpoints

#### 1. Validate Token
```
POST /api/validate-token
Response: { "valid": boolean, "username": string }
```

#### 2. List Repositories
```
GET /api/repositories
Query params:
- page: number (default: 1)
- per_page: number (default: 30, max: 100)
- search: string (optional)
- sort: "updated" | "name" | "stars"
- order: "asc" | "desc"
```

#### 3. Archive Repositories
```
POST /api/archive
Body: { "repository_ids": number[] }
```

## Project Structure
```
github-cleaner/
├── backend/                # Python package root
│   ├── app/               # Main application package
│   │   ├── api/          # API routes
│   │   ├── core/         # Core configuration
│   │   ├── models/       # Pydantic models
│   │   └── services/     # Business logic
│   ├── tests/            # Test files
│   ├── setup.py          # Package configuration
│   ├── requirements.txt  # Project dependencies
│   └── Dockerfile        # Production container
├── .github/
│   └── workflows/        # CI/CD pipelines
└── frontend/            # Coming soon
```

The backend is set up as a proper Python package, which means:
- It can be installed with pip (we use `pip install -e .` for development)
- It has a clear dependency structure (defined in setup.py)
- It supports absolute imports (e.g., `from app.models import X`)

## Security

- GitHub tokens stored only in session storage
- All sensitive operations through backend
- Rate limiting for API abuse prevention
- Input validation on all endpoints
- CORS protection enabled
- Containerized deployment
- Environment-based configuration

## License

MIT License - see [LICENSE](LICENSE)

## Support

Open an issue or contact maintainers for support.