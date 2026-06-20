# ---- Build stage: compile TypeScript to JavaScript ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (including dev deps, needed for tsc)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ---- Run stage: smaller image with only what's needed ----
FROM node:20-alpine
WORKDIR /app

# Only production deps in the final image
COPY package*.json ./
RUN npm install --omit=dev

# Copy the compiled output from the build stage
COPY --from=builder /app/dist ./dist

# Back4app provides PORT via env; our code already reads process.env.PORT
EXPOSE 5000
CMD ["node", "dist/index.js"]