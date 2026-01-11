# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Default command (will be overridden by docker-compose)
CMD ["npx", "tsx", "src/ai_agent_foss.ts"]