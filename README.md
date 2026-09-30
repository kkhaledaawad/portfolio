# Alaa Hossam — Portfolio (macOS style)

Static site: `index.html` + `css/` + `js/` + `assets/`. No build step needed.

## Deploy to Vercel (GitHub)
1. Create a free account at github.com → **New repository** named `alaa-portfolio` (Public).
2. On the repo page click **"uploading an existing file"** → drag `index.html`, `README.md`, and the `css`, `js`, `assets` folders → **Commit changes**.
3. Go to vercel.com → **Sign Up → Continue with GitHub**.
4. **Add New… → Project** → import `alaa-portfolio` → Framework Preset: **Other** → **Deploy**.
5. Live at `alaa-portfolio.vercel.app` 🎉
   - To change the URL: Vercel → project → **Settings → General → Project Name**.

## Deploy with Vercel CLI (if you have Node.js)
```
npm i -g vercel
vercel --prod
```

## Notes
- Facebook/Instagram embeds load from their CDNs on the live site — the pages must stay **Public**.
- CV PDF is bundled at `assets/Alaa_Hossam_CV.pdf` (Download CV buttons).
