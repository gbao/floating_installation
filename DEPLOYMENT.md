# GitHub Pages Deployment Guide

## Quick Setup (2 minutes)

### Option 1: Enable GitHub Pages (Recommended)

1. **Navigate to your repository on GitHub**
   - Go to `https://github.com/gbao/floating_installation`

2. **Access Settings**
   - Click on **Settings** tab in your repository
   - Scroll down to **Pages** section in the left sidebar

3. **Configure Source**
   - Under "Build and deployment"
   - Source: Select **Deploy from a branch**
   - Branch: Select **claude/turbine-assembly-viz-014Mq5WHXPPMb4qS5ibQBk8c**
   - Folder: Select **/ (root)**
   - Click **Save**

4. **Wait for Deployment**
   - GitHub will automatically build and deploy your site
   - This usually takes 1-2 minutes
   - A green checkmark will appear when ready

5. **Access Your Site**
   - Your site will be available at:
   - `https://gbao.github.io/floating_installation/`

### Option 2: GitHub Actions (Alternative)

If you prefer automated deployments with GitHub Actions:

1. Merge this branch to `main` or `master`
2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/configure-pages@v3
      - uses: actions/upload-pages-artifact@v2
        with:
          path: '.'
      - id: deployment
        uses: actions/deploy-pages@v2
```

3. Enable GitHub Pages in Settings → Pages
4. Select "GitHub Actions" as the source

## Verification

Once deployed, verify your site by:

1. Opening the URL in your browser
2. Check that all charts load correctly
3. Test the interactive controls:
   - Adjust turbine count slider
   - Modify learning rate
   - Click "Recalculate Predictions"
4. Verify responsive design on mobile devices

## Troubleshooting

### Site not loading?
- Wait 5 minutes for GitHub's CDN to propagate
- Check Settings → Pages for deployment status
- Look for error messages in Actions tab

### Charts not displaying?
- Check browser console for JavaScript errors
- Ensure Chart.js CDN is accessible
- Verify all files (index.html, app.js, styles.css) are in the repository

### 404 Error?
- Confirm the branch name is correct
- Ensure GitHub Pages is enabled
- Check that index.html is in the root directory

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file with your domain name
2. Configure DNS settings with your domain provider:
   - Type: CNAME
   - Name: www
   - Value: gbao.github.io
3. Enable "Enforce HTTPS" in GitHub Pages settings

## Local Testing

To test locally before deploying:

```bash
# Python 3
python3 -m http.server 8000

# Then visit: http://localhost:8000
```

## Updates

To update the site after making changes:

```bash
git add .
git commit -m "Update visualization"
git push origin claude/turbine-assembly-viz-014Mq5WHXPPMb4qS5ibQBk8c
```

GitHub Pages will automatically rebuild within 1-2 minutes.

## Performance Optimization

For production deployment, consider:

- Minifying CSS and JavaScript
- Optimizing images (if added)
- Enabling browser caching
- Using a CDN for Chart.js (already implemented)

## Support

If you encounter issues:
- Check GitHub Pages documentation: https://docs.github.com/pages
- Verify repository settings and permissions
- Review browser console for errors
- Ensure all files are committed and pushed

---

**Your visualization is ready to share with the world!**
