import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../layouts/PageContainer';
import RPGCard from '../components/RPGCard';
import RPGButton from '../components/RPGButton';
import CharacterStatsCard from '../components/CharacterStatsCard';
import QuestPreviewCard from '../components/QuestPreviewCard';
import XPProgressBar from '../components/XPProgressBar';
import GoldBadge from '../components/GoldBadge';
import type { PreviewCharacter, PreviewQuest } from '../types';

// ── Static Preview Data (NOT real user data — UI demo only) ──────────────────

const PREVIEW_CHARACTER: PreviewCharacter = {
  name: 'Hero of Realms',
  level: 12,
  xp: 7840,
  xpToNextLevel: 12000,
  gold: 4750,
  hp: 92,
  maxHp: 140,
  currentStreak: 21,
  stats: {
    strength:     19,
    agility:      16,
    intelligence: 24,
    wisdom:       18,
    vitality:     14,
    charisma:     12,
  },
};

const PREVIEW_QUESTS: PreviewQuest[] = [
  {
    id: 'q1',
    title: 'Deploy New API Endpoint',
    description: 'Implement and deploy the /api/quests endpoint with full CRUD.',
    difficulty: 'HARD',
    xpReward: 280,
    goldReward: 140,
    category: 'Work',
    status: 'ACTIVE',
  },
  {
    id: 'q2',
    title: 'Morning Run — 5km',
    description: 'Complete a 5km run before 8am. Speed is life.',
    difficulty: 'MEDIUM',
    xpReward: 120,
    goldReward: 60,
    category: 'Fitness',
    status: 'ACTIVE',
  },
  {
    id: 'q3',
    title: 'Study TypeScript Generics',
    description: 'Deep-dive into advanced TypeScript generics for 1 hour.',
    difficulty: 'MEDIUM',
    xpReward: 100,
    goldReward: 50,
    category: 'Learning',
    status: 'COMPLETED',
  },
];

const ACTIVITY_LOG = [
  { icon: '✅', text: 'Completed: Morning Meditation', time: '2h ago', color: '#10B981' },
  { icon: '⬆️', text: 'Leveled up to Level 12!',      time: '4h ago', color: '#F5C842' },
  { icon: '🪙', text: 'Earned 200 Gold from Quest',    time: '4h ago', color: '#F5C842' },
  { icon: '🔥', text: '21-Day Streak Achieved!',        time: '1d ago', color: '#F97316' },
  { icon: '✨', text: '+450 XP from completed quest',   time: '1d ago', color: '#A78BFA' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-16">
      <PageContainer className="py-8">

        {/* Preview banner */}
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-rpg border border-rpg-gold/30 bg-rpg-gold/5">
          <span className="text-lg" aria-hidden="true">⚠️</span>
          <div>
            <span className="text-sm text-rpg-gold font-semibold">Static UI Preview — Phase 1</span>
            <span className="text-xs text-rpg-text-muted ml-2">
              This dashboard uses hardcoded demo data. Real data and auth come in Phase 2.
            </span>
          </div>
          <Link to="/" className="ml-auto shrink-0">
            <RPGButton variant="ghost" size="sm">← Back to Landing</RPGButton>
          </Link>
        </div>

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-rpg-text">
            Welcome back, <span className="text-gold-gradient">Hero of Realms</span>
          </h1>
          <p className="text-rpg-text-muted mt-1">
            You have <span className="text-rpg-gold font-semibold">3 active quests</span> awaiting your glory.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* Left sidebar — character */}
          <div className="xl:col-span-1 space-y-4">
            <CharacterStatsCard character={PREVIEW_CHARACTER} isPreview />

            {/* Quick stats */}
            <RPGCard variant="default">
              <h2 className="font-display text-xs text-rpg-text-muted uppercase tracking-widest mb-4">
                📈 All Time Stats
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Quests Done',   value: '47',    icon: '⚔️' },
                  { label: 'Total XP',       value: '18,240', icon: '✨' },
                  { label: 'Days Active',    value: '34',    icon: '📅' },
                  { label: 'Longest Streak', value: '21d',   icon: '🔥' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-rpg-text-muted flex items-center gap-2">
                      <span aria-hidden="true">{icon}</span> {label}
                    </span>
                    <span className="text-sm font-mono font-semibold text-rpg-text">{value}</span>
                  </div>
                ))}
              </div>
            </RPGCard>
          </div>

          {/* Center — quests + activity */}
          <div className="xl:col-span-2 space-y-6">

            {/* Quest board */}
            <RPGCard variant="default" padding="lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-base font-semibold text-rpg-text">
                  ⚔️ Active Quests
                </h2>
                <RPGButton variant="ghost" size="sm" leftIcon="＋">
                  New Quest
                </RPGButton>
              </div>
              <div className="space-y-3">
                {PREVIEW_QUESTS.map((quest) => (
                  <QuestPreviewCard key={quest.id} quest={quest} />
                ))}
              </div>
            </RPGCard>

            {/* Activity log */}
            <RPGCard variant="default" padding="lg">
              <h2 className="font-display text-base font-semibold text-rpg-text mb-5">
                📜 Recent Activity
              </h2>
              <div className="space-y-3">
                {ACTIVITY_LOG.map(({ icon, text, time, color }, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-3 border-b border-rpg-border/40 last:border-0 last:pb-0"
                  >
                    <span
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-base"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-rpg-text">{text}</p>
                      <p className="text-xs text-rpg-text-faint font-mono mt-0.5">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RPGCard>
          </div>

          {/* Right sidebar — progress */}
          <div className="xl:col-span-1 space-y-4">

            {/* Daily XP */}
            <RPGCard variant="gold" padding="md">
              <h2 className="font-display text-xs text-rpg-gold uppercase tracking-widest mb-4">
                ⚡ Today's XP
              </h2>
              <div className="text-3xl font-display font-bold text-rpg-gold mb-1">+850</div>
              <div className="text-xs text-rpg-text-muted mb-4">XP earned today</div>
              <XPProgressBar
                currentXP={7840}
                maxXP={12000}
                level={12}
                size="md"
                animate
              />
            </RPGCard>

            {/* Gold wallet */}
            <RPGCard variant="default" padding="md">
              <h2 className="font-display text-xs text-rpg-text-muted uppercase tracking-widest mb-3">
                🏦 Treasury
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <GoldBadge amount={PREVIEW_CHARACTER.gold} size="lg" animate />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-rpg-text-muted">Earned Today</span>
                  <span className="text-rpg-gold font-mono">+340</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-rpg-text-muted">Spent This Week</span>
                  <span className="text-rpg-danger-light font-mono">-500</span>
                </div>
              </div>
              <RPGButton variant="ghost" size="sm" fullWidth className="mt-4">
                🛒 Visit Shop
              </RPGButton>
            </RPGCard>

            {/* Attribute highlights */}
            <RPGCard variant="arcane" padding="md">
              <h2 className="font-display text-xs text-rpg-arcane-light uppercase tracking-widest mb-4">
                📊 Top Attributes
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Intelligence', value: 24, max: 30, color: '#60A5FA', icon: '📚' },
                  { label: 'Strength',     value: 19, max: 30, color: '#EF4444', icon: '⚔️' },
                  { label: 'Wisdom',       value: 18, max: 30, color: '#A78BFA', icon: '🔮' },
                ].map(({ label, value, max, color, icon }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-rpg-text-muted flex items-center gap-1.5">
                        <span aria-hidden="true">{icon}</span> {label}
                      </span>
                      <span className="font-mono" style={{ color }}>{value}/{max}</span>
                    </div>
                    <div className="h-1.5 bg-rpg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(value / max) * 100}%`, background: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </RPGCard>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default DashboardPage;
