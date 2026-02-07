# mutationtrainer-react

A React-based mutation trainer app.

## GitHub Pages Deployment

This app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

**Live URL:** https://katyjohannab.github.io/mutationtrainer-react/

### Deployment Setup

1. **GitHub Pages Source**: In the repository settings, GitHub Pages should be configured to deploy from **GitHub Actions** (not from a branch).

2. **Workflow**: The deployment is handled by `.github/workflows/deploy.yml` which:
   - Builds the Vite app
   - Uploads the `dist/` folder to GitHub Pages

3. **Important Configuration**:
   - `vite.config.js` sets `base: '/mutationtrainer-react/'` for correct asset paths
   - `public/.nojekyll` prevents Jekyll processing on GitHub Pages

### Troubleshooting Deployment

If the site doesn't update after a successful workflow run:
- Try hard-refreshing your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Open the site in an incognito/private window
- Check that GitHub Pages is enabled in Settings > Pages with source set to "GitHub Actions"

---

## Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
