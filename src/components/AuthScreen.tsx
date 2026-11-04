import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChurchLogo } from './ChurchLogo';
import { ThemeToggle } from './ThemeToggle';
import { CHURCH_INFO } from '../constants/churchInfo';

interface AuthScreenProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ isDark, onToggleTheme }) => {
  const { signIn, signUp } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleTabChange = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Desfoca o campo ativo no mobile para fechar o teclado virtual do iOS e prevenir zoom retido
    if (document.activeElement && 'blur' in document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu endereço de e-mail.');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage('Por favor, informe um formato de e-mail válido.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor, informe sua senha.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage('Acesso autorizado! Carregando aplicativo...');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Desfoca o campo ativo no mobile para fechar o teclado virtual do iOS e prevenir zoom retido
    if (document.activeElement && 'blur' in document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    if (!fullName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (fullName.trim().split(' ').length < 2) {
      setErrorMessage('Por favor, informe seu nome e sobrenome.');
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere com a senha informada.');
      return;
    }

    setIsSubmitting(true);
    const { error, user } = await signUp(fullName, email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      if (user && user.identities && user.identities.length === 0) {
        setErrorMessage('Este e-mail já está em uso por outro membro. Tente fazer login.');
        return;
      }

      setSuccessMessage(
        'Conta criada com sucesso! Caso a confirmação de e-mail esteja ativada, verifique sua caixa de entrada.'
      );
    }
  };

  const fieldClass = 'w-full h-[52px] pl-11 pr-12 rounded-lg border border-slate-200 bg-slate-50 text-base text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white';

  return (
    <main className="min-h-dvh grid lg:grid-cols-[3fr_2fr] bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
      <section className="relative hidden lg:block overflow-hidden bg-emerald-950" aria-label="Paisagem de montanhas ao amanhecer">
        <img
          src={`${import.meta.env.BASE_URL}assets/login-landscape.jpg`}
          alt="Montanhas cobertas por névoa à luz do amanhecer"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 xl:p-16 text-white">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Fé que nos une</p>
          <blockquote className="max-w-xl font-serif-reading text-3xl xl:text-4xl leading-snug">“Até aqui nos ajudou o Senhor.”</blockquote>
          <p className="mt-4 text-sm text-white/70">1 Samuel 7:12</p>
          <div className="mt-10 h-px w-12 bg-emerald-300/60" />
          <p className="mt-6 text-sm text-white/75">Igreja Geração Eleita · Mato Grosso</p>
        </div>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center px-6 py-24 sm:px-12 lg:px-10 xl:px-16">
        <div className="absolute right-5 top-5 sm:right-8 sm:top-7">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
        <div className="w-full max-w-96">
          <div className="mb-9 flex items-center justify-center gap-3">
            <ChurchLogo size="lg" />
            <div>
              <p className="text-xl font-bold tracking-tight">IGEAD-MT</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">Igreja Geração Eleita</p>
            </div>
          </div>
          <div className="mb-9 text-center">
            <h1 className="text-[30px] font-bold tracking-tight">{tab === 'login' ? 'Bem-vindo de volta' : 'Faça parte da comunidade'}</h1>
            <p className="mt-3 text-base leading-7 text-slate-500 dark:text-zinc-400">
              {tab === 'login' ? 'Entre com suas credenciais para acessar o portal da nossa igreja.' : 'Crie sua conta e caminhe conosco na fé.'}
            </p>
          </div>

          {errorMessage && (
            <div role="alert" className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><p>{errorMessage}</p>
            </div>
          )}
          {successMessage && (
            <div role="status" className="mb-6 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><p>{successMessage}</p>
            </div>
          )}

          <form onSubmit={tab === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-6" aria-label={tab === 'login' ? 'Entrar na conta' : 'Criar conta'}>
            <fieldset disabled={isSubmitting} className="space-y-6 disabled:opacity-70">
              {tab === 'register' && (
                <div>
                  <label htmlFor="auth-name" className="mb-2 block text-sm font-medium">Nome completo</label>
                  <div className="relative flex items-center">
                    <UserIcon className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-slate-400" />
                    <input id="auth-name" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome e sobrenome" className={fieldClass} />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="auth-email" className="mb-2 block text-sm font-medium">E-mail</label>
                <div className="relative flex items-center">
                  <Mail className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-slate-400" />
                  <input id="auth-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com.br" className={fieldClass} />
                </div>
              </div>
              <div>
                <label htmlFor="auth-password" className="mb-2 block text-sm font-medium">Senha</label>
                <div className="relative flex items-center">
                  <Lock className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-slate-400" />
                  <input id="auth-password" type={showPassword ? 'text' : 'password'} required minLength={tab === 'register' ? 6 : undefined} autoComplete={tab === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={fieldClass} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} className="absolute right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded text-slate-400 hover:text-emerald-600 focus-visible:outline-2 focus-visible:outline-emerald-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {tab === 'register' && (
                <div>
                  <label htmlFor="auth-confirm" className="mb-2 block text-sm font-medium">Confirmar senha</label>
                  <div className="relative flex items-center">
                    <Lock className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-slate-400" />
                    <input id="auth-confirm" type={showConfirmPassword ? 'text' : 'password'} required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita sua senha" className={fieldClass} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} aria-pressed={showConfirmPassword} className="absolute right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded text-slate-400 hover:text-emerald-600 focus-visible:outline-2 focus-visible:outline-emerald-600">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">Use no mínimo 6 caracteres.</p>
                </div>
              )}
              <button type="submit" className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#36956e] px-4 text-base font-semibold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 disabled:cursor-wait">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Aguarde...' : tab === 'login' ? 'Entrar no portal' : 'Criar minha conta'}
              </button>
            </fieldset>
          </form>
          <p className="mt-10 text-center text-sm leading-7 text-slate-600 dark:text-zinc-400">
            {tab === 'login' ? 'Ainda não possui uma conta? ' : 'Já possui uma conta? '}
            <button type="button" disabled={isSubmitting} onClick={() => handleTabChange(tab === 'login' ? 'register' : 'login')} className="cursor-pointer rounded font-semibold text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-emerald-400 disabled:opacity-60">
              {tab === 'login' ? 'Cadastre-se' : 'Entre aqui'}
            </button>
          </p>
          <a href={`https://wa.me/${CHURCH_INFO.phoneClean}?text=${encodeURIComponent('A paz do Senhor! Preciso de ajuda para acessar minha conta no portal IGEAD.')}`} target="_blank" rel="noopener noreferrer" className="mx-auto mt-6 flex w-fit items-center gap-1.5 rounded text-xs text-slate-500 hover:text-emerald-700 dark:text-zinc-400">
            <MessageCircle size={14} />Precisa de ajuda para acessar?
          </a>
        </div>
      </section>
    </main>
  );
};
