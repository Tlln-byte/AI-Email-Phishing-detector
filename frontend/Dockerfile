# ---- Base image ----
FROM node:18 as build

WORKDIR /app

# Copy dependency files first for better caching
COPY package.json package-lock.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force && npm config set registry https://registry.npmjs.org/ && npm install --legacy-peer-deps --no-audit --progress=false || cat /app/npm-debug.log

# Copy the rest of the code and build
COPY . /app
RUN npm run build

# ---- Production image ----
FROM node:18-slim

WORKDIR /app

# Install `serve` globally to serve static files
RUN npm install -g serve

# Copy build output from build stage
COPY --from=build /app/build ./build

EXPOSE 3000

# Serve the React app
CMD ["serve", "-s", "build", "-l", "3000"]
