# Use official Node image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json from Backend
COPY Backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy all backend source files to container
COPY Backend/ .

# Expose port (optional, helpful for local testing)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
