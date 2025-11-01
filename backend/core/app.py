"""
Core App
Главное приложение FastAPI с инициализацией модулей
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.database import init_db

# Импорт роутеров модулей
from modules.mentors.presentation.api.routes import router as mentors_router
from modules.work_records.presentation.api.routes import router as work_records_router
from modules.auth.presentation.api.routes import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle события приложения
    """
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    init_db()
    print("✅ Application started successfully")
    
    yield
    
    # Shutdown
    print("👋 Shutting down application")


# Создание приложения FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Подключение роутеров модулей
app.include_router(auth_router, prefix="/api")
app.include_router(mentors_router, prefix="/api/mentors", tags=["Mentors"])
app.include_router(work_records_router, prefix="/api/work-records", tags=["Work Records"])


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """
    Проверка здоровья API
    """
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "database": "connected"
    }

