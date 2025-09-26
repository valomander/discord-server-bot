# 🌐 Discord Server Creator Bot - Website

Moderne, responsive Website für den AI-powered Discord Server Creator Bot.

## 🚀 Features

- **Responsive Design** - Funktioniert auf allen Geräten
- **Moderne Animationen** - AOS (Animate On Scroll) Integration
- **Interactive Elements** - Hover-Effekte, Ripple-Buttons, Particle-Animation
- **Performance-optimiert** - Lazy Loading, optimierte Assets
- **SEO-ready** - Meta-Tags, Open Graph, Schema.org
- **Accessibility** - WCAG-konform, Keyboard-Navigation

## 📁 Struktur

```
website/
├── index.html          # Hauptseite
├── css/
│   └── style.css       # Haupt-Stylesheet
├── js/
│   └── script.js       # JavaScript-Funktionalität
├── assets/             # Bilder, Icons, etc.
│   └── README.md       # Asset-Anleitung
└── README.md           # Diese Datei
```

## 🎨 Design-System

### Farben:
- **Primary:** #5865f2 (Discord Blau)
- **Secondary:** #4f46e5 (Indigo)
- **Accent:** #00d9ff (Cyan)
- **Success:** #00ff88 (Grün)
- **Warning:** #ffa500 (Orange)
- **Danger:** #ff6b6b (Rot)

### Typography:
- **Font:** Inter (Google Fonts)
- **Headings:** 700-800 weight
- **Body:** 400-500 weight
- **Code:** Fira Code (monospace)

### Animations:
- **Duration:** 0.3s - 0.8s
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)
- **AOS:** Fade, slide, zoom effects

## 🛠️ Entwicklung

### Lokaler Server:
```bash
# Mit Python
python -m http.server 8000

# Mit Node.js (live-server)
npx live-server

# Mit PHP
php -S localhost:8000
```

### Abhängigkeiten:
- **AOS:** https://unpkg.com/aos@2.3.1/dist/aos.js
- **Font Awesome:** https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
- **Google Fonts:** Inter

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🚀 Deployment

### GitHub Pages:
1. Push zur `main` branch
2. Aktiviere GitHub Pages in Settings
3. Wähle `/ (root)` oder `/website`

### Netlify:
1. Verbinde GitHub Repository
2. Build Command: (keine)
3. Publish Directory: `website`

### Vercel:
```bash
npm i -g vercel
vercel --prod
```

## 🔧 Anpassungen

### Bot-Links aktualisieren:
1. Ersetze `YOUR_CLIENT_ID` in index.html
2. Aktualisiere GitHub-Links
3. Füge echte Discord-Server-Links hinzu

### Assets hinzufügen:
- Favicon in `/assets/`
- Open Graph Images
- Bot-Screenshots
- Logo-Varianten

## 📊 Analytics

Füge Google Analytics oder ähnliche Tracking-Tools hinzu:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🛡️ Sicherheit

- **CSP Headers** für Content Security Policy
- **HTTPS** nur für Production
- **Rate Limiting** bei API-Aufrufen
- **Input Sanitization** bei Formularen

## 🎯 Performance

- **Bilder optimieren** (WebP, optimale Größen)
- **CSS/JS minifizieren** für Production
- **CDN verwenden** für Assets
- **Caching-Headers** konfigurieren

## 📈 SEO

- **Meta-Tags** vollständig
- **Schema.org** Markup
- **Sitemap.xml** generieren
- **robots.txt** konfigurieren