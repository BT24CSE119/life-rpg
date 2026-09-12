import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../layouts/PageContainer';
import RPGButton from '../components/RPGButton';
import RPGCard from '../components/RPGCard';
import CharacterStatsCard from '../components/CharacterStatsCard';
import QuestPreviewCard from '../components/QuestPreviewCard';
import XPProgressBar from '../components/XPProgressBar';
import type { PreviewCharacter, PreviewQuest } from '../types';

// ── Static Preview Data (NOT real user data — UI demo only) ──────────────────

const PREVIEW_CHARACTER: PreviewCharacter = {
  name: 'Adventurer',
  level: 7,
  xp: 3420,
  xpToNextLevel: 5000,
  gold: 1250,
  hp: 85,
  maxHp: 100,
  currentStreak: 12,
  stats: {
    strength:     14,
    agility:      11,
    intelligence: 18,
    wisdom:       13,
    vitality:     10,
    charisma:     9,
  },
};

const PREVIEW_QUESTS: PreviewQuest[] = [
  {
    id: '1',
    title: 'Complete 30-Minute Workout',
    description: 'Push yourself through a full body workout. Strength is forged in iron.',
    difficulty: 'MEDIUM',
    xpReward: 120,
    goldReward: 60,
    category: 'Fitness',
    status: 'ACTIVE',
  },
  {
    id: '2',
    title: 'Read 20 Pages of a Technical Book',
    description: 'Knowledge is the most powerful weapon an adventurer can wield.',
    difficulty: 'EASY',
    xpReward: 75,
    goldReward: 40,
    category: 'Learning',
    status: 'ACTIVE',
  },
  {
    id: '3',
    title: 'Ship a New Feature to Production',
    description: 'Legendary developers ship. Deploy something meaningful today.',
    difficulty: 'HARD',
    xpReward: 280,
    goldReward: 150,
    category: 'Work',
    status: 'COMPLETED',
  },
  {
    id: '4',
    title: 'Meditate for 10 Minutes',
    description: 'Wisdom grows in silence. A calm mind defeats every dragon.',
    difficulty: 'EASY',
    xpReward: 60,
    goldReward: 30,
    category: 'Wellness',
    status: 'ACTIVE',
  },
];

const FEATURES = [
  {
    icon: '⚔️',
    title: 'Create Quests',
    description:
      'Transform your real-life tasks into epic quests. Set difficulty, due dates, and rewards.',
    color: '#F5C842',
  },
  {
    icon: '✨',
    title: 'Earn XP & Level Up',
    description:
      'Every completed task earns you experience. Watch your character grow stronger with each achievement.',
    color: '#A78BFA',
  },
  {
    icon: '🪙',
    title: 'Collect Gold',
    description:
      'Earn gold for every quest. Spend it in the shop to unlock powerful items and cosmetics.',
    color: '#F5C842',
  },
  {
    icon: '📊',
    title: 'Build Attributes',
    description:
      'Develop 6 unique attributes — Strength, Agility, Intelligence, Wisdom, Vitality, Charisma.',
    color: '#10B981',
  },
  {
    icon: '🔥',
    title: 'Maintain Streaks',
    description:
      'Stay consistent. Daily streaks multiply your rewards and unlock special bonuses.',
    color: '#F97316',
  },
  {
    icon: '🏆',
    title: 'Unlock Achievements',
    description:
      'Discover hidden achievements, rare item drops, and legendary titles as you progress.',
    color: '#EC4899',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Hero',
    description: 'Choose your character name and begin your adventure with 100 HP and starter attributes.',
    icon: '🧙',
  },
  {
    step: '02',
    title: 'Accept Quests',
    description: 'Convert your real-life goals into quests. Assign difficulty — Trivial to Legendary.',
    icon: '📜',
  },
  {
    step: '03',
    title: 'Complete & Earn',
    description: 'Finish tasks in the real world, mark quests complete, and collect XP + Gold.',
    icon: '🎯',
  },
  {
    step: '04',
    title: 'Level Up',
    description: 'Watch your character evolve. Unlock new abilities, stronger stats, and rare loot.',
    icon: '⬆️',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen">

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        aria-labelledby="hero-heading"
      >
        {/* Background — deep gradient + stars */}
        <div
          className="absolute inset-0 bg-rpg-gradient-hero star-bg"
          aria-hidden="true"
        />

        {/* Ambient glow orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F5C842 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <PageContainer className="relative z-10 py-24">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

            {/* Left — text content */}
            <div className="flex-1 text-center lg:text-left">
              <h1
                id="hero-heading"
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 animate-fade-in delay-100"
              >
                <span className="text-rpg-text">Turn Your</span>
                <br />
                <span className="text-gold-gradient">Real Life</span>
                <br />
                <span className="text-rpg-text">Into an</span>{' '}
                <span className="text-arcane-gradient">Adventure</span>
              </h1>

              <p className="text-lg text-rpg-text-muted leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8 animate-fade-in delay-200">
                Life RPG gamifies your productivity into an immersive fantasy experience.
                Create quests, earn XP, level up your character, and conquer your real-life goals.
              </p>

              {/* Stats row */}
              <div className="flex items-center justify-center lg:justify-start gap-6 mb-10 animate-fade-in delay-300">
                {[
                  { value: '∞', label: 'Quests' },
                  { value: '6',  label: 'Attributes' },
                  { value: '99', label: 'Max Level' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-display font-bold text-rpg-gold">{value}</div>
                    <div className="text-xs text-rpg-text-muted font-mono uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in delay-400">
                <Link to="/signup">
                  <RPGButton variant="gold" size="xl" leftIcon={<span>⚔️</span>}>
                    Begin Your Quest
                  </RPGButton>
                </Link>
                <a href="#preview">
                  <RPGButton variant="ghost" size="xl" leftIcon={<span>👁️</span>}>
                    View Demo
                  </RPGButton>
                </a>
              </div>
            </div>

            {/* Right — character preview card */}
            <div className="flex-1 max-w-sm w-full animate-fade-in delay-300">
              <div className="animate-float">
                <CharacterStatsCard character={PREVIEW_CHARACTER} />
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
            <span className="text-xs font-mono text-rpg-text-faint tracking-widest uppercase">Scroll</span>
            <svg className="w-4 h-4 text-rpg-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </PageContainer>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 bg-rpg-surface/30"
        aria-labelledby="how-heading"
      >
        <PageContainer>
          <div className="text-center mb-16">
            <span className="text-xs font-mono tracking-widest uppercase text-rpg-emerald mb-3 block">
              Simple & Rewarding
            </span>
            <h2 id="how-heading" className="font-display text-4xl font-bold text-rpg-text mb-4">
              How It Works
            </h2>
            <p className="text-rpg-text-muted max-w-xl mx-auto">
              Four simple steps to transform your productivity into a legendary adventure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, description, icon }, idx) => (
              <RPGCard
                key={step}
                variant="default"
                className={`text-center animate-fade-in-up delay-${(idx + 1) * 100}`}
              >
                {/* Step icon */}
                <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
                {/* Step number */}
                <div className="text-xs font-mono text-rpg-gold mb-2 tracking-widest">STEP {step}</div>
                <h3 className="font-display text-base font-semibold text-rpg-text mb-2">{title}</h3>
                <p className="text-sm text-rpg-text-muted leading-relaxed">{description}</p>
              </RPGCard>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-24"
        aria-labelledby="features-heading"
      >
        <PageContainer>
          <div className="text-center mb-16">
            <span className="text-xs font-mono tracking-widest uppercase text-rpg-arcane-light mb-3 block">
              Powerful Features
            </span>
            <h2 id="features-heading" className="font-display text-4xl font-bold text-rpg-text mb-4">
              Your Full RPG Toolkit
            </h2>
            <p className="text-rpg-text-muted max-w-xl mx-auto">
              Everything you need to transform daily tasks into an epic adventure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, description, color }, idx) => (
              <RPGCard
                key={title}
                variant="default"
                hoverable
                className={`group animate-fade-in-up delay-${(idx % 3 + 1) * 100}`}
              >
                <div
                  className="w-12 h-12 rounded-rpg flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  aria-hidden="true"
                >
                  {icon}
                </div>
                <h3 className="font-display text-base font-semibold text-rpg-text mb-2">{title}</h3>
                <p className="text-sm text-rpg-text-muted leading-relaxed">{description}</p>
              </RPGCard>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── Quest Preview Section ────────────────────────────────────────── */}
      <section
        id="preview"
        className="py-24 bg-rpg-surface/30"
        aria-labelledby="preview-heading"
      >
        <PageContainer>
          <div className="text-center mb-16">
            <span className="text-xs font-mono tracking-widest uppercase text-rpg-gold mb-3 block">
              Quest System
            </span>
            <h2 id="preview-heading" className="font-display text-4xl font-bold text-rpg-text mb-4">
              Your Quest Board
            </h2>
            <p className="text-rpg-text-muted max-w-xl mx-auto">
              Transform daily tasks and habits into RPG quests to earn XP, gold, and unlock powerful achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quest list */}
            <div className="lg:col-span-2 space-y-4">
              {PREVIEW_QUESTS.map((quest) => (
                <QuestPreviewCard key={quest.id} quest={quest} />
              ))}
            </div>

            {/* Daily progress sidebar */}
            <div className="space-y-4">
              <RPGCard variant="gold">
                <h3 className="font-display text-sm text-rpg-gold mb-4">📊 Today's Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-rpg-text-muted font-mono">Quests Completed</span>
                      <span className="text-rpg-gold font-mono">1 / 4</span>
                    </div>
                    <div className="h-2 bg-rpg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full w-1/4 rounded-full bg-rpg-gradient-gold" />
                    </div>
                  </div>
                  <XPProgressBar
                    currentXP={420}
                    maxXP={1000}
                    level={7}
                    showLabel
                    showValues
                    size="sm"
                    animate
                  />
                </div>

                {/* Streak */}
                <div className="mt-5 pt-4 border-t border-rpg-gold/20 flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">🔥</span>
                  <div>
                    <div className="text-lg font-bold font-display text-rpg-gold">12 Days</div>
                    <div className="text-xs text-rpg-text-muted font-mono">Current Streak</div>
                  </div>
                </div>
              </RPGCard>

              {/* Difficulty legend */}
              <RPGCard variant="default">
                <h3 className="font-display text-sm text-rpg-text mb-3">⚖️ Difficulty Scale</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Trivial',   xp: '25–50',    color: '#94A3B8', icon: '🌱' },
                    { label: 'Easy',      xp: '50–100',   color: '#10B981', icon: '⚔️' },
                    { label: 'Medium',    xp: '100–200',  color: '#F5C842', icon: '🗡️' },
                    { label: 'Hard',      xp: '200–400',  color: '#F97316', icon: '🔥' },
                    { label: 'Epic',      xp: '400–700',  color: '#A78BFA', icon: '⚡' },
                    { label: 'Legendary', xp: '700–1500', color: '#EC4899', icon: '🌟' },
                  ].map(({ label, xp, color, icon }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2" style={{ color }}>
                        <span aria-hidden="true">{icon}</span>
                        {label}
                      </span>
                      <span className="font-mono text-rpg-text-faint">{xp} XP</span>
                    </div>
                  ))}
                </div>
              </RPGCard>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section
        className="py-24"
        aria-labelledby="cta-heading"
      >
        <PageContainer>
          <div
            className="relative overflow-hidden rounded-rpg-xl text-center py-16 px-8"
            style={{
              background: 'linear-gradient(135deg, #1A1040 0%, #0D1A2A 50%, #1A0D2E 100%)',
              border: '1px solid rgba(245,200,66,0.2)',
              boxShadow: '0 0 60px rgba(124,58,237,0.15), 0 0 40px rgba(245,200,66,0.05)',
            }}
          >
            {/* Decorative orbs */}
            <div
              className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #F5C842, transparent)' }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="text-5xl mb-4" aria-hidden="true">🏆</div>
              <h2
                id="cta-heading"
                className="font-display text-4xl sm:text-5xl font-bold text-rpg-text mb-4"
              >
                Ready to Become{' '}
                <span className="text-gold-gradient">Legendary?</span>
              </h2>
              <p className="text-rpg-text-muted text-lg max-w-xl mx-auto mb-8">
                Your real life is your greatest adventure. Every task is a quest.
                Every achievement is a level up. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <RPGButton variant="gold" size="xl" leftIcon="⚔️">
                    Create Your Character
                  </RPGButton>
                </Link>
                <a href="#how-it-works">
                  <RPGButton variant="ghost" size="xl">
                    Learn More
                  </RPGButton>
                </a>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default LandingPage;
