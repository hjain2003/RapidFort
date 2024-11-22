# Use a stable Node.js image with Debian Bullseye for compatibility
FROM node:16-bullseye

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first
COPY server/package*.json ./

# Install necessary dependencies, including OpenSSL and PhantomJS requirements
RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl-dev \
    libssl1.1 \
    libfontconfig1 \
    libfreetype6 \
    gconf-service \
    libx11-6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variable to disable OpenSSL auto-configuration
ENV OPENSSL_CONF=/dev/null

# Expose the port that the backend listens on
EXPOSE 5000

# Command to start the application
CMD ["npm", "start"]
