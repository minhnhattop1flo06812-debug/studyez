begin;

create table if not exists public.studyez_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object')
);

alter table public.studyez_progress enable row level security;

revoke all on public.studyez_progress from anon, authenticated;
grant select, insert, update on public.studyez_progress to authenticated;

drop policy if exists studyez_select_own on public.studyez_progress;
create policy studyez_select_own on public.studyez_progress for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists studyez_insert_own on public.studyez_progress;
create policy studyez_insert_own on public.studyez_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists studyez_update_own on public.studyez_progress;
create policy studyez_update_own on public.studyez_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.studyez_save_progress(
  p_user_id uuid,
  p_fields jsonb,
  p_answers jsonb,
  p_drafts jsonb,
  p_trials jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null or p_user_id is distinct from auth.uid() then
    raise exception 'Account has changed' using errcode = '42501';
  end if;

  insert into public.studyez_progress as progress (user_id, data)
  values (p_user_id, p_fields || jsonb_build_object(
    'chapterMcqAnswers', p_answers,
    'chapterEssayDrafts', p_drafts,
    'usedTrials', p_trials
  ))
  on conflict (user_id) do update
  set data = progress.data || p_fields || jsonb_build_object(
    'chapterMcqAnswers', coalesce(progress.data->'chapterMcqAnswers', '{}'::jsonb) || p_answers,
    'chapterEssayDrafts', coalesce(progress.data->'chapterEssayDrafts', '{}'::jsonb) || p_drafts,
    'usedTrials', coalesce(progress.data->'usedTrials', '{}'::jsonb) || p_trials
  );
end;
$$;

revoke all on function public.studyez_save_progress(uuid, jsonb, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.studyez_save_progress(uuid, jsonb, jsonb, jsonb, jsonb) to authenticated;

commit;
