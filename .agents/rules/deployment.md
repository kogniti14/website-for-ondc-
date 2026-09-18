# Hostinger CI/CD Deployment Protocol

- Always commit and push all website updates to GitHub (`origin main`).
- Hostinger is connected via webhook / GitHub integration to automatically deploy the live site on every push.
- Ensure the production build passes (`npm run build`) before pushing.
- Always verify that `git push origin main` finishes successfully and output is confirmed to the user.
