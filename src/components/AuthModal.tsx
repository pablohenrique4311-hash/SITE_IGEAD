import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChurchLogo } from './ChurchLogo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    signIn,
    signUp
  } = useAuth();

  // Estados dos formulários
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

  // Limpa mensagens e formulários ao abrir ou mudar de aba
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!isAuthModalOpen) {
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [authModalTab, isAuthModalOpen]);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // Validação simples de email
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Submissão de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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
      setSuccessMessage('Login realizado com sucesso! Bem-vindo(a).');
      setTimeout(() => {
        closeAuthModal();
      }, 1000);
    }
  };

  // Submissão de Cadastro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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
        'Conta criada com sucesso! Caso o Supabase exija confirmação, verifique sua caixa de entrada.'
      );
      setTimeout(() => {
        closeAuthModal();
      }, 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-200">
        {/* Faixa decorativa superior com gradiente sutil dourado */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Fechar janela"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Cabeçalho com Logo IGEAD-MT */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <ChurchLogo size="md" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Comunidade IGEAD-MT</span>
            </div>
            <h2
              id="auth-modal-title"
              className="text-2xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50 tracking-tight"
            >
              {authModalTab === 'login' ? 'Entrar na sua Conta' : 'Criar Nova Conta'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {authModalTab === 'login'
                ? 'Acesse a área de membros, pedidos de oração e estudos bíblicos'
                : 'Cadastre-se para participar ativamente da comunidade da igreja'}
            </p>
          </div>

          {/* Abas Alternáveis: Entrar / Criar Conta */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 mb-6">
            <button
              type="button"
              onClick={() => setAuthModalTab('login')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authModalTab === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthModalTab('register')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authModalTab === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Conta</span>
            </button>
          </div>

          {/* Mensagens de Feedback */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* FORMULÁRIO 1: LOGIN */}
          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Endereço de E-mail
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Senha
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar na Minha Conta</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModalTab('register')}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                >
                  Ainda não tem conta? <strong className="underline font-bold">Cadastre-se gratuitamente</strong>
                </button>
              </div>
            </form>
          ) : (
            /* FORMULÁRIO 2: CADASTRO */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    autoComplete="name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Endereço de E-mail
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Senha (mín. 6 dígitos)
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      autoComplete="new-password"
                      className="w-full pl-9 pr-9 py-2.5 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      autoComplete="new-password"
                      className="w-full pl-9 pr-9 py-2.5 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Criando sua conta...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Concluir Cadastro</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModalTab('login')}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                >
                  Já possui uma conta cadastrada? <strong className="underline font-bold">Entrar</strong>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
