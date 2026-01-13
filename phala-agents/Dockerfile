# Use lightweight Node image
FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# ✅ FIX: Install 'tsx' (Modern TypeScript Executor)
RUN npm install -g tsx

# ✅ FIX: Use 'tsx' instead of 'ts-node'
CMD ["tsx", "src/ai_agent_foss.ts"]