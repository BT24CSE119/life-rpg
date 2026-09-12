import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../layouts/PageContainer';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-lg bg-rpg-surface-2/70 hover:bg-rpg-surface-2 border border-white/5 hover:border-amber-500/30 text-xs font-semibold text-rpg-text-muted hover:text-amber-300 transition-all group active:scale-95"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back</span>
          </button>

          <header className="mb-8 pb-6 border-b border-rpg-border/60">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-rpg-text mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs font-mono text-rpg-text-muted">
              Effective Date: September 2026 · Confidential & Secure
            </p>
          </header>

          <div className="space-y-8 text-sm text-rpg-text-muted leading-relaxed">
            <section className="bg-rpg-surface/80 border border-rpg-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-rpg-text mb-3">
                1. Data Protection Guarantee
              </h2>
              <p>
                Life RPG does not sell, rent, or trade your personal data or productivity habits to advertisers or data brokers. Your quest logs and character progression belong solely to you.
              </p>
            </section>

            <section className="bg-rpg-surface/80 border border-rpg-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-rpg-text mb-3">
                2. Information Collected
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-rpg-text">Authentication Details:</strong> Email address, hashed password (Argon2/bcrypt), or Google OAuth identity tokens.</li>
                <li><strong className="text-rpg-text">Productivity Records:</strong> Quests, completion timestamps, streaks, and milestone achievements.</li>
                <li><strong className="text-rpg-text">Security Telemetry:</strong> Session tokens securely stored in encrypted HttpOnly cookies to protect against cross-site scripting (XSS).</li>
              </ul>
            </section>

            <section className="bg-rpg-surface/80 border border-rpg-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-rpg-text mb-3">
                3. Security Standards
              </h2>
              <p>
                All data transmission between your browser and our servers is encrypted via TLS/HTTPS. Passwords and token secrets are hashed with cryptographic salts before storage in our database.
              </p>
            </section>

            <section className="bg-rpg-surface/80 border border-rpg-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-rpg-text mb-3">
                4. Data Portability & Account Erasure
              </h2>
              <p>
                You may request export or permanent deletion of your account and related quest histories at any time through our verified user support channels.
              </p>
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default PrivacyPage;
