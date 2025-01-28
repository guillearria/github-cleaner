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

### Frontend
- React with TypeScript
- Material-UI for components
- Axios for API calls

### Backend
- Python FastAPI
- PyGithub for GitHub API integration
- Pydantic for data validation

## Prerequisites

- Python 3.8+
- Node.js 16+
- GitHub Personal Access Token with repo scope

## Installation

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/guillearria/github-cleaner.git
cd github-cleaner/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## API Documentation

### Authentication

All API endpoints require a valid GitHub token to be passed in the Authorization header.

```
Authorization: Bearer <github_token>
```

### Endpoints

#### 1. Validate Token
- **URL**: `/api/validate-token`
- **Method**: `POST`
- **Description**: Validates the provided GitHub token
- **Request Body**: None
- **Response**:
  ```json
  {
    "valid": boolean,
    "username": string
  }
  ```

#### 2. List Repositories
- **URL**: `/api/repositories`
- **Method**: `GET`
- **Description**: Retrieves user's repositories with pagination
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `per_page`: Items per page (default: 30)
  - `search`: Search term (optional)
  - `sort`: Sort field (optional: "updated", "name", "stars")
  - `order`: Sort order (optional: "asc", "desc")
- **Response**:
  ```json
  {
    "repositories": [
      {
        "id": number,
        "name": string,
        "full_name": string,
        "description": string,
        "archived": boolean,
        "updated_at": string,
        "stars": number,
        "language": string
      }
    ],
    "total_count": number,
    "current_page": number,
    "total_pages": number
  }
  ```

#### 3. Archive Repositories
- **URL**: `/api/archive`
- **Method**: `POST`
- **Description**: Archives multiple repositories
- **Request Body**:
  ```json
  {
    "repository_ids": number[]
  }
  ```
- **Response**:
  ```json
  {
    "success": boolean,
    "archived_count": number,
    "failed_repositories": [
      {
        "id": number,
        "name": string,
        "error": string
      }
    ]
  }
  ```

## Development Guidelines

### Code Structure

```
github-cleaner/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API integration
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript definitions
├── backend/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── services/       # Business logic
│   │   └── models/         # Data models
├── tests/                  # Test files
└── docs/                   # Additional documentation
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Security Considerations

- GitHub tokens are stored only in session storage
- All sensitive operations are performed through the backend
- Rate limiting is implemented to prevent API abuse
- Input validation is performed on all endpoints
- CORS protection is enabled

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.