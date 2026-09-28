import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { monthLabel, specialSunday, toISO } from '../lib/dates';
import type { Sermon, Sermons } from '../lib/types';

type Props = {
  dates: Date[];
  sermons: Sermons;
  teachers: string[];
  seriesOptions: string[];
  canEdit: boolean;
  nextISO: string;
  onSave: (s: Sermon) => void;
};

export default function ScheduleTable({ dates, sermons, teachers, seriesOptions, canEdit, nextISO, onSave }: Props) {
  return (
    <div className="max-h-[calc(100vh-11rem)] overflow-auto rounded-md">
      <datalist id="series-options">
        {seriesOptions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <table className="w-full min-w-[960px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {['', 'Date', 'Teacher', 'Series', 'Topic', 'Special Sunday'].map((h, i) => (
              <th key={i} className="sticky top-0 z-10 bg-ink px-3 py-3 text-left font-normal text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((d, i) => {
            const iso = toISO(d);
            const prev = i > 0 ? dates[i - 1] : null;
            const showMonth = !prev || prev.getMonth() !== d.getMonth();
            return (
              <Row
                key={iso}
                date={d}
                iso={iso}
                showMonth={showMonth}
                showYear={showMonth && (d.getMonth() === 0 || i === 0)}
                sermon={sermons[iso]}
                teachers={teachers}
                canEdit={canEdit}
                isNext={iso === nextISO}
                isPast={iso < nextISO}
                onSave={onSave}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type RowProps = {
  date: Date;
  iso: string;
  showMonth: boolean;
  showYear: boolean;
  sermon?: Sermon;
  teachers: string[];
  canEdit: boolean;
  isNext: boolean;
  isPast: boolean;
  onSave: (s: Sermon) => void;
};

const Row = memo(function Row({ date, iso, showMonth, showYear, sermon, teachers, canEdit, isNext, isPast, onSave }: RowProps) {
  const [teacher, setTeacher] = useState(sermon?.teacher ?? '');
  const [series, setSeries] = useState(sermon?.series ?? '');
  const [topic, setTopic] = useState(sermon?.topic ?? '');
  const topicRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTeacher(sermon?.teacher ?? '');
    setSeries(sermon?.series ?? '');
    setTopic(sermon?.topic ?? '');
  }, [sermon?.teacher, sermon?.series, sermon?.topic]);

  useLayoutEffect(() => {
    const el = topicRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [topic]);

  const commit = (patch: Partial<Sermon>) => {
    const next: Sermon = {
      sunday: iso,
      teacher: sermon?.teacher ?? '',
      series: sermon?.series ?? '',
      topic: sermon?.topic ?? '',
      ...patch,
    };
    const changed =
      next.teacher !== (sermon?.teacher ?? '') ||
      next.series !== (sermon?.series ?? '') ||
      next.topic !== (sermon?.topic ?? '');
    if (changed) onSave(next);
  };

  const teacherOptions = teacher && !teachers.includes(teacher) ? [...teachers, teacher] : teachers;
  const special = specialSunday(date);
  const cell = `border-b border-ink px-3 py-2 align-top ${isNext ? 'bg-butter' : 'bg-white'} ${
    isPast ? 'text-ink/60' : 'text-ink'
  }`;
  const field = 'w-full bg-transparent outline-none focus:bg-black/5 rounded px-1 py-0.5';

  return (
    <tr id={isNext ? 'next-sunday' : undefined}>
      <td className={`w-24 border-b border-ink px-3 py-2 align-top ${showMonth ? 'bg-mint text-ink' : 'bg-ink'}`}>
        {showMonth && (
          <div>
            {monthLabel(date)}
            {showYear && <div className="text-xs text-ink/70">{date.getFullYear()}</div>}
          </div>
        )}
      </td>
      <td className={`w-20 border-b border-ink px-3 py-2 align-top ${isNext ? 'bg-butter' : 'bg-ember'} text-ink`}>
        {date.getMonth() + 1}/{date.getDate()}
      </td>
      <td className={`${cell} w-40`}>
        {canEdit ? (
          <select
            value={teacher}
            onChange={(e) => {
              setTeacher(e.target.value);
              commit({ teacher: e.target.value });
            }}
            className={field}
            aria-label={`Teacher for ${iso}`}
          >
            <option value=""></option>
            {teacherOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        ) : (
          teacher
        )}
      </td>
      <td className={`${cell} w-56`}>
        {canEdit ? (
          <input
            list="series-options"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            onBlur={() => commit({ series: series.trim() })}
            className={field}
            aria-label={`Series for ${iso}`}
          />
        ) : (
          series
        )}
      </td>
      <td className={cell}>
        {canEdit ? (
          <textarea
            ref={topicRef}
            rows={1}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onBlur={() => commit({ topic: topic.trim() })}
            className={`${field} resize-none overflow-hidden`}
            aria-label={`Topic for ${iso}`}
          />
        ) : (
          topic
        )}
      </td>
      <td className={`${cell} w-56`}>{special}</td>
    </tr>
  );
});
