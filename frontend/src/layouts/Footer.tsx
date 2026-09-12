import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from './PageContainer';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features',   href: '#features'      },
    { label: 'How It Works', href: '#how-it-works'  },
    { label: 'Preview',    href: '#preview'        },
  ],
  Project: [
    { label: 'Phase 1 — Foundation',    href: '#' },
    { label: 'Phase 2 — Auth & Quests', href: '#' },
    { label: 'Phase 3 — Progression',   href: '#' },
  ],
};

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-rpg-border bg-rpg-surface/50 mt-24"
      role="contentinfo"
    >
      <PageContainer>
        <div className="py-12">
          {/* Top section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3" aria-label="Life RPG">
                <span className="text-2xl" aria-hidden="true">⚔️</span>
                <span className="font-display text-lg font-bold text-gold-gradient">Life RPG</span>
              </Link>
              <p className="text-sm text-rpg-text-muted leading-relaxed max-w-xs">
                Transform your real-life productivity into an epic fantasy adventure.
                Level up. Earn gold. Become legendary.
              </p>
              {/* Tech stack badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma'].map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-[10px] font-mono text-rpg-text-faint border border-rpg-border rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <h3 className="font-display text-xs uppercase tracking-widest text-rpg-gold mb-4">
                  {section}
                </h3>
                <ul className="space-y-2" role="list">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-rpg-text-muted hover:text-rpg-gold transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="rpg-divider" aria-hidden="true" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-rpg-text-faint font-mono">
              © {year} Life RPG · Phase 1 Foundation
            </p>
            <p className="text-xs text-rpg-text-faint font-mono">
              Built as a full-stack developer assessment project
            </p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
};

export default Footer;
