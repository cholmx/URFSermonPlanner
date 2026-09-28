import { supabase } from './supabase';
import { SEED_SERMONS, SEED_TEACHERS } from './seed';
import type { Sermon, Sermons } from './types';

export interface Backend {
  mode: 'supabase' | 'local';
  load(): Promise<{ sermons: Sermons; teachers: string[] }>;
  save(s: Sermon): Promise<void>;
  addTeacher(name: string): Promise<void>;
  removeTeacher(name: string): Promise<void>;
}

const isEmpty = (s: Sermon) => !s.teacher && !s.series && !s.topic;

// ---------- Supabase ----------
function supabaseBackend(): Backend {
  const db = supabase!;
  return {
    mode: 'supabase',
    async load() {
      const [sermonRes, teacherRes] = await Promise.all([
        db.from('sermons').select('sunday, teacher, series, topic'),
        db.from('teachers').select('name').order('name'),
      ]);
      if (sermonRes.error) throw sermonRes.error;
      if (teacherRes.error) throw teacherRes.error;
      const sermons: Sermons = {};
      for (const row of sermonRes.data ?? []) sermons[row.sunday] = row as Sermon;
      return { sermons, teachers: (teacherRes.data ?? []).map((t) => t.name as string) };
    },
    async save(s) {
      if (isEmpty(s)) {
        const { error } = await db.from('sermons').delete().eq('sunday', s.sunday);
        if (error) throw error;
        return;
      }
      const { error } = await db
        .from('sermons')
        .upsert({ ...s, updated_at: new Date().toISOString() }, { onConflict: 'sunday' });
      if (error) throw error;
    },
    async addTeacher(name) {
      const { error } = await db.from('teachers').insert({ name });
      if (error) throw error;
    },
    async removeTeacher(name) {
      const { error } = await db.from('teachers').delete().eq('name', name);
      if (error) throw error;
    },
  };
}

// ---------- Demo mode (browser storage) ----------
const SERMONS_KEY = 'urf.sermons';
const TEACHERS_KEY = 'urf.teachers';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function localBackend(): Backend {
  const seedSermons: Sermons = {};
  for (const s of SEED_SERMONS) seedSermons[s.sunday] = s;
  return {
    mode: 'local',
    async load() {
      return {
        sermons: readJSON<Sermons>(SERMONS_KEY, seedSermons),
        teachers: readJSON<string[]>(TEACHERS_KEY, SEED_TEACHERS),
      };
    },
    async save(s) {
      const all = readJSON<Sermons>(SERMONS_KEY, seedSermons);
      if (isEmpty(s)) delete all[s.sunday];
      else all[s.sunday] = s;
      localStorage.setItem(SERMONS_KEY, JSON.stringify(all));
    },
    async addTeacher(name) {
      const list = readJSON<string[]>(TEACHERS_KEY, SEED_TEACHERS);
      if (!list.includes(name)) localStorage.setItem(TEACHERS_KEY, JSON.stringify([...list, name]));
    },
    async removeTeacher(name) {
      const list = readJSON<string[]>(TEACHERS_KEY, SEED_TEACHERS);
      localStorage.setItem(TEACHERS_KEY, JSON.stringify(list.filter((t) => t !== name)));
    },
  };
}

export const backend: Backend = supabase ? supabaseBackend() : localBackend();
