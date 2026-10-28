-- Formivo: shared helper functions.
-- Applied by Supabase (see docs/database.md for environment assumptions).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
