import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from './PageContainer';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-rpg-border/70 bg-rpg-surface/85 backdrop-blur-md mt-24"
      role="contentinfo"
    >
      <PageContainer>
        <div className="pt-12 pb-8">
          {/* Main Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-rpg-border/40">
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-3">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400/60 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                    <path d="M13 19l6-6" />
                    <path d="M2 2l6 6" />
                    <path d="M20 16l2-2" />
                    <path d="M16 20l2-2" />
                  </svg>
                </div>
                <span className="font-display text-base font-bold text-rpg-text tracking-wide">
                  Life RPG
                </span>
              </Link>
              <p className="text-xs text-rpg-text-muted leading-relaxed max-w-sm">
                A server-verified gamified productivity system that transforms everyday habits, tasks, and goals into RPG progression.
              </p>
            </div>

            {/* Platform Column */}
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400/90 mb-3">
                Platform
              </p>
              <ul className="space-y-2 text-xs font-medium text-rpg-text-muted">
                <li>
                  <Link to="/dashboard" className="hover:text-amber-300 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/quests" className="hover:text-amber-300 transition-colors">
                    Quest Board
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-amber-300 transition-colors">
                    Guild Shop
                  </Link>
                </li>
                <li>
                  <Link to="/achievements" className="hover:text-amber-300 transition-colors">
                    Hall of Achievements
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Compliance Column */}
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400/90 mb-3">
                Legal & Support
              </p>
              <ul className="space-y-2 text-xs font-medium text-rpg-text-muted">
                <li>
                  <Link to="/terms" className="hover:text-amber-300 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-amber-300 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:stayos.test@gmail.com"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Status, Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rpg-text-faint font-mono">
            <p>© {year} Life RPG. All rights reserved.</p>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] text-emerald-400/90">Systems Operational</span>
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
};

export default Footer;
