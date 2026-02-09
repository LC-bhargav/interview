# Use Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for some python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY functions/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the functions code
# Note: We copy to /app so import app works
COPY functions/ .

# Expose port
EXPOSE 8080

# Run the application
# Railway expects PORT env var
CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:$PORT"]
