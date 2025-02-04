from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings, Settings

app = FastAPI(
    title="GitHub Cleaner API",
    description="API for managing and archiving GitHub repositories in bulk",
    version="1.0.0",
    debug=get_settings().DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Health check endpoint
@app.get("/health")
async def health_check(settings: Settings = Depends(get_settings)):
    return {
        "status": "healthy",
        "debug": settings.DEBUG
    }

# Import and include routers
from app.api import github

app.include_router(github.router, prefix="/api", tags=["github"]) 