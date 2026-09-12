import React from 'react';
import type { RpgAttributes } from '../types';
const labels: Array<[keyof RpgAttributes, string]> = [['strength', 'Strength'], ['intelligence', 'Intelligence'], ['discipline', 'Discipline'], ['stamina', 'Stamina'], ['consistency', 'Consistency']];
const AttributesCard: React.FC<{ attributes: RpgAttributes }> = ({ attributes }) => <section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6"><h2 className="font-display text-xl font-bold text-rpg-text mb-1">Base Attributes</h2><p className="text-sm text-rpg-text-muted mb-4">Your foundational adventurer stats.</p><dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">{labels.map(([key, label]) => <div key={key} className="bg-rpg-bg border border-rpg-border rounded-rpg p-3"><dt className="text-xs text-rpg-text-muted">{label}</dt><dd className="font-display text-xl text-rpg-gold font-bold">{attributes[key]}</dd></div>)}</dl></section>;
export default AttributesCard;
