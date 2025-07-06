# Stage 1: Base
FROM python:3.10-slim

# Install Node.js for Prisma CLI
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Set working directory
WORKDIR /app

# Install backend Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies for Prisma CLI
COPY package.json package-lock.json ./
RUN npm install

# Copy everything else
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 10000

# Start FastAPI
CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port=10000"]
