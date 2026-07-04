# Database production operations

Run migrations in timestamp order. Before any production push, create a dated,
encrypted backup outside the repository and verify that it can be restored in a
non-production project.

## Migration runbook

| Migration                                      | Backup before deploy       | Rollback                                                                                     |
| ---------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| `202606280001_initial_schema.sql`              | Full schema and data dump. | Destructive: restore the dump, or drop `todos`, `courses`, `profiles`, then `course_status`. |
| `202606290001_auth_profile_trigger.sql`        | Dump `auth` and `public`.  | Drop `on_auth_user_created`, then `handle_new_user()`; retain created profiles.              |
| `202606290002_public_portfolios.sql`           | Dump the `public` schema.  | Drop both public-read policies; no data rollback is required.                                |
| `202607010001_alignment_history_and_order.sql` | Dump `public.todos`.       | Drop its indexes and columns; restore the dump if completion history is needed.              |
| `202607010002_auth_data_integrity.sql`         | Dump `auth` and `public`.  | Restore the prior `handle_new_user()` body; retain all profiles.                             |
| `202607010003_task_date_ranges.sql`            | Dump `public.todos`.       | Drop its index and constraint, then `start_date`; existing due dates remain intact.          |

Suggested commands:

```bash
supabase db dump --linked --schema auth,public -f backups/pre-deploy.sql
supabase db push --linked --dry-run
supabase db push --linked
```

Never commit the `backups/` directory. After a deploy, run the database tests
against staging before promoting the same migration set to production.

## Clean-project and RLS verification

With Docker running and the Supabase CLI installed:

```bash
supabase start
supabase db reset
supabase test db
supabase db lint --local --level error
```

`db reset` proves the complete migration chain on a clean local Supabase project.
The pgTAP suite proves profile creation, private course/todo isolation, and the
read-only public portfolio exception.
