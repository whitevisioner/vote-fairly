## Voting Platform for Electing Representatives

A flexible voting platform that works for student/club, company/team, or public/community elections — with multi-admin management, candidate profiles, multi-position ballots, and a live results dashboard.

### Roles

- **Super Admin** — first registered user; can promote other admins.
- **Admin** — creates elections, adds candidates, manages voter list, issues voting codes.
- **Voter** — signs up, gets verified, casts ballot.

### Voter verification (3-layer combo)

A voter can only cast a vote after passing all three checks:
1. **Email OTP confirmation** at signup (Lovable Cloud auth).
2. **Admin-approved voter list** — voter's email must appear on the election's allowed list.
3. **One-time voting code** — admin issues a unique code per voter per election; voter enters it before the ballot opens.

### Pages

- **Landing** — explains the platform, "Sign in" / "Sign up" CTAs.
- **Sign up / Log in** — email + password with email OTP verification.
- **Voter dashboard** — lists elections the voter is approved for, with status (upcoming / open / voted / closed).
- **Voting code entry** — voter pastes their one-time code to unlock the ballot.
- **Ballot page** — shows all positions in the election; for each position, candidate cards (photo, name, bio, manifesto). Voter selects one candidate per position, reviews, submits.
- **Confirmation page** — vote receipt with timestamp.
- **Live results dashboard** — public per-election page with real-time bar charts per position, total votes cast, turnout %.
- **Admin console**
  - Elections list (create / edit / open / close)
  - Election editor: title, description, start/end dates, positions (e.g. President, Secretary)
  - Candidates manager: add/edit candidate per position with photo upload, bio, manifesto
  - Voter list: paste/upload approved emails, generate & export voting codes
  - Admins manager: invite/promote other admins
  - Audit log: who voted, when, for whom (since votes are auditable)

### Data model

- `profiles` — user info (name, avatar).
- `user_roles` — `admin` / `voter` (separate table, enum-based, with `has_role()` security definer).
- `elections` — title, description, status, start_at, end_at, created_by.
- `positions` — election_id, title, description, order.
- `candidates` — position_id, name, photo_url, bio, manifesto.
- `voter_list` — election_id, email, voting_code (hashed), code_used, approved.
- `votes` — election_id, position_id, candidate_id, voter_id, created_at (auditable: tied to voter).
- Unique constraint: one vote per (voter, position).

### Live results

Realtime subscription on the `votes` table → results page updates instantly as votes come in. Admin can choose per-election whether results are visible during voting or only after close (default: live).

### Design

Clean civic blue theme — primary deep blue (#1E40AF range), white surfaces, subtle borders, generous spacing, sans-serif (Inter). Trustworthy and government-like with clear status badges and progress bars for results.

### Technical notes

- **Lovable Cloud** for auth (email+password with OTP), Postgres, RLS, realtime, and storage (candidate photos).
- **RLS policies**: voters can only read elections they're approved for and only insert their own votes; admins manage everything via `has_role(uid,'admin')`.
- **Voting codes** stored as hashes; verified server-side via an edge function that checks email match, code validity, and not-yet-used, then marks code consumed.
- **Vote submission** via edge function to enforce: election open, voter approved, code consumed, no duplicate vote per position — all in one transaction.
- **Charts** with Recharts; realtime via Supabase channels.
- React Router routes for `/`, `/auth`, `/dashboard`, `/election/:id/code`, `/election/:id/vote`, `/election/:id/results`, `/admin/*`.

### Build order

1. Auth (email + OTP) and role system.
2. Admin election + position + candidate CRUD with photo upload.
3. Voter list + voting code generation/export.
4. Voter dashboard + code entry + ballot + submit.
5. Live results dashboard with realtime charts.
6. Audit log + admin management.
