import { useCallback, useEffect, useRef, useState } from 'react';
import { saveProgress, supabase } from './account';

export function useProgressSave(userId, snapshot) {
  const saved = useRef(snapshot);
  const latest = useRef(snapshot);
  const task = useRef(null);
  const [status, setStatus] = useState('saved');

  const flush = useCallback(() => {
    if (task.current) return task.current;
    if (saved.current === latest.current) return Promise.resolve(true);

    setStatus('saving');
    const work = Promise.resolve().then(async () => {
      try {
        while (saved.current !== latest.current) {
          const next = latest.current;
          await saveProgress(userId, saved.current, next);
          saved.current = next;
        }
        setStatus('saved');
        return true;
      } catch (error) {
        console.warn('StudyEz save:', error.code || error.name);
        setStatus('error');
        return false;
      } finally {
        task.current = null;
      }
    });
    task.current = work;
    return work;
  }, [userId]);

  useEffect(() => {
    latest.current = snapshot;
    void flush();
  }, [snapshot, flush]);

  useEffect(() => {
    const retry = () => { void flush(); };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [flush]);

  const signOut = async () => {
    if (!(await flush())) return false;
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return !error;
  };

  return { status, retry: flush, signOut };
}
