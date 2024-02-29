# Use an official Node.js image as a base
FROM node:14

# Create app directory inside the container
WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Bundle app source inside /app
COPY src/backend/ src/backend/

RUN npm install

EXPOSE 3000

# Run the app when the container launches
CMD ["npm", "start"]
