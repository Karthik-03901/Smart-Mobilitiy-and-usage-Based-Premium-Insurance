'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import styles from './HomePage.module.css';

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, decimals = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  const start = useCallback(() => {
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, decimals]);

  useEffect(() => {
    const stop = start();
    return stop;
  }, [start]);

  return value;
}

// ─── Individual animated stat ─────────────────────────────────────────────────
interface StatConfig {
  raw: number;      // numeric target
  decimals: number; // decimal places
  prefix: string;   // e.g. ''
  suffix: string;   // e.g. '%', ','
  label: string;
  separator?: boolean; // add comma-thousands separator
}

const STAT_CONFIGS: StatConfig[] = [
  { raw: 2847,  decimals: 0, prefix: '',  suffix: '',  label: 'Active drivers',    separator: true  },
  { raw: 24,    decimals: 0, prefix: '',  suffix: '%', label: 'Average savings',   separator: false },
  { raw: 4.9,   decimals: 1, prefix: '',  suffix: '',  label: 'App rating',        separator: false },
  { raw: 98.6,  decimals: 1, prefix: '',  suffix: '%', label: 'Claim accuracy',    separator: false },
];

function CountUpStat({ cfg }: { cfg: StatConfig }) {
  const val = useCountUp(cfg.raw, 1800, cfg.decimals);
  const display = cfg.separator
    ? `${cfg.prefix}${Math.round(val).toLocaleString('en-IN')}${cfg.suffix}`
    : `${cfg.prefix}${val.toFixed(cfg.decimals)}${cfg.suffix}`;
  return (
    <div className={styles.heroStat}>
      <div className={styles.heroStatNum}>{display}</div>
      <div className={styles.heroStatLabel}>{cfg.label}</div>
    </div>
  );
}


const FEATURES = [
  { icon: 'TELE', title: 'Telematics Pricing', desc: 'Your premium is calculated from real driving data — speed, braking, night driving — not just demographics.', color: '#6366f1' },
  { icon: 'SAFE', title: 'Safety Rewards',     desc: 'Every smooth trip earns you a lower rate. Safe drivers save up to 30% compared to the standard rate.',        color: '#10b981' },
  { icon: 'PRIV', title: 'Privacy First',       desc: 'Granular consent controls. Share only what you choose. Revoke access anytime with no penalty.',                color: '#0ea5e9' },
  { icon: 'LIVE', title: 'Live Insights',       desc: 'Monitor your score, premium trajectory, and trip history in real time through an intuitive dashboard.',         color: '#f59e0b' },
  { icon: 'FAIR', title: 'Fairness Monitor',    desc: 'Algorithmic bias checks ensure no demographic group is unfairly penalized. Transparent pricing for all.',       color: '#8b5cf6' },
  { icon: 'WHAT', title: 'What-If Simulator',   desc: 'Play with your driving habits virtually and see exactly how much you could save before committing.',            color: '#ec4899' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Grant Consent',       desc: 'Choose which data streams to share — telematics, wellness, or IoT. Full control, always.' },
  { step: '02', title: 'Drive Normally',      desc: 'Our system silently records trip quality in the background. No special hardware needed.' },
  { step: '03', title: 'Get Your Score',      desc: 'Every trip is scored on safety, smoothness, and timing. See it in real time on your dashboard.' },
  { step: '04', title: 'Pay What You Earn',   desc: 'Your premium updates monthly based on your actual behavior. Better driving = real savings.' },
];


const PLANS = [
  { name: 'Basic',    price: '1,200', desc: 'Standard coverage with telematics discount', features: ['Telematics pricing', 'Monthly score report', 'Basic consent controls', 'Email support'], color: '#6366f1', popular: false },
  { name: 'Smart',    price: '1,840', desc: 'Full UBI features with real-time dashboard',  features: ['Everything in Basic', 'Real-time dashboard', 'What-If simulator', 'Trip history (12 mo)', 'Priority support'], color: '#0ea5e9', popular: true  },
  { name: 'Premium',  price: '2,400', desc: 'Complete protection for high-value vehicles',  features: ['Everything in Smart', 'Zero depreciation', 'Wellness bonus program', 'Dedicated agent', 'API access'], color: '#8b5cf6', popular: false },
];

const STATS = [
  { num: '2,847', label: 'Active drivers',    sub: 'and growing daily'  },
  { num: '24%',   label: 'Average savings',   sub: 'vs standard rate'   },
  { num: '4.9',   label: 'App rating',        sub: 'across 1,200 reviews'},
  { num: '98.6%', label: 'Claim accuracy',    sub: 'powered by real data'},
];
// ─── Animated Feature Card ───────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
  color: string;
  index: number;
}

function FeatureCard({ icon, title, desc, color, index }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });

  // Stagger reveal via IntersectionObserver
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), index * 90); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  // 3-D tilt + shine on mouse-move
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;   // -1 to 1
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;  // -1 to 1
    el.style.transform = `perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px) scale(1.02)`;
    const sx = ((e.clientX - rect.left) / rect.width) * 100;
    const sy = ((e.clientY - rect.top)  / rect.height) * 100;
    setShine({ x: sx, y: sy, opacity: 0.5 });
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    setShine(p => ({ ...p, opacity: 0 }));
  };

  return (
    <div
      ref={ref}
      className={`${styles.featureCard} ${visible ? styles.featureCardVisible : ''}`}
      style={{
        '--card-color': color,
        transitionDelay: `${index * 90}ms`,
      } as React.CSSProperties}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Shine overlay with card accent color — z-index 1, pointer-events none */}
      <div
        className={styles.featureShine}
        style={{
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, ${color}28 0%, transparent 65%)`,
          transition: shine.opacity === 0 ? 'opacity 0.4s' : 'none',
          opacity: shine.opacity > 0 ? 1 : 0,
        }}
      />
      {/* Glowing border on hover — z-index 1 */}
      <div className={styles.featureBorder} style={{ '--card-color': color } as React.CSSProperties} />

      {/* Content — z-index 3, always above overlays */}
      <div className={styles.featureContent}>
        <div className={styles.featureIcon} style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDesc}>{desc}</p>
      </div>
    </div>
  );
}

// ─── Reveal wrapper (generic stagger fade-up) ───────────────────────────────
function RevealCard({ children, index, className = '' }: { children: React.ReactNode; index: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), index * 110); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);
  return (
    <div ref={ref} className={`${styles.revealCard} ${visible ? styles.revealCardVisible : ''} ${className}`}
      style={{ transitionDelay: `${index * 110}ms` }}>
      {children}
    </div>
  );
}

// ─── Animated Plan Card ──────────────────────────────────────────────────────
function PlanCard({ plan, index, onSelect }: { plan: typeof PLANS[0]; index: number; onSelect: () => void }) {
  const priceNum = parseInt(plan.price.replace(',', ''), 10);
  const animatedPrice = useCountUp(priceNum, 1400, 0);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), index * 130); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`${styles.planCard} ${plan.popular ? styles.planPopular : ''} ${styles.revealCard} ${visible ? styles.revealCardVisible : ''}`}
      style={{ transitionDelay: `${index * 130}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {plan.popular && <div className={styles.planBadge}>Most Popular</div>}
      {/* shimmer on hover */}
      <div className={styles.planShimmer}
        style={{ opacity: hovered ? 1 : 0, background: `linear-gradient(135deg, ${plan.color}10 0%, transparent 60%)` }} />

      <div className={styles.planHeader}>
        <div className={styles.planName} style={{ color: plan.color }}>{plan.name}</div>
        <div className={styles.planPrice}>
          <span className={styles.planCurrency}>&#8377;</span>
          <span className={styles.planNum}>
            {visible ? animatedPrice.toLocaleString('en-IN') : '0'}
          </span>
          <span className={styles.planPer}>/mo</span>
        </div>
        <p className={styles.planDesc}>{plan.desc}</p>
      </div>

      <ul className={styles.planFeatures}>
        {plan.features.map((f, fi) => (
          <li key={f} className={styles.planFeature}
            style={{ animationDelay: `${visible ? fi * 80 + 300 : 0}ms`, opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-12px)', transition: `opacity 0.35s ${fi * 80 + 300}ms, transform 0.35s ${fi * 80 + 300}ms` }}>
            <span className={styles.planCheck} style={{ color: plan.color }}>&#10003;</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        className={`${styles.planBtn} ${plan.popular ? styles.planBtnPopular : ''}`}
        style={plan.popular
          ? { background: `linear-gradient(135deg, ${plan.color}, #0ea5e9)`, transform: hovered ? 'scale(1.03)' : 'scale(1)' }
          : { borderColor: plan.color, color: plan.color }}
        onClick={onSelect}
      >
        Get Started
      </button>
    </div>
  );
}

const STEP_ICONS = ['■', '▲', '●', '◆'];
const STEP_COLORS = ['#818cf8', '#34d399', '#38bdf8', '#f9a8d4'];

function AnimatedStep({ step, index, total }: { step: typeof HOW_IT_WORKS[0]; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [iconPulsed, setIconPulsed] = useState(false);
  const color = STEP_COLORS[index];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          // Stagger slide-in: each step 150ms later
          setTimeout(() => {
            setVisible(true);
            // Trigger icon pulse 300ms after slide-in
            setTimeout(() => setIconPulsed(true), 350);
          }, index * 150);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={styles.stepCard}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-40px)',
        transition: `opacity 0.5s ease ${index * 150}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 150}ms`,
      }}
    >
      {/* Flip-in step number */}
      <div
        className={styles.stepNum}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'rotateY(0deg)' : 'rotateY(-90deg)',
          transition: `opacity 0.45s ease ${index * 150 + 100}ms, transform 0.45s ease ${index * 150 + 100}ms`,
          perspective: '400px',
          display: 'inline-block',
          color,
          textShadow: visible ? `0 0 40px ${color}55` : 'none',
        }}
      >
        {step.step}
      </div>

      {/* Animated connector line (draws left→right) */}
      {index < total - 1 && (
        <div className={styles.stepConnector} ref={lineRef}>
          <div
            className={styles.stepConnectorFill}
            style={{
              width: visible ? '100%' : '0%',
              transition: `width 0.65s cubic-bezier(0.22,1,0.36,1) ${index * 150 + 200}ms`,
              background: `linear-gradient(90deg, ${color}, ${STEP_COLORS[index + 1]})`,
            }}
          />
        </div>
      )}

      {/* Icon with pulse ripple */}
      <div className={styles.stepIconWrap}>
        <div
          className={styles.stepIcon}
          style={{
            background: `${color}22`,
            border: `1.5px solid ${color}55`,
            color,
            transform: iconPulsed ? 'scale(1)' : 'scale(0.6)',
            opacity: iconPulsed ? 1 : 0,
            transition: `transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${index * 150 + 250}ms, opacity 0.35s ease ${index * 150 + 250}ms`,
            boxShadow: iconPulsed ? `0 0 20px ${color}44` : 'none',
          }}
        >
          <span>{STEP_ICONS[index]}</span>
        </div>
        {/* Ripple rings */}
        {iconPulsed && (
          <>
            <div className={styles.stepRipple} style={{ '--ripple-color': color, animationDelay: '0ms'   } as React.CSSProperties} />
            <div className={styles.stepRipple} style={{ '--ripple-color': color, animationDelay: '500ms' } as React.CSSProperties} />
          </>
        )}
      </div>

      <h3
        className={styles.stepTitle}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 0.4s ease ${index * 150 + 320}ms, transform 0.4s ease ${index * 150 + 320}ms`,
        }}
      >
        {step.title}
      </h3>
      <p
        className={styles.stepDesc}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition: `opacity 0.4s ease ${index * 150 + 400}ms, transform 0.4s ease ${index * 150 + 400}ms`,
        }}
      >
        {step.desc}
      </p>
    </div>
  );
}

const ALL_TESTIMONIALS = [
  { name: 'Rajesh Verma',   role: 'Software Engineer, Bengaluru', saving: '28%', quote: 'I saved ₹7,800 in the first year just by being conscious of harsh braking. The dashboard makes it so easy to track.', score: 89 },
  { name: 'Priya Sharma',   role: 'Doctor, Chennai',              saving: '22%', quote: 'The privacy controls are incredible. I can see exactly what data is shared and revoke it with one tap. Finally, insurance I trust.', score: 84 },
  { name: 'Amit Desai',     role: 'Business Owner, Mumbai',       saving: '31%', quote: 'The What-If simulator helped me realize night trips were costing me ₹400/month. I shifted my schedule and saved immediately.', score: 91 },
  { name: 'Vikram Malhotra', role: 'Financial Analyst, Delhi NCR', saving: '33%', quote: 'The telematics insights transformed my driving habits. Seeing my score update after every commute makes driving safe and fun.', score: 94 },
  { name: 'Ananya Iyer',     role: 'Architect, Hyderabad',         saving: '25%', quote: 'Full transparency over my personal data with instant consent revocation. My policy renewal premium dropped by ₹6,200 seamlessly.', score: 88 },
  { name: 'Rohan Kulkarni',  role: 'IT Consultant, Pune',          saving: '29%', quote: 'DriveFair turned vehicle insurance into a reward system. Smooth braking and cornering directly cut down my monthly expense.', score: 92 },
];

function RollingTestimonials() {
  const [page, setPage] = useState(0);
  const [rollStage, setRollStage] = useState<'idle' | 'in' | 'out'>('idle');
  const [isRolling, setIsRolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const PAGE_SIZE = 3;
  const totalPages = Math.ceil(ALL_TESTIMONIALS.length / PAGE_SIZE);

  const triggerNextRoll = useCallback(() => {
    if (isRolling) return;
    setRollStage('out');
    setIsRolling(true);

    setTimeout(() => {
      setPage((prev) => (prev + 1) % totalPages);
      setRollStage('in');

      setTimeout(() => {
        setRollStage('idle');
        setIsRolling(false);
      }, 360);
    }, 220);
  }, [isRolling, totalPages]);

  useEffect(() => {
    if (isPaused || isRolling) return;
    const timer = setInterval(() => {
      triggerNextRoll();
    }, 2000);
    return () => clearInterval(timer);
  }, [isPaused, isRolling, triggerNextRoll]);

  const currentItems = ALL_TESTIMONIALS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getRollClass = (_index: number) => {
    if (rollStage === 'out') {
      return styles.cardRollOutLeft;
    }
    if (rollStage === 'in') {
      return styles.cardRollInRight;
    }
    return '';
  };

  return (
    <div
      className={styles.testimonialsWrapper}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.testimonialsHeader}>
        <div className={styles.sectionTag}>Testimonials</div>
        <h2 className={styles.sectionTitle}>Real drivers, real savings</h2>
      </div>

      <div className={styles.testimonialsGrid}>
        {currentItems.map((t, i) => (
          <div
            key={t.name}
            className={`${styles.testimonialCard} ${getRollClass(i)}`}
            style={{ '--card-idx': i } as React.CSSProperties}
          >
            <div className={styles.testimonialHeader}>
              <div className={styles.testimonialAvatar}>{t.name.charAt(0)}</div>
              <div>
                <div className={styles.testimonialName}>{t.name}</div>
                <div className={styles.testimonialRole}>{t.role}</div>
              </div>
              <div className={styles.testimonialSaving}>-{t.saving}</div>
            </div>
            <blockquote className={styles.testimonialQuote}>&quot;{t.quote}&quot;</blockquote>
            <div className={styles.testimonialScore}>
              <span className={styles.testimonialScoreLabel}>Avg Trip Score</span>
              <span className={styles.testimonialScoreNum}>{t.score}/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const HomePage: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const heroRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  // Ensure background video is always playing
  useEffect(() => {
    const video = bgVideoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {
        // Autoplay policy fallback
      });
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && video) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };

    el.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div className={styles.page}>

      {/* ─── Hero ─── */}
      <section className={styles.hero} ref={heroRef}>
        {/* Full-Bleed Animated Video Background — Always Playing */}
        <div className={styles.heroBgVideoContainer}>
          <video
            ref={bgVideoRef}
            className={styles.heroBgVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onPause={(e) => e.currentTarget.play()}
            onEnded={(e) => e.currentTarget.play()}
          >
            <source src="/hero-background.mp4" type="video/mp4" />
            <source src={`/Industrial_animation_for_insuran\u2026_20261015220702.mp4`} type="video/mp4" />
          </video>
          {/* Vignette & Contrast Overlay */}
          <div className={styles.heroVideoOverlay} />
          {/* Cyber Perspective Grid Overlay */}
          <div className={styles.heroCyberGrid} />
          {/* Subtle Scanline Layer */}
          <div className={styles.heroScanline} />
          {/* Glowing Ambient Aurora Orbs */}
          <div className={styles.heroBg1} />
          <div className={styles.heroBg2} />
          <div className={styles.heroBg3} />
        </div>

        {/* ─── Centered Hero Content (Screenshot 2 Layout) ─── */}
        <div className={styles.heroInner}>
          {/* Badge */}
          <div className={styles.heroBadge} style={{ animation: 'badgeSlideDown 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>
            India&apos;s First Consent-Based UBI Platform
          </div>

          {/* Title */}
          <h1 className={styles.heroTitle}>
            {'Drive Smart.'.split(' ').map((word, i) => (
              <span key={word + i} className={styles.wordRevealWrap}>
                <span
                  className={styles.wordReveal}
                  style={{ animationDelay: `${0.2 + i * 0.12}s` }}
                >
                  {word}
                  {i < 'Drive Smart.'.split(' ').length - 1 ? '\u00A0' : ''}
                </span>
              </span>
            ))}
            <br />
            {'Pay Fair.'.split(' ').map((word, i) => (
              <span key={word + i} className={styles.wordRevealWrap}>
                <span
                  className={`${styles.wordReveal} ${styles.wordGradient}`}
                  style={{ animationDelay: `${0.55 + i * 0.14}s` }}
                >
                  {word}
                  {i < 'Pay Fair.'.split(' ').length - 1 ? '\u00A0' : ''}
                </span>
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className={styles.heroSubtitle} style={{ animation: 'subtitleReveal 0.8s ease 0.85s both' }}>
            DriveFair rewards safe driving with lower premiums. Share your data on your terms,
            see your score in real time, and pay exactly what your behavior deserves.
          </p>

          {/* CTA Buttons */}
          <div className={styles.heroCtas}>
            <button className={styles.ctaPrimary} onClick={() => navigateTo('safedrive')}>
              SafeDrive Live HUD
              <span className={styles.ctaArrow}>&#8594;</span>
            </button>
            <button className={styles.ctaSecondary} onClick={() => navigateTo('dashboard')}>
              Go to Dashboard
            </button>
            <button className={styles.ctaSecondary} onClick={() => navigateTo('simulator')}>
              Trip Simulator
            </button>
          </div>

          {/* 4 Stats Columns */}
          <div className={styles.heroStats}>
            {STAT_CONFIGS.map(cfg => (
              <CountUpStat key={cfg.label} cfg={cfg} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>Why DriveFair</div>
          <h2 className={styles.sectionTitle}>Insurance that actually makes sense</h2>
          <p className={styles.sectionSubtitle}>Six pillars that make DriveFair the most transparent motor insurance platform in India.</p>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} color={f.color} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTagLight}>How It Works</div>
          <h2 className={styles.sectionTitleLight}>Four steps to smarter insurance</h2>
          <div className={styles.stepsGrid}>
            {HOW_IT_WORKS.map((step, i) => (
              <AnimatedStep key={step.step} step={step} index={i} total={HOW_IT_WORKS.length} />
            ))}
          </div>
          <div className={styles.stepsAction}>
            <button className={styles.ctaPrimary} onClick={() => navigateTo('simulator')}>
              Try the Simulator
              <span className={styles.ctaArrow}>&#8594;</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Plans ─── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>Plans</div>
          <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p className={styles.sectionSubtitle}>All plans include UBI discounts. Safe drivers automatically pay less.</p>
          <div className={styles.plansGrid}>
            {PLANS.map((plan, i) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                index={i}
                onSelect={() => { showToast(`${plan.name} plan selected.`, 'success'); navigateTo('dashboard'); }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials (with Roll In and Roll Out animations) ─── */}
      <section className={`${styles.section} ${styles.sectionGray}`}>
        <div className={styles.sectionInner}>
          <RollingTestimonials />
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <h2 className={styles.ctaBannerTitle}>Ready to drive smarter?</h2>
          <p className={styles.ctaBannerSubtitle}>Join 2,847 drivers already saving with DriveFair. Setup takes under 2 minutes.</p>
          <div className={styles.heroCtas}>
            <button className={styles.ctaPrimary} onClick={() => navigateTo('dashboard')}>
              Open Dashboard
              <span className={styles.ctaArrow}>&#8594;</span>
            </button>
            <button className={`${styles.ctaSecondary} ${styles.ctaSecondaryLight}`} onClick={() => navigateTo('consent')}>
              Manage Consent
            </button>
          </div>
        </div>
        <div className={styles.ctaBannerBg} />
      </section>
    </div>
  );
};
