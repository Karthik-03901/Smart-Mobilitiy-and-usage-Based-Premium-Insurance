'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import styles from './HelpPage.module.css';

const FAQS = [
  { q: 'How is my premium calculated?',           a: 'Your premium starts at a base rate and is adjusted based on driving behavior captured through telematics. We score each trip on speeding, harsh braking, acceleration, night driving, and rush-hour exposure. The composite score reduces or increases your monthly premium accordingly.' },
  { q: 'What data is collected about my driving?', a: 'With your consent, we collect GPS location (coarse precision), speed, acceleration, braking patterns, and trip timing. We never collect your contacts, messages, or personal communications. You can view exactly what is collected for each consent stream in the Consent Centre.' },
  { q: 'Can I revoke my consent at any time?',    a: 'Yes. Go to Consent Centre and toggle off any data stream. Revocation takes effect immediately. Your premium will revert to the standard rate for streams you disable, but there is no penalty or cancellation fee.' },
  { q: 'How often does my premium update?',        a: 'Your premium is recalculated at the end of each calendar month based on the previous 30 days of driving data. You will receive a notification 3 days before any change takes effect.' },
  { q: 'What is a Trip Score?',                   a: 'A Trip Score is a 0-100 rating we assign to each completed trip. 100 means perfect — no speeding, no harsh braking, no aggressive acceleration. Scores above 80 are "Excellent", 60-79 are "Good", and below 60 are "Needs Improvement".' },
  { q: 'How does the What-If Simulator work?',    a: 'The What-If Simulator lets you adjust your hypothetical driving behaviors (e.g., reduce speeding from 6% to 2%) and see the premium impact before it happens in real life. It uses the same pricing model as production, so the estimates are accurate.' },
  { q: 'Is my data sold to third parties?',       a: 'No. Your data is never sold. It is only used for premium calculation within DriveFair and shared with our reinsurance partner in aggregate anonymized form for actuarial validation. You can request a complete data export at any time from your Profile page.' },
  { q: 'What happens if I have an accident?',     a: 'The claims process is the same as traditional insurance. Contact our claims team at claims@drivefair.in or call 1800-DRIVEFAIR. Your driving score is not used to deny a claim — it only affects future premium pricing.' },
];

const CATEGORIES = [
  { id: 'all',      label: 'All Questions' },
  { id: 'pricing',  label: 'Pricing & Premium' },
  { id: 'data',     label: 'Data & Privacy' },
  { id: 'claims',   label: 'Claims' },
  { id: 'account',  label: 'Account' },
];

const CONTACTS = [
  { icon: '✉', title: 'Email Support',   val: 'support@drivefair.in',   sub: 'Typically responds within 4 hours' },
  { icon: '☎', title: 'Phone Support',   val: '1800-DRIVEFAIR',          sub: 'Mon–Sat, 8 AM – 8 PM IST'         },
  { icon: '●', title: 'Live Chat',       val: 'Available in-app',        sub: 'Average wait: 2 minutes'           },
];

export const HelpPage: React.FC = () => {
  const { showToast, navigateTo } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [ticket, setTicket] = useState({ subject: '', message: '' });

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.subject || !ticket.message) {
      showToast('Please fill in subject and message.', 'error');
      return;
    }
    showToast('Support ticket submitted! You will receive a response within 4 hours.', 'success');
    setTicket({ subject: '', message: '' });
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>How can we help?</h1>
          <p className={styles.heroSubtitle}>Search our knowledge base or submit a support ticket.</p>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>&#9906;</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.heroBg} />
      </div>

      <div className={styles.content}>
        {/* Quick Links */}
        <div className={styles.quickLinks}>
          {[
            { label: 'View Dashboard',    action: () => navigateTo('dashboard') },
            { label: 'Manage Consent',    action: () => navigateTo('consent')   },
            { label: 'Premium Breakdown', action: () => navigateTo('explainer') },
            { label: 'Trip Simulator',    action: () => navigateTo('simulator') },
          ].map(l => (
            <button key={l.label} className={styles.quickLink} onClick={l.action}>{l.label} &#8594;</button>
          ))}
        </div>

        {/* FAQ */}
        <div className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>

          <div className={styles.categoryTabs}>
            {CATEGORIES.map(c => (
              <button key={c.id} className={`${styles.categoryTab} ${category === c.id ? styles.categoryActive : ''}`} onClick={() => setCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className={styles.faqList}>
            {filtered.map((faq, i) => (
              <div key={i} className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className={`${styles.faqChevron} ${openIndex === i ? styles.faqChevronOpen : ''}`}>&#8964;</span>
                </button>
                {openIndex === i && (
                  <div className={styles.faqAnswer}>{faq.a}</div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className={styles.noResults}>No questions match your search. Try different keywords or submit a ticket below.</div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className={styles.contactSection}>
          <div className={styles.contactCards}>
            <div>
              <h2 className={styles.sectionTitle}>Contact Support</h2>
              <div className={styles.contactGrid}>
                {CONTACTS.map(c => (
                  <div key={c.title} className={styles.contactCard}>
                    <div className={styles.contactIcon}>{c.icon}</div>
                    <div className={styles.contactTitle}>{c.title}</div>
                    <div className={styles.contactVal}>{c.val}</div>
                    <div className={styles.contactSub}>{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket form */}
          <div className={styles.ticketSection}>
            <h2 className={styles.sectionTitle}>Submit a Support Ticket</h2>
            <form className={styles.ticketForm} onSubmit={handleTicket}>
              <div className={styles.field}>
                <label className={styles.label}>Subject</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Briefly describe your issue"
                  value={ticket.subject}
                  onChange={e => setTicket(p => ({ ...p, subject: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Message</label>
                <textarea
                  className={styles.textarea}
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  value={ticket.message}
                  onChange={e => setTicket(p => ({ ...p, message: e.target.value }))}
                />
              </div>
              <button type="submit" className={styles.submitBtn}>Send Ticket &#8594;</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
