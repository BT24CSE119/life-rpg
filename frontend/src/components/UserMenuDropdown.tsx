import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRpg } from '../context/RpgContext';
import { updateUsername as updateUsernameApi } from '../services/auth';

interface UserMenuDropdownProps {
  className?: string;
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({ className = '' }) => {
  const { user, logout, updateUser } = useAuth();
  const { goldBalance, playerLevel, currentStreak, equippedCosmetics, realtimeConnected } = useRpg();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditingName(false);
        setEditError(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName) {
      setNewName(user?.username || '');
      setEditError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditingName, user?.username]);

  if (!user) return null;

  const initial = (user.username?.[0] || 'A').toUpperCase();
  const avatarFrame = equippedCosmetics.find((c) => c.category === 'AVATAR_FRAME');

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  const handleSaveName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newName.trim();

    if (!trimmed) {
      setEditError('Name cannot be empty');
      return;
    }
    if (trimmed === user.username) {
      setIsEditingName(false);
      return;
    }
    if (trimmed.length < 3) {
      setEditError('Name must be at least 3 characters');
      return;
    }
    if (trimmed.length > 30) {
      setEditError('Name must be at most 30 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setEditError('Letters, numbers, and underscores only');
      return;
    }

    try {
      setIsSaving(true);
      setEditError(null);
      const updated = await updateUsernameApi(trimmed);
      updateUser(updated);
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 2500);
      setIsEditingName(false);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setEditError(errorObj.response?.data?.error?.message || errorObj.message || 'Failed to update adventurer name');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Circle Avatar Trigger Button */}
      <button
        type="button"
        id="user-menu-avatar-btn"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile and settings"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsEditingName(false);
          setEditError(null);
        }}
        className="relative flex items-center justify-center rounded-full p-0.5 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rpg-gold/60 group"
      >
        {/* Subtle, refined border ring (no harsh blinding glow) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/40 via-amber-400/50 to-amber-600/30 opacity-60 group-hover:opacity-100 transition-opacity" />

        {/* Inner Circle Avatar */}
        <div className="relative w-10 h-10 rounded-full bg-slate-900 border border-amber-500/40 flex items-center justify-center overflow-hidden shadow-sm">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display font-bold text-base text-amber-300 bg-gradient-to-br from-amber-600/40 via-slate-800 to-slate-900">
              {initial}
            </div>
          )}

          {/* Avatar Frame emoji overlay if equipped */}
          {avatarFrame?.iconEmoji && (
            <span className="absolute bottom-0 right-0 text-xs drop-shadow-sm" title={avatarFrame.name}>
              {avatarFrame.iconEmoji}
            </span>
          )}
        </div>

        {/* Online Status Indicator */}
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-rpg-bg ${
            realtimeConnected ? 'bg-emerald-400' : 'bg-emerald-500'
          }`}
          title={realtimeConnected ? 'Live Connection Active' : 'Online'}
        />
      </button>

      {/* Floating Glassmorphic Dropdown Panel */}
      {isOpen && (
        <div
          id="user-profile-menu-panel"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-avatar-btn"
          className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-rpg-surface/95 border border-rpg-border/80 backdrop-blur-2xl shadow-2xl shadow-black/90 z-50 overflow-hidden animate-fade-in divide-y divide-rpg-border/50 text-rpg-text"
          style={{ width: '360px', maxWidth: 'calc(100vw - 2rem)' }}
        >
          {/* Header Card with User Avatar & Identity */}
          <div className="p-4 bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-transparent">
            <div className="flex items-start gap-3.5">
              <div className="relative w-14 h-14 rounded-full bg-slate-900 border border-amber-500/50 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-display font-bold text-2xl text-amber-300">
                    {initial}
                  </span>
                )}
                {avatarFrame?.iconEmoji && (
                  <span className="absolute bottom-0 right-0 text-sm drop-shadow-sm" title={avatarFrame.name}>
                    {avatarFrame.iconEmoji}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Username with Inline Edit Trigger */}
                {!isEditingName ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-display font-black text-lg text-amber-300 truncate" title={user.username}>
                        {user.username}
                      </h3>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 font-bold">
                        {user.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 px-2 py-1 rounded-md transition-colors flex items-center gap-1 shrink-0 font-medium"
                      title="Edit adventurer name"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  </div>
                ) : (
                  /* Inline Edit Form */
                  <form onSubmit={handleSaveName} className="space-y-2 w-full">
                    <div className="relative flex items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Adventurer Name"
                        maxLength={30}
                        disabled={isSaving}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-black/70 border border-amber-400/70 text-amber-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingName(false);
                          setEditError(null);
                        }}
                        disabled={isSaving}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {editError && (
                  <p className="text-[11px] text-red-400 mt-1.5 font-medium">{editError}</p>
                )}
                {editSuccess && (
                  <p className="text-[11px] text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                    ✓ Adventurer name updated!
                  </p>
                )}

                <p className="text-xs text-rpg-text-muted truncate mt-1" title={user.email}>
                  {user.email}
                </p>

                {user.googleId && (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-sky-400">
                    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google Account Linked</span>
                  </div>
                )}
              </div>
            </div>

            {/* RPG Quick Vitals Bar */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-rpg-border/40 text-center">
              <div className="bg-rpg-bg/70 rounded-xl p-2 border border-rpg-border/40">
                <span className="block text-[10px] text-rpg-text-muted uppercase tracking-wider font-semibold">Hero Rank</span>
                <span className="font-display font-black text-sm text-amber-300">Lv. {playerLevel ?? 1}</span>
              </div>
              <div className="bg-rpg-bg/70 rounded-xl p-2 border border-rpg-border/40">
                <span className="block text-[10px] text-rpg-text-muted uppercase tracking-wider font-semibold">Gold In Bag</span>
                <span className="font-display font-black text-sm text-amber-400 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-7 0c0 4 7 2 7 6a3.5 3.5 0 0 1-7 0" />
                  </svg>
                  {goldBalance ?? 0}
                </span>
              </div>
              <div className="bg-rpg-bg/70 rounded-xl p-2 border border-rpg-border/40">
                <span className="block text-[10px] text-rpg-text-muted uppercase tracking-wider font-semibold">Day Streak</span>
                <span className="font-display font-black text-sm text-orange-400 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                  {currentStreak ?? 0}d
                </span>
              </div>
            </div>
          </div>

          {/* Genuine Profile & Account Controls */}
          <div className="py-2.5 px-2 space-y-1">
            {/* Edit Adventurer Name Action Button */}
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium hover:bg-rpg-bg/80 hover:text-amber-300 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-rpg-text group-hover:text-amber-300">Edit Adventurer Name</div>
                  <div className="text-[11px] text-rpg-text-muted">Change your realm callsign</div>
                </div>
              </div>
              <span className="text-xs text-amber-400/80 font-mono group-hover:text-amber-300">
                ✎
              </span>
            </button>

            {/* Change Avatar / Customize Skin */}
            <Link
              to="/inventory"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium hover:bg-rpg-bg/80 hover:text-amber-300 transition-colors group"
              role="menuitem"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 1 0-16 0" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-rpg-text group-hover:text-amber-300">Customize Avatar & Skins</div>
                  <div className="text-[11px] text-rpg-text-muted">Equip character titles and frames</div>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Wardrobe
              </span>
            </Link>

            {/* Account Info / Status */}
            <div className="px-3 py-2 rounded-xl bg-rpg-bg/40 border border-rpg-border/30">
              <div className="flex items-center justify-between text-[11px] text-rpg-text-muted">
                <span>Account Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Realm Hero
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-rpg-text-muted mt-1">
                <span>Session Persistence</span>
                <span className="text-amber-300/90 font-mono">Secured & Saved</span>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="p-2.5 bg-rpg-bg/60">
            <button
              type="button"
              id="avatar-dropdown-logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/15 hover:text-red-300 border border-red-500/30 active:scale-[0.98] transition-all"
              role="menuitem"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Depart Realm (Sign Out)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenuDropdown;

