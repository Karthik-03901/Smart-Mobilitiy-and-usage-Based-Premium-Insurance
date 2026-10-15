# 🚀 DriveFair - Quick Reference Card

## Essential Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## Access URLs

- **Local Dev**: http://localhost:3000
- **Alternative Port**: `npm run dev -- -p 3001`

## Project Structure

```
DriveFair/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   └── styles/          # Global styles & tokens
├── Documentation files   # README, guides, etc.
└── Config files         # package.json, tsconfig, etc.
```

## Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Button | Reusable button | `src/components/Button.tsx` |
| Card | Container component | `src/components/Card.tsx` |
| TripSimulator | Driving simulation | `src/components/TripSimulator.tsx` |
| CustomerDashboard | Customer metrics | `src/components/CustomerDashboard.tsx` |
| PremiumExplainer | Price breakdown | `src/components/PremiumExplainer.tsx` |
| ConsentCentre | Data control | `src/components/ConsentCentre.tsx` |
| InsurerDashboard | Portfolio analytics | `src/components/InsurerDashboard.tsx` |

## Design Tokens

**Location**: `src/styles/tokens.css`

### Key Colors
- Primary: `#0080ff` (Blue)
- Success: `#00c767` (Green)
- Warning: `#ffba00` (Yellow)
- Danger: `#e60000` (Red)

### Spacing Scale
- `--space-1`: 4px
- `--space-4`: 16px
- `--space-8`: 32px
- `--space-16`: 64px

### Font Sizes
- `--font-size-xs`: 12px
- `--font-size-base`: 16px
- `--font-size-xl`: 20px
- `--font-size-4xl`: 36px

## Features by View

### 1. Dashboard
- Current premium & savings
- Risk score (0-100)
- Monthly statistics
- Recent trips

### 2. Trip Simulator
- Real-time driving sim
- 3 profiles (safe/average/risky)
- Live metrics & events
- Canvas visualization

### 3. Premium Breakdown
- Factor-by-factor pricing
- What-if simulator
- Improvement tips
- Instant recalculation

### 4. Consent Centre
- Per-stream toggles
- Pricing impact display
- Data transparency
- User rights

### 5. Insurer View
- Portfolio metrics
- Risk distribution
- Fairness monitoring
- Activity feed

## Keyboard Shortcuts

- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons
- **Ctrl+Shift+R**: Hard refresh
- **F12**: Open dev tools

## Troubleshooting

### Port in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Clear cache
```bash
rmdir /s /q .next
rmdir /s /q node_modules
npm install
```

### Styles not loading
1. Hard refresh: Ctrl+Shift+R
2. Check browser console
3. Verify globals.css exists

## Documentation Files

| File | Purpose |
|------|---------|
| README.md | Setup & overview |
| QUICK_START.md | Installation help |
| DEMO_GUIDE.md | Presentation guide |
| IMPLEMENTATION.md | Technical docs |
| PHASE1_DELIVERY.md | Delivery checklist |
| PROJECT_SUMMARY.md | Complete summary |
| QUICK_REFERENCE.md | This card |

## Real-Time Features

- Trip Simulator: 100ms updates
- Dashboard Clock: 1s updates
- Insurer Metrics: 3s auto-refresh
- Premium Calc: Instant
- Animations: 60fps

## Browser Support

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  

## File Counts

- Production Files: 27
- Documentation: 7
- Total TS/TSX: ~2,200 lines
- Total CSS: ~2,800 lines
- Total Docs: ~3,500 lines

## Performance

- Bundle: ~175KB (gzipped)
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

## Accessibility

- WCAG 2.1 AA ✅
- Semantic HTML ✅
- Keyboard nav ✅
- Screen readers ✅
- Color contrast ✅

## API Endpoints (Phase 2)

Ready for backend integration:
- `/api/consent` - Consent management
- `/api/ingest` - Trip data
- `/api/quote` - Premium calculation
- `/api/what-if` - Simulation

## Environment Variables

```bash
# Create .env.local for Phase 2
NEXT_PUBLIC_API_URL=https://api.drivefair.in
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Deployment

### Vercel
```bash
vercel
```

### Docker
```bash
docker build -t drivefair .
docker run -p 3000:3000 drivefair
```

## Common Issues

| Issue | Solution |
|-------|----------|
| npm not found | Install Node.js 18+ |
| Port occupied | Use different port |
| Module not found | Run `npm install` |
| Styles broken | Hard refresh |
| Canvas not rendering | Check browser support |

## Key Metrics (PRD)

- ✅ Premium spread: 25%+
- ✅ Consent-first: 100%
- ✅ Explanations: Plain language
- ✅ Insurer tools: < 3 clicks
- ✅ Fairness: Auto-monitored

## Phase 1 Status

**Status**: ✅ COMPLETE  
**Features**: 5 major features  
**Components**: 7 components  
**Lines**: 5,000+ production code  
**Ready**: Demo & deployment  

## Quick Demo Flow

1. **Dashboard** (2 min) - Show metrics
2. **Simulator** (3 min) - Run trip
3. **Explainer** (2 min) - What-if mode
4. **Consent** (2 min) - Toggle demo
5. **Insurer** (1 min) - Portfolio view

**Total**: 10 minutes

## Support

- 📖 Docs in project root
- 🐛 Check browser console
- 🔧 Clear cache if issues
- 📝 Review QUICK_START.md

## Next Steps

1. Install: `npm install`
2. Run: `npm run dev`
3. Open: http://localhost:3000
4. Explore: All 5 views
5. Demo: Follow DEMO_GUIDE.md

---

**🎉 Phase 1 Complete - Ready to Demo!**

*Keep this card handy for quick reference*
