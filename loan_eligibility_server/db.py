"""Database connection helpers: timeouts and user-friendly errors."""

from __future__ import annotations

import concurrent.futures
import os
from typing import NoReturn

from fastapi import HTTPException, status
from prisma import Prisma

DB_CONNECT_TIMEOUT_SEC = float(os.getenv("DB_CONNECT_TIMEOUT_SEC", "10"))


def configure_database_url() -> None:
    """Ensure PostgreSQL connect_timeout is set so Prisma does not hang indefinitely."""
    url = os.environ.get("DATABASE_URL")
    if not url or "connect_timeout=" in url:
        return
    separator = "&" if "?" in url else "?"
    timeout = int(DB_CONNECT_TIMEOUT_SEC)
    os.environ["DATABASE_URL"] = f"{url}{separator}connect_timeout={timeout}"


def connect_db(db: Prisma, timeout_sec: float | None = None) -> None:
    """Connect with a wall-clock timeout (Prisma connect can block the worker thread)."""
    limit = timeout_sec if timeout_sec is not None else DB_CONNECT_TIMEOUT_SEC
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(db.connect)
        try:
            future.result(timeout=limit)
        except concurrent.futures.TimeoutError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    f"Database connection timed out after {int(limit)}s. "
                    "The database may be waking up—please try again shortly."
                ),
            ) from exc


def raise_db_http_exception(exc: Exception) -> NoReturn:
    """Map Prisma / driver errors to appropriate HTTP responses."""
    message = str(exc)
    lower = message.lower()

    if "P1001" in message or "can't reach database" in lower:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is temporarily unavailable. Please try again in a moment.",
        ) from exc

    if "timeout" in lower or "timed out" in lower:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Database request timed out. Please try again.",
        ) from exc

    if "P1000" in message or "authentication failed" in lower:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database authentication failed. Check server configuration.",
        ) from exc

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected database error occurred.",
    ) from exc
