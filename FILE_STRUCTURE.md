# 📂 FileTools Project Structure

## Root Directory
```
filetools/
├── docs/                        # 📚 Documentation
├── public/                      # 🌐 Static assets
├── src/                         # 💻 Source code
├── .env.local                   # 🔐 Environment variables
├── next.config.ts               # ⚙️ Next.js configuration
├── package.json                 # 📦 Dependencies
├── tsconfig.json                # 🔧 TypeScript config
└── README.md                    # 📖 Main documentation
```

## Documentation (`docs/`)
```
docs/
├── README.md                    # Documentation index
├── guides/                      # User guides
│   └── QUICK_START.md           # Quick start guide
├── development/                 # Development docs
│   ├── ROADMAP.md               # Development roadmap
│   ├── IMPROVEMENTS.md          # Improvements log
│   ├── CHANGES_SUMMARY.md       # Changes summary
│   └── IMPLEMENTATION_COMPLETE.md
├── deployment/                  # Deployment docs
│   ├── DEPLOYMENT_CHECKLIST.md
│   └── VISUAL_GUIDE.md
└── phases/                      # Phase completion reports
    ├── PHASE_1.1_COMPLETED.md
    └── ORGANIZATION_COMPLETE.md
```

## Source Code (`src/`)
```
src/
├── app/                         # 📱 Next.js App Router
│   ├── (auth)/                  # 🔒 Auth routes
│   │   └── admin/               # Admin dashboard
│   ├── (tools)/                 # 🛠️ Tool routes
│   │   └── tools/[type]/        # Dynamic tool pages
│   ├── api/                     # 🔌 API routes
│   │   ├── admin/               # Admin APIs
│   │   └── analytics/           # Analytics APIs
│   ├── blog/                    # 📝 Blog pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── not-found.tsx            # 404 page
│   ├── globals.css              # Global styles
│   └── sitemap.ts               # SEO sitemap
│
├── components/                  # 🧩 React components
│   ├── ui/                      # UI components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── logo-icon.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── progress-bar.tsx
│   │   ├── scroll-to-top.tsx
│   │   ├── quick-actions.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   ├── ripple-button.tsx
│   │   ├── search-modal.tsx
│   │   ├── shortcuts-modal.tsx
│   │   ├── history-panel.tsx
│   │   ├── settings-panel.tsx
│   │   ├── tool-options.tsx
│   │   ├── maintenance-mode.tsx
│   │   ├── rate-limit-warning.tsx
│   │   ├── browser-warning.tsx
│   │   ├── loading.tsx
│   │   └── animated-background.tsx
│   ├── providers.tsx            # Context providers
│   └── pwa-install.tsx          # PWA install prompt
│
├── hooks/                       # 🎣 Custom React hooks
│   ├── use-keyboard-shortcuts.ts
│   ├── use-image-worker.ts      # Web Worker hook
│   └── use-stream-processor.ts  # Streaming hook
│
├── lib/                         # 📚 Libraries & utilities
│   ├── store/                   # 💾 Zustand stores
│   │   ├── admin-settings.ts
│   │   ├── favorites.ts
│   │   └── history.ts
│   ├── utils/                   # 🔧 Utility functions
│   │   ├── file-types.ts        # File type definitions
│   │   ├── file-validation.ts   # File validation
│   │   ├── file-conversion.ts   # File conversion
│   │   ├── tool-processor.ts    # Tool processing
│   │   ├── tool-instructions.ts # Tool instructions
│   │   ├── tool-options-config.ts
│   │   ├── image-tools.ts       # Image processing
│   │   ├── video-tools.ts       # Video processing
│   │   ├── audio-tools.ts       # Audio processing
│   │   ├── pdf-tools.ts         # PDF processing
│   │   ├── document-tools.ts    # Document processing
│   │   ├── archive-tools.ts     # Archive processing
│   │   ├── ffmpeg-loader.ts     # 🆕 Lazy FFmpeg loader
│   │   ├── worker-manager.ts    # 🆕 Web Worker manager
│   │   ├── stream-processor.ts  # 🆕 Streaming processor
│   │   ├── dynamic-imports.ts   # 🆕 Code splitting
│   │   ├── analytics.ts         # Analytics
│   │   ├── rate-limit.ts        # Rate limiting
│   │   ├── browser-detection.ts # Browser detection
│   │   └── index.ts             # Exports
│   └── blog-data.ts             # Blog data
│
└── workers/                     # 👷 Web Workers
    └── image-worker.ts          # 🆕 Image processing worker
```

## Public Assets (`public/`)
```
public/
├── icons/                       # App icons
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── logo.svg                     # Logo file
├── manifest.json                # PWA manifest
├── sw.js                        # Service worker
└── robots.txt                   # SEO robots
```

## Key Files

### Configuration
- `next.config.ts` - Next.js config with image optimization, code splitting
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `.env.local` - Environment variables (Upstash Redis)

### Entry Points
- `src/app/layout.tsx` - Root layout with providers
- `src/app/page.tsx` - Homepage
- `src/app/globals.css` - Global styles

### Core Logic
- `src/lib/utils/tool-processor.ts` - Main tool processing logic
- `src/lib/utils/file-types.ts` - File type definitions (95+ tools)
- `src/lib/store/` - State management (Zustand)

### Performance (Phase 1.1)
- `src/lib/utils/ffmpeg-loader.ts` - Lazy FFmpeg loading
- `src/workers/image-worker.ts` - Web Worker for images
- `src/lib/utils/stream-processor.ts` - Streaming for large files
- `src/lib/utils/dynamic-imports.ts` - Code splitting

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `logo-icon.tsx`)
- **Hooks**: `use-*.ts` (e.g., `use-image-worker.ts`)
- **Utils**: `kebab-case.ts` (e.g., `stream-processor.ts`)
- **Workers**: `*-worker.ts` (e.g., `image-worker.ts`)
- **Stores**: `kebab-case.ts` (e.g., `admin-settings.ts`)

## Import Aliases

- `@/` - Maps to `src/`
- Example: `import { loadFFmpeg } from '@/lib/utils/video-tools'`

## New Files (Phase 1.1)

### Performance Optimization
1. `src/lib/utils/ffmpeg-loader.ts` - Lazy FFmpeg loader
2. `src/workers/image-worker.ts` - Web Worker for image processing
3. `src/lib/utils/worker-manager.ts` - Worker lifecycle management
4. `src/lib/utils/stream-processor.ts` - Streaming file processor
5. `src/lib/utils/dynamic-imports.ts` - Dynamic imports for code splitting
6. `src/hooks/use-image-worker.ts` - React hook for Web Worker
7. `src/hooks/use-stream-processor.ts` - React hook for streaming
8. `src/app/blog/layout.tsx` - Server component layout

## Documentation Files

### Root Level
- `README.md` - Main project documentation
- `FILE_STRUCTURE.md` - This file

### docs/ Directory
- `docs/README.md` - Documentation index
- `docs/guides/` - User guides (1 file)
- `docs/development/` - Development docs (4 files)
- `docs/deployment/` - Deployment docs (2 files)
- `docs/phases/` - Phase completion reports (2 files)

## Total Files Count

- **Components**: 20+
- **Hooks**: 3
- **Utils**: 20+
- **Workers**: 1
- **Stores**: 3
- **API Routes**: 3
- **Pages**: 80+
- **Documentation**: 7

---

**Last Updated**: January 2024
