# 🚀 Quick Start Guide - DriveFair Phase 1

## Installation Issues?

If you're experiencing network or installation issues with npm, here are alternative approaches:

### Method 1: Retry npm install (Recommended)

```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### Method 2: Use Yarn instead

```bash
# Install yarn if you don't have it
npm install -g yarn

# Install dependencies with yarn
yarn install

# Run the app
yarn dev
```

### Method 3: Offline/Manual Install

If network issues persist:

1. Download node_modules from a working environment
2. Copy to this project directory
3. Run `npm run dev`

---

## Starting the Application

Once dependencies are installed successfully:

```bash
# Development mode (with hot reload)
npm run dev

# The app will start at:
# http://localhost:3000
```

---

## Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found Errors

```bash
# Delete and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install
```

### TypeScript Errors

```bash
# Clear Next.js cache
rmdir /s /q .next
npm run dev
```

### CSS Not Loading

1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Check browser console for errors

---

## Verify Installation

After installing, check that these key files exist:

- `node_modules/` directory (with 300+ packages)
- `node_modules/next/` (Next.js framework)
- `node_modules/react/` (React library)
- `package-lock.json` (dependency lock file)

---

## First Time Running

1. **Open Terminal** in project directory (`e:\DriveFair`)
2. **Run**: `npm run dev`
3. **Wait** for "Ready in X ms" message
4. **Open Browser**: Navigate to `http://localhost:3000`
5. **Explore**: Use the navigation to see all 5 views

---

## What You Should See

✅ Navigation bar at top with DriveFair logo  
✅ Five tabs: Dashboard, Trip Simulator, Premium Breakdown, Consent Centre, Insurer View  
✅ Customer dashboard with metrics by default  
✅ No errors in browser console (F12)  
✅ Smooth animations and transitions  

---

## Common First-Time Issues

### Issue: "Command not found: npm"
**Solution**: Install Node.js from https://nodejs.org (18.x or higher)

### Issue: "Cannot find module 'next'"
**Solution**: Dependencies not installed. Run `npm install` again.

### Issue: "Port 3000 is already in use"
**Solution**: 
- Stop other Next.js apps
- Or use: `npm run dev -- -p 3001`

### Issue: Blank page or "Page not found"
**Solution**:
- Check that `src/app/page.tsx` exists
- Clear .next folder: `rmdir /s /q .next`
- Restart dev server

### Issue: Styles not applying
**Solution**:
- Hard refresh: Ctrl+Shift+R
- Check `src/styles/globals.css` exists
- Check `src/styles/tokens.css` exists

---

## Alternative: Static HTML Demo

If you want a simple demo without npm:

```html
<!-- Save as demo.html and open in browser -->
<!DOCTYPE html>
<html>
<head>
    <title>DriveFair Demo</title>
    <style>
        body { font-family: system-ui; padding: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .metric { font-size: 2em; font-weight: bold; color: #0080ff; }
    </style>
</head>
<body>
    <h1>🚗 DriveFair</h1>
    <div class="card">
        <h2>Customer Dashboard</h2>
        <div class="metric">₹1,840/month</div>
        <p>Your personalized premium (12.4% savings)</p>
    </div>
    <p><em>This is a static demo. Install the full app for interactive features.</em></p>
</body>
</html>
```

---

## Browser Compatibility

**Recommended**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Used**:
- CSS Grid and Flexbox
- CSS Custom Properties (variables)
- ES6+ JavaScript
- Canvas API
- CSS Animations

---

## Performance Tips

For best performance:
- Use Chrome/Edge (best Next.js support)
- Close unused browser tabs
- Disable unnecessary extensions
- Use development mode for testing
- Build production for demos

---

## Next Steps

1. ✅ **Get it running**: Follow steps above
2. 📖 **Read the demo guide**: See `DEMO_GUIDE.md`
3. 🎨 **Explore features**: Try all 5 views
4. 📝 **Check documentation**: Review `README.md` and `IMPLEMENTATION.md`
5. 🚀 **Deploy**: Ready for Vercel or static hosting

---

## Need Help?

**Check these files**:
- `README.md` - General documentation
- `DEMO_GUIDE.md` - How to demonstrate features
- `IMPLEMENTATION.md` - Technical architecture
- `PHASE1_DELIVERY.md` - Complete delivery checklist

**Common Commands**:
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm start           # Run production server
npm run lint        # Check for code issues
```

---

## Success Indicators

You'll know it's working when:
- ✅ Server starts without errors
- ✅ Browser loads the dashboard
- ✅ Clock updates every second
- ✅ Trip simulator animates smoothly
- ✅ Navigation switches views
- ✅ Toggles and sliders respond
- ✅ Charts render correctly

---

**Ready to explore DriveFair! 🎉**
