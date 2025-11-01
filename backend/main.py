"""
Main Entry Point
Точка входа для запуска приложения
"""

import uvicorn

from core.config import settings


if __name__ == "__main__":
    uvicorn.run(
        "core.app:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )

