import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
import { accountRedirect, isWebOrigin, loadProgress, supabase } from './account';

export function AccountScreen({ children }) {
  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 px-4 py-8 text-slate-900">
      <section className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <div className="flex flex-col justify-between gap-8 bg-blue-950 p-7 text-white sm:p-10">
          <div className="flex items-center gap-3 text-xl font-black">
            <GraduationCap className="h-8 w-8 text-blue-200" aria-hidden="true" />
            StudyEz
          </div>
          <div>
            <h2 className="text-2xl font-black leading-tight sm:text-3xl">Luyện bài tập và đề thi lớp 6–9</h2>
            <p className="mt-3 text-sm leading-relaxed text-blue-100">
              Đăng nhập để lưu bài đã làm, điểm XP và chuỗi học tập vào tài khoản của bạn.
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-10">{children}</div>
      </section>
    </main>
  );
}

const inputClass = 'mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200';
const providerClass = 'flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:opacity-50';
const primaryClass = 'w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50';

function AuthForm() {
  const [register, setRegister] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(null);
  const [callbackError] = useState(() => {
    const { search, hash } = window.location;
    return new URLSearchParams(search).has('error') || new URLSearchParams(hash.slice(1)).has('error');
  });

  function switchMode(next) {
    setRegister(next);
    setNotice(null);
  }

  async function runAuth(action) {
    setPending(true);
    setNotice(null);
    try {
      await action();
    } catch (error) {
      console.warn('StudyEz auth:', error.code || error.name);
      const messages = {
        invalid_credentials: 'Email hoặc mật khẩu chưa đúng.',
        email_not_confirmed: 'Mở email xác nhận tài khoản trước khi đăng nhập.',
        weak_password: 'Mật khẩu chưa đáp ứng yêu cầu của hệ thống.',
        over_email_send_rate_limit: 'Hệ thống đang giới hạn số email gửi đi. Hãy thử lại sau.',
      };
      setNotice({ error: true, text: messages[error.code] || 'Chưa thể xác thực. Kiểm tra cấu hình hoặc thử lại.' });
    } finally {
      setPending(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const credentials = {
      email: form.get('email').trim(),
      password: form.get('password'),
    };
    void runAuth(async () => {
      if (register) {
        const { data, error } = await supabase.auth.signUp({
          ...credentials,
          options: {
            emailRedirectTo: accountRedirect(),
            data: { nickname: form.get('nickname').trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice({ text: 'Kiểm tra hộp thư để xác nhận tài khoản, rồi quay lại đăng nhập.' });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
      }
    });
  }

  function continueWith(provider) {
    void runAuth(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: accountRedirect(),
          ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
        },
      });
      if (error) throw error;
    });
  }

  const unavailable = !supabase || pending;
  return (
    <AccountScreen>
      <h1 className="text-2xl font-black">{register ? 'Đăng ký StudyEz' : 'Đăng nhập StudyEz'}</h1>
      <div className="my-5 flex gap-2 rounded-xl bg-slate-100 p-1">
        {[false, true].map((mode) => (
          <button key={String(mode)} type="button" disabled={pending}
            onClick={() => switchMode(mode)} aria-pressed={register === mode}
            className={`flex-1 rounded-lg px-2 py-2 text-sm font-bold ${register === mode ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600'}`}>
            {mode ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        ))}
      </div>
      {!supabase && (
        <p role="status" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
          {isWebOrigin
            ? 'Trang này chưa kết nối hệ thống tài khoản.'
            : 'Đây là tệp xem trước. Đăng nhập cần bản web đã kết nối hệ thống tài khoản.'}
        </p>
      )}
      {supabase && callbackError && !notice && (
        <p role="alert" className="mb-4 text-sm text-rose-700">Phiên xác thực chưa hoàn tất. Hãy thử đăng nhập lại.</p>
      )}
      <div className="space-y-2">
        <button type="button" className={providerClass} disabled={unavailable} onClick={() => continueWith('google')}>
          <span aria-hidden="true" className="text-lg font-black leading-none text-blue-700">G</span>
          Tiếp tục với Google
        </button>
        <button type="button" className={providerClass} disabled={unavailable} onClick={() => continueWith('facebook')}>
          <span aria-hidden="true" className="text-lg font-black leading-none text-blue-700">f</span>
          Tiếp tục với Facebook
        </button>
      </div>
      <div className="my-4 flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-slate-200" /> Hoặc dùng email <span className="h-px flex-1 bg-slate-200" />
      </div>
      <form onSubmit={submit} className="space-y-3" key={String(register)}>
        {register && (
          <label className="block text-sm font-semibold">Tên hiển thị
            <input name="nickname" autoComplete="nickname" maxLength={60} className={inputClass} required disabled={unavailable} />
          </label>
        )}
        <label className="block text-sm font-semibold">Email
          <input name="email" type="email" autoComplete="email" className={inputClass} required disabled={unavailable} />
        </label>
        <label className="block text-sm font-semibold">Mật khẩu
          <input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 8 : undefined} className={inputClass} required disabled={unavailable} />
        </label>
        {notice && <p role={notice.error ? 'alert' : 'status'} className={`text-sm ${notice.error ? 'text-rose-700' : 'text-emerald-800'}`}>{notice.text}</p>}
        <button type="submit" className={primaryClass} disabled={unavailable}>
          {pending ? 'Đang xác thực…' : register ? 'Tạo tài khoản' : 'Đăng nhập bằng email'}
        </button>
      </form>
    </AccountScreen>
  );
}

function AccountProgress({ user, children }) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loadProgress(user.id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ data });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.warn('StudyEz load:', error.code || error.name);
          setResult({ error: true });
        }
      });
    return () => controller.abort();
  }, [user.id, attempt]);

  if (!result?.data) {
    return (
      <AccountScreen>
        <BookOpen className="mb-3 h-7 w-7 text-blue-700" aria-hidden="true" />
        <h1 className="text-xl font-black">{result?.error ? 'Chưa tải được tiến độ' : 'Đang tải tiến độ học tập…'}</h1>
        {result?.error && (
          <div className="mt-4 space-y-3">
            <button className={primaryClass} onClick={() => { setResult(null); setAttempt((value) => value + 1); }}>Thử lại</button>
            <button className={providerClass} onClick={async () => {
              const { error } = await supabase.auth.signOut({ scope: 'local' });
              if (error) setResult({ error: true, signOutError: true });
            }}>Đăng xuất</button>
            {result.signOutError && <p role="alert" className="text-sm text-rose-700">Chưa đăng xuất được. Hãy thử lại.</p>}
          </div>
        )}
      </AccountScreen>
    );
  }

  return children(user, result.data);
}

export default function AccountGate({ children }) {
  const [session, setSession] = useState(supabase ? undefined : null);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <AccountScreen><p role="status" className="text-sm font-bold">Đang kiểm tra phiên đăng nhập…</p></AccountScreen>;
  }
  if (!session?.user) return <AuthForm />;
  return <AccountProgress key={session.user.id} user={session.user}>{children}</AccountProgress>;
}
