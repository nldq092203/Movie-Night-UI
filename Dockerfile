# Use an official Node.js runtime as the base image
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the application using Vite
RUN npm run build

# Production image
FROM node:18

# Install `serve` globally to serve the static files
RUN npm install -g serve

# Set the working directory and copy the built application files
WORKDIR /app
COPY --from=build /app/dist /app

# Expose port (Railway will use the PORT environment variable)
EXPOSE 8080

# Start the application with serve
CMD ["serve", "-s", ".", "-l", "8080"]