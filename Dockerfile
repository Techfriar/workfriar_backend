# Use an official Node.js runtime as a parent image
FROM node:20-alpine
# Set the working directory inside the container
WORKDIR /app
# Copy package.json and yarn.lock
COPY package.json yarn.lock ./
# Install dependencies
RUN yarn install
# Copy the rest of the application code
COPY . .
# Expose the application port
EXPOSE 3002

# Define the command to run the application
CMD ["yarn", "server"]
