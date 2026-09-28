import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import LoginForm from './components/LoginForm';
import ScheduleTable from './components/ScheduleTable';
import TeacherManager from './components/TeacherManager';
import { BASE_ISO, fromISO, nextSunday, startOfDay, sundaysBetween, toISO, windowRange } from './lib/dates';
import { backend } from './lib/store';
import { supabase } from './lib/supabase';
import type { Sermon, Sermons } from './lib/types';

const MONTHS_BEHIND = 1;
const MONTHS_AHEAD = 12;

export default function App() {
  const [sermons, setSermons] = useState<Sermons>({});
  const [teachers, setTeachers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showTeachers, setShowTeachers] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);
  const nextISO = toISO(nextSunday(today));
  const canEdit = backend.mode === 'local' || !!session;

  const dates = useMemo(() => {
    const { start, end } = windowRange(today, MONTHS_BEHIND, MONTHS_AHEAD);
    return sundaysBetween(showAll ? fromISO(BASE_ISO) : start, end);
  }, [today, showAll]);

  const seriesOptions = useMemo(
    () => Array.from(new Set(Object.values(sermons).map((s) => s.series).filter(Boolean))).sort(),
    [sermons],
  );

  // Auth session (Supabase mode only)
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Initial load
  useEffect(() => {
    backend
      .load()
      .then((res) => {
        setSermons(res.sermons);
        setTeachers(res.teachers);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load the schedule.'))
      .finally(() => setLoading(false));
  }, []);

  // Bring the next Sunday into view
  useEffect(() => {
    if (!loading) document.getElementById('next-sunday')?.scrollIntoView({ block: 'center' });
  }, [loading, showAll]);

  const reload = useCallback(async () => {
    try {
      const res = await backend.load();
      setSermons(res.sermons);
      setTeachers(res.teachers);
    } catch {
      /* keep what is on screen */
    }
  }, []);

  const handleSave = useCallback(
    async (s: Sermon) => {
      setSermons((prev) => ({ ...prev, [s.sunday]: s }));
      try {
        await backend.save(s);
        setError('');
      } catch (e) {
        setError(e instanceof Error ? `Could not save: ${e.message}` : 'Could not save that change.');
        reload();
      }
    },
    [reload],
  );

  const addTeacher = async (name: string) => {
    setTeachers((prev) => [...prev, name].sort((a, b) => a.localeCompare(b)));
    try {
      await backend.addTeacher(name);
    } catch (e) {
      setError(e instanceof Error ? `Could not add teacher: ${e.message}` : 'Could not add teacher.');
      reload();
    }
  };

  const removeTeacher = async (name: string) => {
    setTeachers((prev) => prev.filter((t) => t !== name));
    try {
      await backend.removeTeacher(name);
    } catch (e) {
      setError(e instanceof Error ? `Could not remove teacher: ${e.message}` : 'Could not remove teacher.');
      reload();
    }
  };

  const btn = 'rounded bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 text-white">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">URF Sermon Planner</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show all dates
          </label>
          <button
            className={btn}
            onClick={() => document.getElementById('next-sunday')?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
          >
            Jump to next Sunday
          </button>
          {canEdit && (
            <button className={btn} onClick={() => setShowTeachers(true)}>
              Teachers
            </button>
          )}
          {supabase &&
            (session ? (
              <button className={btn} onClick={() => supabase!.auth.signOut()}>
                Sign out
              </button>
            ) : (
              <button className={`${btn} bg-ember/90 hover:bg-ember`} onClick={() => setShowLogin(true)}>
                Sign in to edit
              </button>
            ))}
        </div>
      </header>

      {backend.mode === 'local' && (
        <p className="mb-3 rounded bg-butter px-3 py-2 text-sm text-ink">
          Demo mode: changes are saved in this browser only. Add your Supabase keys (see README) to connect the shared
          database.
        </p>
      )}
      {backend.mode === 'supabase' && !session && (
        <p className="mb-3 text-sm text-white/70">View only. Sign in to make changes.</p>
      )}
      {error && <p className="mb-3 rounded bg-red-100 px-3 py-2 text-sm text-red-800">{error}</p>}

      {loading ? (
        <p className="py-10 text-center text-white/70">Loading the schedule...</p>
      ) : (
        <ScheduleTable
          dates={dates}
          sermons={sermons}
          teachers={teachers}
          seriesOptions={seriesOptions}
          canEdit={canEdit}
          nextISO={nextISO}
          onSave={handleSave}
        />
      )}

      {showTeachers && (
        <TeacherManager
          teachers={teachers}
          onAdd={addTeacher}
          onRemove={removeTeacher}
          onClose={() => setShowTeachers(false)}
        />
      )}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </div>
  );
}
