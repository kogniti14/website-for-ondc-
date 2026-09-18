# Kogniti Minds - Agent Guidelines & Deployment Protocol

## Automatic GitHub & Hostinger Deployment Rule
- **Mandatory Git Push**: Whenever you make any changes or updates to the website, ensure all modifications are properly committed and pushed to the connected GitHub repository (`origin main`).
- **Live Hostinger Hosting Sync**: The GitHub repository is connected to Hostinger hosting CI/CD, meaning every pushed commit automatically builds and deploys directly to the live website.
- **No Local-Only State**: Never leave code changes only in the local development environment.
- **Verification**: After every update, run `npm run build` to ensure zero compilation/type errors, stage the modified files, commit them with a clean and descriptive message, and execute `git push origin main`.
