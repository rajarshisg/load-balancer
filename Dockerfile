# Step 1: Use an official Node.js runtime as a parent image
FROM node:22-slim

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (if available)
# This allows npm install to be cached unless package.json changes
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 4: Install TypeScript globally
RUN npm install -g typescript

# Step 6: Copy the rest of your application files into the container
COPY . .

# Step 7: Compile TypeScript to JavaScript
RUN tsc

# Step 8: Expose the application port
EXPOSE 3000

# Step 9: Run the app using node
CMD ["node", "dist/app.js"]