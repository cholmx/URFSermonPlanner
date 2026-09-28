# URF Sermon Planner

A web app for scheduling sermons. It replaces the SERMON_SCHEDULE spreadsheet.

- One row per Sunday, with Teacher, Series, Topic, and an automatic Special Sunday label
  (Easter, Palm Sunday, Pentecost, Mother's Day, Father's Day, Memorial Day weekend, Labor Day weekend,
  Independence Day, Thanksgiving Sunday, Advent 1 to 4, Christmas Eve, Christmas Day, New Year's Day).
- Rolling window: the page always shows the 1st of last month through one year from today.
  Turn on "Show all dates" to see everything back to January 2025.
- The next upcoming Sunday is highlighted in yellow. On a Sunday, that day stays highlighted.
- Teacher dropdown fed by a list you manage from the Teachers button.
- Anyone with the link can view. Only signed-in users can edit.

Built with Vite, React, TypeScript, Tailwind CSS, and Supabase.

## Try it without a database

```
npm install
npm run dev
```

With no Supabase keys the app runs in demo mode. Your existing entries from the spreadsheet are loaded and
changes are saved in that browser only.

## Connect Supabase (shared data)

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
   The seed file carries over the teachers, series, and topics from the spreadsheet.
3. Go to Authentication, then Users, and add a user (your email and a password) for editing.
   Then go to Authentication, then Sign In / Providers, and turn off "Allow new users to sign up"
   so only people you add can edit.
4. Copy `.env.example` to `.env` and fill in the two values from Project Settings, then API:

   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

5. `npm run dev`, click "Sign in to edit", and use the user from step 3.

The anon key is meant to be public. Row level security in `schema.sql` is what limits editing to signed-in users.

## Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages). Use `npm run build` as the build command,
`dist` as the output folder, and add the two `VITE_` variables in the host's environment settings.

## Tests

```
npm test
```

Covers the Easter calculation, the Special Sunday labels, the rolling window, and the next Sunday logic.

## Project layout

```
src/lib/dates.ts       Sundays, rolling window, Easter, Special Sunday rules
src/lib/store.ts       Supabase backend and the demo-mode backend
src/lib/seed.ts        Starting data from the spreadsheet (demo mode)
src/components/        Schedule table, teacher manager, sign-in form
supabase/schema.sql    Tables and row level security
supabase/seed.sql      Starting data from the spreadsheet
```

## Notes

- Dates are generated from the calendar, not stored, so the schedule never runs out. Only rows that have a
  teacher, series, or topic are saved in the database.
- To change the window, edit `MONTHS_BEHIND` and `MONTHS_AHEAD` at the top of `src/App.tsx`.
- The Special Sunday rules are in `specialSunday()` in `src/lib/dates.ts` if you want to add dates.
