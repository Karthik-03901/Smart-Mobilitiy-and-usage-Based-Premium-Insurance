'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import styles from './AboutPage.module.css';

const TEAM = [
  {
    name: 'Loahith R.',
    role: 'Founder & CEO',
    bio: 'Ex-IRDAI actuary with 12 years in motor insurance pricing and behavioral economics.',
    initials: 'LR',
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    glow: 'rgba(79, 70, 229, 0.35)',
    lightBg: 'rgba(79, 70, 229, 0.05)',
  },
  {
    name: 'Kavitha S.',
    role: 'CTO',
    bio: 'Former ML lead at Ola. Built the telematics scoring engine from scratch.',
    initials: 'KS',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #0284c7, #06b6d4)',
    glow: 'rgba(2, 132, 199, 0.35)',
    lightBg: 'rgba(2, 132, 199, 0.05)',
  },
  {
    name: 'Arjun M.',
    role: 'Head of Product',
    bio: 'Designed the consent-first UX used by 3 fintech startups before DriveFair.',
    initials: 'AM',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    glow: 'rgba(5, 150, 105, 0.35)',
    lightBg: 'rgba(5, 150, 105, 0.05)',
  },
  {
    name: 'Divya P.',
    role: 'Chief Privacy Officer',
    bio: 'GDPR and DPDPA compliance expert. Ensures every data decision is ethical and legal.',
    initials: 'DP',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    glow: 'rgba(217, 119, 6, 0.35)',
    lightBg: 'rgba(217, 119, 6, 0.05)',
  },
  {
    name: 'Ravi K.',
    role: 'Head of Data Science',
    bio: 'PhD in Transportation Engineering (IIT-M). Leads the risk model and fairness audits.',
    initials: 'RK',
    color: '#e11d48',
    gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
    glow: 'rgba(225, 29, 72, 0.35)',
    lightBg: 'rgba(225, 29, 72, 0.05)',
  },
  {
    name: 'Sneha V.',
    role: 'VP Customer Success',
    bio: 'Passionate about turning data skeptics into data advocates through transparency.',
    initials: 'SV',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #c084fc)',
    glow: 'rgba(147, 51, 234, 0.35)',
    lightBg: 'rgba(147, 51, 234, 0.05)',
  },
];

const VALUES = [
  {
    icon: '🔍',
    title: 'Transparency',
    desc: 'Every rupee of your premium is explained. No hidden algorithms, no black boxes.',
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    glow: 'rgba(79, 70, 229, 0.30)',
    lightBg: 'rgba(79, 70, 229, 0.05)',
  },
  {
    icon: '⚖️',
    title: 'Fairness',
    desc: 'Regular bias audits across age, region, and vehicle class. Disparity thresholds enforced by code.',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #0284c7, #06b6d4)',
    glow: 'rgba(2, 132, 199, 0.30)',
    lightBg: 'rgba(2, 132, 199, 0.05)',
  },
  {
    icon: '🛡️',
    title: 'Privacy',
    desc: 'Granular consent. Minimum data collected. You own your data and can export or delete anytime.',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    glow: 'rgba(5, 150, 105, 0.30)',
    lightBg: 'rgba(5, 150, 105, 0.05)',
  },
  {
    icon: '💡',
    title: 'Innovation',
    desc: 'The first Indian insurer to offer real-time premium simulation before committing to a plan.',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    glow: 'rgba(217, 119, 6, 0.30)',
    lightBg: 'rgba(217, 119, 6, 0.05)',
  },
];

const MILESTONES = [
  { year: '2023 Q1', event: 'DriveFair incorporated; seed round of Rs.2.8 Cr from Bharat Founders Fund' },
  { year: '2023 Q3', event: 'IRDAI Sandbox approval for UBI pilot — 200 beta drivers across Bengaluru' },
  { year: '2024 Q1', event: 'Series A: Rs.18 Cr. Expanded to Chennai, Hyderabad, and Mumbai' },
  { year: '2024 Q3', event: 'Launched Consent Centre — first insurer to offer granular per-stream data controls' },
  { year: '2025 Q1', event: 'Crossed 1,000 active policies. Average customer saving: 22%' },
  { year: '2026 Q1', event: '2,847 drivers live. Phase 1 MVP open for beta. IRDAI full license pending' },
];

export const AboutPage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>Our Story</div>
          <h1 className={styles.heroTitle}>Insurance built on trust, not assumptions</h1>
          <p className={styles.heroSubtitle}>
            DriveFair was founded on a simple belief: your insurance premium should reflect
            how you actually drive, not how old you are or where you live.
            We combine behavioral telematics, transparent algorithms, and radical consent
            controls to make motor insurance fair for everyone.
          </p>
        </div>
        <div className={styles.heroBg} />
      </div>

      {/* Mission */}
      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.missionGrid}>
            <div className={styles.missionText}>
              <div className={styles.tag}>Mission</div>
              <h2 className={styles.title}>Drive Smart. Pay Fair.</h2>
              <p className={styles.body}>
                Traditional motor insurance prices risk using broad demographic proxies — age, gender, PIN code.
                These proxies penalize good drivers who happen to be young or live in an urban area.
              </p>
              <p className={styles.body}>
                DriveFair replaces proxies with behavior. We measure actual driving quality through
                telematics, score each trip transparently, and price risk on what we observe rather
                than what we assume. The result: safe drivers save, and every customer understands exactly why.
              </p>
              <button className={styles.actionBtn} onClick={() => navigateTo('dashboard')}>
                Open Dashboard &#8594;
              </button>
            </div>
            <div className={styles.missionStats}>
              {[
                { num: '2,847', label: 'Active drivers' },
                { num: '24%',   label: 'Average savings' },
                { num: '98.6%', label: 'Claim accuracy' },
                { num: '100%',  label: 'Consent-based' },
              ].map(s => (
                <div key={s.label} className={styles.missionStat}>
                  <div className={styles.missionStatNum}>{s.num}</div>
                  <div className={styles.missionStatLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Values — full-width gray */}
      <section className={styles.sectionGray}>
        <div className={styles.sectionGrayInner}>
          <div className={styles.tag}>Values</div>
          <h2 className={styles.title}>What we stand for</h2>
          <div className={styles.valuesGrid}>
            {VALUES.map(v => (
              <div
                key={v.title}
                className={styles.valueCard}
                style={{
                  '--card-color': v.color,
                  '--card-gradient': v.gradient,
                  '--card-glow': v.glow,
                  '--card-light-bg': v.lightBg,
                } as React.CSSProperties}
              >
                <div className={styles.valueIcon}>{v.icon}</div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.tag}>Team</div>
          <h2 className={styles.title}>The people behind DriveFair</h2>
          <div className={styles.teamGrid}>
            {TEAM.map(m => (
              <div
                key={m.name}
                className={styles.teamCard}
                style={{
                  '--card-color': m.color,
                  '--card-gradient': m.gradient,
                  '--card-glow': m.glow,
                  '--card-light-bg': m.lightBg,
                } as React.CSSProperties}
              >
                <div className={styles.teamAvatar}>{m.initials}</div>
                <div className={styles.teamName}>{m.name}</div>
                <div className={styles.teamRole}>{m.role}</div>
                <p className={styles.teamBio}>{m.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Milestones — full-width dark, properly centered */}
      <section className={styles.sectionDark}>
        <div className={styles.sectionDarkInner}>
          <div className={styles.tagLight}>Journey</div>
          <h2 className={styles.titleLight}>How we got here</h2>
          <div className={styles.timeline}>
            {MILESTONES.map((m, i) => (
              <div key={m.year} className={styles.timelineItem}>
                <div className={styles.timelineYear}>{m.year}</div>
                <div className={styles.timelineDot} />
                {i < MILESTONES.length - 1 && <div className={styles.timelineLine} />}
                <div className={styles.timelineEvent}>{m.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
