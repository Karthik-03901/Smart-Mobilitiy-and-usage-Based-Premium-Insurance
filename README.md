# 🚗 DriveFair - Consent-Based Behavioral Insurance Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Phase](https://img.shields.io/badge/Phase-1%20MVP-success)](https://github.com/Loahith/PS-025-Usage-Based-Insurance)

> A cutting-edge insurance platform that calculates premiums based on real-world driving behavior with explicit user consent. Built with transparency, fairness, and privacy at its core.

**🔗 Repository**: https://github.com/Loahith/PS-025-Usage-Based-Insurance

---

## 📸 Screenshots

### Customer Dashboard
![Dashboard Preview](https://via.placeholder.com/800x450/0080ff/ffffff?text=Customer+Dashboard+with+Real-Time+Metrics)

### Trip Simulator
![Simulator Preview](https://via.placeholder.com/800x450/00c767/ffffff?text=Real-Time+Trip+Simulator)

### Premium Explainer
![Explainer Preview](https://via.placeholder.com/800x450/ffba00/ffffff?text=Interactive+Premium+Breakdown)

---

## 🚀 Features (Phase 1)

### Customer Features
- **Real-Time Trip Simulator** - Interactive driving simulator with safe, average, and risky profiles
- **Customer Dashboard** - Live metrics including premium, risk score, distance traveled, and savings
- **Premium Explainer** - Transparent breakdown showing exactly how your premium is calculated
- **What-If Simulator** - Interactive tool to see how behavior changes affect pricing
- **Consent Centre** - Granular control over data streams with clear pricing impact
- **Trip History** - View all trips with per-trip scoring and impact on premium

### Insurer Features
- **Portfolio Dashboard** - Real-time analytics of customer base
- **Risk Distribution** - Visual breakdown of portfolio by risk score
- **Fairness Monitor** - Automated disparity analysis across demographic groups
- **Activity Feed** - Live stream of customer actions and system events
- **Loss Ratio Tracking** - Projected vs actual loss ratios

### Core Capabilities
- ✅ Real-time data simulation
- ✅ Transparent pricing calculations
- ✅ Granular consent management
- ✅ Behavioral risk scoring
- ✅ Fairness guardrails
- ✅ Audit trail ready
- ✅ Mobile-responsive design
- ✅ Accessibility compliant (WCAG 2.1 AA)

---

## 🎨 Design System

Built following modern UI/UX principles with:
- **Semantic HTML** - Accessible and SEO-friendly markup
- **CSS Modules** - Component-scoped styling
- **Design Tokens** - Consistent spacing, colors, and typography
- **Responsive Grid** - Mobile-first approach
- **Real-time Animations** - Smooth transitions and interactive feedback

### Color Palette
- **Primary**: Trust & Security (#0080ff)
- **Success**: Savings & Good Behavior (#00c767)
- **Warning**: Risk & Attention (#ffba00)
- **Danger**: High Risk (#e60000)

---

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 🏗️ Project Structure

```
DriveFair/
├── src/
│   ├── app/                      # Next.js app router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main application page
│   │   └── page.module.css      # Page styles
│   ├── components/               # React components
│   │   ├── Button.tsx           # Reusable button component
│   │   ├── Card.tsx             # Card container component
│   │   ├── TripSimulator.tsx    # Real-time trip simulator
│   │   ├── CustomerDashboard.tsx # Customer view dashboard
│   │   ├── InsurerDashboard.tsx  # Insurer analytics dashboard
│   │   ├── ConsentCentre.tsx    # Consent management interface
│   │   ├── PremiumExplainer.tsx # Premium breakdown & what-if
│   │   └── *.module.css         # Component styles
│   └── styles/                   # Global styles
│       ├── globals.css          # Global CSS
│       └── tokens.css           # Design tokens
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.js               # Next.js config
├── prd.md                       # Product Requirements Document
└── README.md                    # This file
```

---

## 🎯 Key Components

### TripSimulator
Real-time driving simulator with:
- Canvas-based map visualization
- Configurable driving profiles (safe, average, risky)
- Live metrics tracking (speed, distance, harsh events)
- Event feed with real-time notifications
- Behavioral scoring algorithm

### CustomerDashboard
Comprehensive customer view featuring:
- Current premium with comparison to standard rate
- Risk score with visual indicator
- Monthly distance and trip count
- Total savings breakdown
- Recent trip history with per-trip impact
- Quick action cards

### PremiumExplainer
Transparent pricing breakdown:
- Clear formula display
- Factor-by-factor breakdown
- Interactive what-if sliders
- Concrete improvement tips
- Plain language explanations

### ConsentCentre
Granular data control:
- Toggle individual data streams
- See exact pricing impact for each stream
- View data retention policies
- Export and delete options
- Consent history tracking

### InsurerDashboard
Portfolio analytics:
- Real-time customer metrics
- Risk score distribution chart
- Fairness monitoring across demographics
- Activity feed
- Loss ratio projections

---

## 🔧 Customization

### Modifying Design Tokens

Edit `src/styles/tokens.css` to customize:
- Color schemes
- Typography scale
- Spacing system
- Border radius
- Shadows and transitions

### Adding New Components

1. Create component file: `src/components/MyComponent.tsx`
2. Create styles: `src/components/MyComponent.module.css`
3. Import and use in pages

### Adjusting Pricing Formula

The pricing logic is in `PremiumExplainer.tsx`:
- Base premium configuration
- Behavioral factor weights
- Caps and limits
- Calculation formulas

---

## 📊 Simulated Data

Phase 1 uses simulated data for demonstration:

- **Customer Profiles**: Safe, Average, Risky driving patterns
- **Trip Data**: Distance, duration, speed, harsh events
- **Portfolio**: 2,847 simulated customers
- **Risk Scores**: 0-100 scale with distribution
- **Premium Range**: ₹1,620 - ₹2,150/month

---

## 🔒 Privacy & Consent

DriveFair is built with privacy-first principles:

1. **Explicit Consent** - All data collection requires active opt-in
2. **Granular Control** - Toggle individual data streams independently
3. **Clear Impact** - See pricing effect before consenting
4. **Easy Revocation** - Withdraw consent anytime without penalty
5. **Data Minimization** - Collect only what's needed
6. **Transparency** - Full visibility into what data is used and how

---

## ♿ Accessibility

Phase 1 meets WCAG 2.1 AA standards:

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels and roles
- Color contrast ratios
- Focus indicators
- Screen reader compatibility
- Responsive text sizing

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t drivefair .
docker run -p 3000:3000 drivefair
```

### Static Export

```bash
npm run build
# Deploy the 'out' directory to any static host
```

---

## 🗺️ Roadmap

### Phase 2 (Planned)
- Real mobile SDK integration
- Model versioning UI
- A/B tariff testing
- Push notifications
- Customer data export API

### Phase 3 (Future)
- Wearable device integration
- IoT sensor connectivity
- Claims feedback loop
- Multi-insurer tenancy
- Regulator reporting tools

---

## 📖 Documentation

- **PRD**: See `prd.md` for complete product requirements
- **Design System**: Documented in `src/styles/tokens.css`
- **Component API**: See individual component files
- **Pricing Formula**: Documented in `PremiumExplainer.tsx`

---

## 🤝 Contributing

This is a Phase 1 MVP. Future contributions welcome for:
- New data visualizations
- Additional behavioral factors
- Enhanced fairness algorithms
- Localization (Hindi, Tamil)
- Mobile app version

---

## 📄 License

Copyright © 2026 DriveFair. All rights reserved.

---

## 🎓 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules + Design Tokens
- **Charts**: HTML5 Canvas (native)
- **State**: React Hooks
- **Build**: Turbopack
- **Deployment**: Vercel-ready

---

## 💡 Key Principles

1. **Transparency First** - Every premium is explainable
2. **Fairness by Design** - Automated disparity checks
3. **Privacy Respect** - Consent before collection
4. **User Control** - Full data sovereignty
5. **Real-time Feedback** - Instant visual updates
6. **Mobile-First** - Responsive on all devices

---

## 📞 Support

- **Email**: support@drivefair.in
- **Phone**: 1800-DRIVEFAIR
- **Help Center**: [help.drivefair.in](https://help.drivefair.in)

---

**Built with ❤️ for transparency, fairness, and user empowerment**
