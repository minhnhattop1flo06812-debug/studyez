import { createClient } from '@supabase/supabase-js';

const projectUrl = import.meta.env.VITE_SUPABASE_URL ||
  document.querySelector('meta[name="studyez-supabase-url"]')?.content.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  document.querySelector('meta[name="studyez-supabase-publishable-key"]')?.content.trim();

export const isWebOrigin = ['http:', 'https:'].includes(window.location.protocol);
export const supabase = isWebOrigin && projectUrl && publishableKey
  ? createClient(projectUrl, publishableKey, { auth: { flowType: 'pkce' } })
  : null;

export function accountRedirect() {
  return window.location.origin + window.location.pathname;
}

export async function loadProgress(userId, signal) {
  const { data, error } = await supabase
    .from('studyez_progress')
    .select('data')
    .eq('user_id', userId)
    .abortSignal(signal)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? {};
}

function changedEntries(previous, next) {
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => !Object.is(previous[key], value))
  );
}

export async function saveProgress(userId, previous, next) {
  const {
    chapterMcqAnswers,
    chapterEssayDrafts,
    usedTrials,
    ...fields
  } = next;
  const { error } = await supabase.rpc('studyez_save_progress', {
    p_user_id: userId,
    p_fields: changedEntries(previous, fields),
    p_answers: changedEntries(previous.chapterMcqAnswers, chapterMcqAnswers),
    p_drafts: changedEntries(previous.chapterEssayDrafts, chapterEssayDrafts),
    p_trials: changedEntries(previous.usedTrials, usedTrials),
  });
  if (error) throw error;
}
