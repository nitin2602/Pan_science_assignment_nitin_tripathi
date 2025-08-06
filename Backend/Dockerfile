# Use official Node.js image
FROM node:18

# Set working directory in the container
WORKDIR /app

# Copy only package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy all files from current directory (Backend/) into the container
COPY . .

# Expose port (optional; for local Docker runs)
EXPOSE 5000

# Run the server
CMD ["node", "server.js"]
