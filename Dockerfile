# Base image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

# Copy environment variables file into the build container
COPY .env .env  

# Build the app with Vite
RUN npm run build

# Serve the build with a lightweight server
FROM node:18-alpine AS serve
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist /app/dist
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]