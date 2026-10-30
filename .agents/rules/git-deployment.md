# Automated Git and Vercel Deployment Workflow

Whenever code changes are made, tested, and verified:
1. Always run `npm run build` in `client/` (and any relevant checks) to ensure production build succeeds without errors.
2. Automatically stage all relevant changes with `git add`.
3. Commit with a concise, descriptive conventional commit message.
4. Automatically push to GitHub (`origin/development` or the current working branch) without waiting for explicit prompt.
5. Pushing to GitHub automatically triggers the connected Vercel deployment pipeline.
6. Never force-push or merge into `main` directly unless explicitly directed by the user.
