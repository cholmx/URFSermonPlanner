-- Starting data carried over from SERMON_SCHEDULE.xlsx
insert into public.teachers (name) values
  ('Josh'),
  ('Jared'),
  ('Weslie'),
  ('Beth')
on conflict (name) do nothing;

insert into public.sermons (sunday, teacher, series, topic) values
  ('2025-06-01', '', 'Psalms', ''),
  ('2025-06-08', '', 'Psalms', ''),
  ('2025-06-15', '', 'Psalms', ''),
  ('2025-06-22', 'Josh', 'Psalms', 'Psalm 8 (human dignity), Psalm 19 (God''s revelation), or Psalm 139 (God''s intimate knowledge)'),
  ('2025-06-29', '', 'Psalms', ''),
  ('2025-07-06', 'Jared', 'Psalms', 'Psalm 23 (the shepherd psalm), Psalm 34 (taste and see), or Psalm 37 (don''t fret)'),
  ('2025-07-13', '', 'Psalms', ''),
  ('2025-07-20', '', 'Psalms', ''),
  ('2025-07-27', 'Weslie', 'Psalms', 'Psalm 46 (God our refuge), Psalm 84 (longing for worship), or Psalm 103 (bless the Lord)'),
  ('2025-08-03', '', 'Psalms', ''),
  ('2025-08-10', '', 'Psalms', ''),
  ('2025-08-17', 'Beth', 'Psalms', 'Psalm 91 (divine protection), Psalm 126 (sorrow to joy), or Psalm 133 (unity)'),
  ('2025-08-24', '', 'Psalms', ''),
  ('2025-08-31', '', 'Psalms', 'Series finale (we can discuss options for this one)'),
  ('2025-09-07', '', 'Emotional Health', ''),
  ('2025-09-14', '', 'Emotional Health', ''),
  ('2025-09-21', '', 'Emotional Health', ''),
  ('2025-09-28', '', 'Emotional Health', ''),
  ('2025-10-05', '', 'Emotional Health', ''),
  ('2025-10-12', '', 'Emotional Health', ''),
  ('2025-10-19', '', 'Emotional Health', ''),
  ('2025-10-26', '', 'Emotional Health', ''),
  ('2025-11-02', '', 'Emotional Health', '')
on conflict (sunday) do update set teacher = excluded.teacher, series = excluded.series, topic = excluded.topic;
