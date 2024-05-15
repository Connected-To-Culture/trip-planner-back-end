FROM node:21

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variable for MongoDB URL
ENV MONGODB_URL="mongodb+srv://cluster0.kxipss1.mongodb.net/"

# Build the application
RUN npm run build

# Expose the port your app runs on
EXPOSE 4000

# Command to run the application
CMD ["npm", "start"]
