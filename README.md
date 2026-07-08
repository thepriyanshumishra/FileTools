# 🚀 FileTools - Free Online File Utilities

[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> Convert, compress, and edit your files instantly in your browser. Fast, secure, and completely free.

**Live Demo:** [https://filetools.vercel.app](https://filetools.vercel.app)

---

## ✨ Features

### 🎨 **NEW: v2.0 Flagship Studio Workspaces**
- 📷 **PhotoSuite Image Studio (`/tools/studio/image`)** - Interactive canvas filters, adjustments (brightness, blur, saturation), drawing brush, annotations, and custom crop overlay.
- 📄 **DocFlow PDF Studio (`/tools/studio/pdf`)** - Drag-and-drop page sorting grid, page rotations, exclusions, watermark overlays, password lock protection, and custom visual signature stamping.
- 🎬 **TimelineStudio Video & Audio Editor (`/tools/studio/video-audio`)** - Double-handle range trim track, Web Audio API audio waveform renderer, volume/speed bounds, and client-side transcode compilation via FFmpeg WASM.
- ⚡ **CodeFormat Document Studio (`/tools/studio/document`)** - Split source editor vs syntax-highlighted formatter (JSON, HTML, CSS, XML, MD) and custom spreadsheet grid cell editor for CSV files.
- 📦 **Offline-First State Cache** - Debounced IndexedDB auto-saving mechanism that caches document file bytes and configuration sliders to restore work drafts dynamically.

### 🛠️ **95+ Working Tools**
- **PDF Tools (14)** - Merge, Split, Compress, Rotate, Watermark, Extract, Protect
- **Image Tools** - Compress, Resize, Convert, Crop, Filters, Rotate, Flip
- **Video Tools** - Compress, Trim, Extract Audio, Merge, Rotate, Speed Control
- **Audio Tools** - Compress, Trim, Merge, Volume, Speed, Fade, Reverse
- **Document Tools** - JSON, XML, CSV, HTML, CSS, JS formatting & conversion
- **Archive Tools** - ZIP create, extract, view contents

### 🔒 **Privacy & Security**
- ✅ **100% Client-Side Processing** - Files never leave your device
- ✅ **No Server Uploads** - Everything runs in your browser
- ✅ **Rate Limiting** - Prevents abuse (100 req/hour)
- ✅ **Device-Specific Limits** - 50MB mobile, 500MB desktop

### 📱 **Progressive Web App (PWA)**
- ✅ **Installable** - Add to home screen on any device
- ✅ **Offline Support** - Works without internet
- ✅ **Standalone Mode** - Runs like a native app
- ✅ **Service Worker** - Caches resources for fast loading

### 📊 **Analytics & Admin**
- ✅ **Usage Tracking** - Tool views, processes, errors
- ✅ **Admin Dashboard** - Manage tools, settings, analytics
- ✅ **Universal Controls** - API-based settings for all users
- ✅ **Maintenance Mode** - Site-wide toggle

### 🎨 **User Experience**
- ✅ **Dark/Light Theme** - Animated theme toggle
- ✅ **Responsive Design** - Mobile, tablet, desktop optimized
- ✅ **Drag & Drop** - Easy file uploads
- ✅ **Keyboard Shortcuts** - ⌘K search, ⌘U upload
- ✅ **History & Favorites** - Track recent tools and bookmarks

### 🔍 **SEO Optimized**
- ✅ **80+ Pages Indexed** - Homepage, tools, blog
- ✅ **Schema Markup** - WebApplication + FAQ structured data
- ✅ **Blog** - 36 SEO-rich articles
- ✅ **Sitemap** - Auto-generated for all pages
- ✅ **Open Graph** - Social media previews

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/thepriyanshumishra/FileTools.git
cd FileTools

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Upstash Redis credentials to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 🎉 What's New in v2.0?

Check out the latest enhancements:
- 🚀 [Quick Start Guide](docs/guides/QUICK_START.md) - Get started quickly
- 📂 [File Structure](FILE_STRUCTURE.md) - Project organization
- 🗺️ [Roadmap](docs/development/ROADMAP.md) - Development roadmap
- 📖 [Improvements](docs/development/IMPROVEMENTS.md) - Detailed improvements
- 📋 [Changes Summary](docs/development/CHANGES_SUMMARY.md) - Complete changelog

### Build for Production

```bash
npm run build
npm start
```

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15.5.5** | React framework with Turbopack |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Upstash Redis** | Persistent storage (free tier) |
| **Vercel** | Deployment & hosting |
| **FFmpeg.wasm** | Video/audio processing |
| **pdf-lib** | PDF manipulation |
| **Zustand** | State management |

---

## 📁 Project Structure

```
filetools/
├── src/
│   ├── app/
│   │   ├── (auth)/admin/          # Admin dashboard
│   │   ├── (tools)/tools/[type]/  # Tool pages
│   │   ├── api/                   # API routes
│   │   ├── blog/                  # Blog pages
│   │   └── page.tsx               # Homepage
│   ├── components/
│   │   ├── ui/                    # UI components
│   │   └── pwa-install.tsx        # PWA prompt
│   ├── lib/
│   │   ├── store/                 # Zustand stores
│   │   └── utils/                 # Utility functions
│   └── hooks/                     # Custom React hooks
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   ├── robots.txt                 # SEO robots
│   └── icons/                     # App icons
└── package.json
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:

```env
# Upstash Redis (Required for persistence)
KV_REST_API_URL=your_upstash_redis_rest_url
KV_REST_API_TOKEN=your_upstash_redis_rest_token
```

### Admin Access

- **URL:** `/admin`
- **Username:** `thedarkpcm`
- **Password:** `Priyanshu@2427`

---

## 📊 Key Features Breakdown

### Client-Side Processing
All file operations use browser APIs:
- **Images:** Canvas API, browser-image-compression
- **PDFs:** pdf-lib
- **Videos/Audio:** FFmpeg.wasm
- **Documents:** Native JavaScript parsers

### Rate Limiting
- Analytics API: 100 requests/hour
- Admin API: 20 requests/hour
- IP-based tracking with auto-cleanup

### PWA Implementation
- Manifest with app metadata
- Service worker for offline caching
- Install prompt component
- 192x192 and 512x512 icons

---

## 🎯 Performance

- **First Load JS:** ~187KB
- **Build Time:** ~30 seconds
- **Lighthouse Score:** 95+ (Performance, Accessibility, SEO)
- **Zero Server Load:** All processing client-side

---

## 📈 SEO Features

- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Card tags
- ✅ Schema.org structured data
- ✅ Dynamic sitemap (50+ pages)
- ✅ Robots.txt
- ✅ Blog with keyword-rich content
- ✅ FAQ schema for rich snippets

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Adding New Tools

1. Add tool definition to `src/lib/utils/file-types.ts`
2. Implement processing logic in appropriate `*-tools.ts` file
3. Add route handler in `src/lib/utils/tool-processor.ts`
4. Tool automatically appears on the site!

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting platform
- [Upstash](https://upstash.com/) - Redis database
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) - Video/audio processing
- [pdf-lib](https://pdf-lib.js.org/) - PDF manipulation

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/thepriyanshumishra/FileTools/issues)
- **Discussions:** [GitHub Discussions](https://github.com/thepriyanshumishra/FileTools/discussions)
- **Email:** support@filetools.com

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

Auto-deploys on every push to `main` branch.

---

## 📊 Stats

- **Total Tools:** 95+
- **File Formats:** 40+
- **Pages:** 80+
- **Components:** 18 (+5 new)
- **Hooks:** 9 (+6 new)
- **API Routes:** 3
- **Blog Posts:** 36
- **Performance:** 40% faster, 36% smaller bundle
- **Phase 1:** ✅ Complete (22 new files)

---

**Built with ❤️ by [Priyanshu Mishra](https://github.com/thepriyanshumishra)**

⭐ Star this repo if you find it useful!
