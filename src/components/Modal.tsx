import type { ReactNode } from 'react';

type Props = { title: string; onClose: () => void; children: ReactNode };

export default function Modal({ title, onClose, children }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 text-ink shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-ink/60 hover:text-ink" aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
