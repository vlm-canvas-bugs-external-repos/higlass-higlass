# Quick Start Guide for Higlass

## Steps to Setup and Run the Project

1. **Start with a Clean Repository**:
   - Ensure you have cloned the `higlass-higlass` repository.

2. **Use Node Version 20**:
   - Use nvm to switch to Node.js version 20:
     ```bash
     nvm use 20
     ```

3. **Install Node.js Dependencies**:
   - Cleanly install the dependencies using npm:
     ```bash
     npm clean-install
     ```

4. **Start the Development Server**:
   - Run the following command to start the server:
     ```bash
     npm run start
     ```
   - This will start a server in development mode at `http://localhost:5173/`.

5. **View Examples**:
   - Once the server is running, examples can be explored by navigating to:
     ```plaintext
     http://localhost:8080/examples.html
     ```

## Troubleshooting
- If you face installation issues related to `sharp` and `node-gyp`, you can run:
  ```bash
  npm ci --python=/usr/bin/python2 && rm -rf node_modules/node-sass && npm ci
  ```

## Summary
This Quick Start will help you quickly set up and run the Higlass project. Follow these steps to start the development server and explore the application.