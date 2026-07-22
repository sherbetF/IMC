# Outsource DB - Medical Scan Management System

A web-based medical scan management system built with React, Vite, Tailwind CSS, and Firebase (Authentication, Firestore, and Firebase Storage).

---

## 🚀 Deploying and Hosting on GitHub Pages

This project is pre-configured for deployment and hosting on **GitHub Pages**.

### Method 1: Automated Deployment via GitHub Actions (Recommended)

1. **Export or Push Code to GitHub**
   - Push your code to your GitHub repository on the `main` or `master` branch.

2. **Enable GitHub Pages in Repository Settings**
   - Go to your GitHub repository.
   - Click on **Settings** -> **Pages** (under Code and automation).
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**.

3. **Done!**
   - Whenever you push changes to `main` or `master`, the GitHub Action defined in `.github/workflows/deploy.yml` will automatically build and publish your site to `https://<your-username>.github.io/<repository-name>/`.

---

### Method 2: Manual Deployment via `gh-pages` CLI

If you prefer deploying directly from your terminal:

```bash
# Install dependencies
npm install

# Build and deploy to the gh-pages branch automatically
npm run deploy
```

Then in GitHub repository **Settings** -> **Pages**, choose **Deploy from a branch** and select the `gh-pages` branch.

---

## 🔒 Firebase Configuration

The app reads configuration seamlessly from `firebase-applet-config.json` committed in the repository or from standard Vite environment variables (`.env` or GitHub Secrets):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=outsource-f1e0f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=outsource-f1e0f
VITE_FIREBASE_STORAGE_BUCKET=outsource-f1e0f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=428092829658
VITE_FIREBASE_APP_ID=1:...
VITE_FIREBASE_DATABASE_ID=ai-studio-outsourcedatabas-932d6106-b948-4503-a6fd-7143b5e143ff
```

---

## 🛡️ Admin Dashboard Access

- **Admin User ID**: `ogTzhERlbpPhRFsicEkdUCvma1S2`
- Log in with your admin credentials to access global multi-hospital records management, scan verification, CSV export, and storage meters.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

Visit `http://localhost:3000` in your browser.
