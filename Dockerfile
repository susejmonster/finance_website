# Dockerfile.dev
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install dependencies first (takes advantage of Docker layer caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the default Metro bundler port
EXPOSE 8081

# Start the Expo development server
CMD ["npm", "start"]