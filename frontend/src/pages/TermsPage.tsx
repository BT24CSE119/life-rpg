import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../layouts/PageContainer';

const TermsPage: React.FC = () => {
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
              Terms of Service
            </h1>
            <p className="text-xs font-mono text-rpg-text-muted">
              Effective Date: September 2026 · Version 1.2
            </p>
          </header>

          <div className="space-y-8 text-sm text-rpg-text-muted leading-relaxed">
            <section className="bg-rpg-surface/80 border border-rpg-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-rpg-text mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account or accessing Life RPG, you agree to adhere to these Terms of Service. If you do not accept these terms, you may not access or use the platform.
              </p>
            </section>

            <section className="bg-rpg-surface/80 border border-rpg-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-rpg-text mb-3">
                2. Account Conduct & Character Integrity
              </h2>
              <p className="mb-3">
                You are responsible for safeguarding your account credentials. You agree not to exploit software bugs, execute unauthorized automated scripts, or compromise our progression servers.
              </p>
              <p>
                Progression metrics (XP, Gold, Streaks) remain non-monetary virtual counters associated with your productivity accomplishments within the game environment.
              </p>
            </section>

            <section className="bg-rpg-surface/80 border border-rpg-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-rpg-text mb-3">
                3. User Content & Quests
              </h2>
              <p>
                Your quest data and habit notes remain your own personal productivity content. You grant Life RPG only the technical license needed to synchronize, back up, and calculate your progress safely.
              </p>
            </section>

            <section className="bg-rpg-surface/80 border border-rpg-border/60 rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-rpg-text mb-3">
                4. Service Availability & Modifications
              </h2>
              <p>
                We continuously enhance platform features, database resiliency, and game mechanics. We reserve the right to modify services with reasonable maintenance notice.
              </p>
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default TermsPage;
