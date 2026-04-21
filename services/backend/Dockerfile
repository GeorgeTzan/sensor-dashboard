FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY .python-version pyproject.toml uv.lock ./

ENV UV_HTTP_TIMEOUT=120

RUN uv sync --frozen --no-cache

COPY app ./app

CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]