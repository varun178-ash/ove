FROM node:22-bookworm

# Install GCC so Railway can compile the VICE engine
RUN apt-get update && \
    apt-get install -y gcc libc6-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy VICE source
COPY engine ./engine

# Build VICE for Linux
RUN cd engine && \
    gcc *.c -o vice12_smp -pthread -O2 -Wall -Wextra

# Copy backend and frontend
COPY backend ./backend
COPY web ./web

# Start the OVE backend
CMD ["node", "backend/server.js"]