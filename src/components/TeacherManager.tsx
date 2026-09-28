import { useState } from 'react';
import Modal from './Modal';

type Props = {
  teachers: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onClose: () => void;
};

export default function TeacherManager({ teachers, onAdd, onRemove, onClose }: Props) {
  const [name, setName] = useState('');

  function add(e: React.FormEvent) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean || teachers.some((t) => t.toLowerCase() === clean.toLowerCase())) return;
    onAdd(clean);
    setName('');
  }

  return (
    <Modal title="Teachers" onClose={onClose}>
      <ul className="mb-4 max-h-64 divide-y divide-ink/10 overflow-y-auto">
        {teachers.length === 0 && <li className="py-2 text-ink/60">No teachers yet.</li>}
        {teachers.map((t) => (
          <li key={t} className="flex items-center justify-between py-2">
            <span>{t}</span>
            <button onClick={() => onRemove(t)} className="text-sm text-red-700 hover:underline">
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New teacher name"
          className="min-w-0 flex-1 rounded border border-ink/30 px-3 py-2"
        />
        <button type="submit" className="rounded bg-ember px-4 py-2 text-white hover:brightness-95">
          Add
        </button>
      </form>
      <p className="mt-3 text-xs text-ink/60">
        Removing a teacher from this list keeps their name on any Sundays already assigned to them.
      </p>
    </Modal>
  );
}
