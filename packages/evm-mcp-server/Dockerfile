FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY src ./src
COPY bin ./bin

# Build the application
RUN bun run build && bun run build:http

# Expose the MCP server port (default 3001)
EXPOSE 3001

# Environment variables
ENV MCP_PORT=3001
ENV MCP_HOST=0.0.0.0
ENV NODE_ENV=production

# Run the HTTP server
CMD ["bun", "run", "build/http-server.js"]
