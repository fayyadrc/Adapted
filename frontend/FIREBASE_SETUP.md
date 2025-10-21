# Firebase Configuration Setup

## Environment Variables

To run this project, you need to set up your Firebase configuration using environment variables.

### Setup Steps:

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your actual Firebase credentials in `.env`:**
   - Go to your Firebase Console
   - Select your project
   - Go to Project Settings > General
   - Copy your web app configuration values

3. **Update the `.env` file with your actual values:**
   ```env
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-actual-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
   VITE_FIREBASE_APP_ID=your-actual-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-actual-measurement-id
   ```

4. **The `.env` file is already in `.gitignore`** so your credentials won't be committed to the repository.

## Security Note

- Never commit your actual Firebase credentials to version control
- Always use environment variables for sensitive configuration
- The `firebaseConfig.js` file now uses environment variables with fallback dummy values