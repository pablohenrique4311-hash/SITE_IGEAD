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
  Sparkles,
  LogIn,
  UserPlus,
  ShieldCheck,
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

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Barra Superior Discreta com Alternância de Tema */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ChurchLogo size="sm" />
          <div className="flex flex-col">
            <span className="font-cinzel font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
              IGEAD-MT
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
              Igreja Geração Eleita • Mato Grosso
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Conteúdo Central: Card Elegante de Autenticação */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-200">
          {/* Faixa decorativa superior com gradiente sutil dourado */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          <div className="p-6 sm:p-8">
            {/* Logotipo e Identificação */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <ChurchLogo size="md" className="shadow-xs" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Portal da Comunidade</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50 tracking-tight">
                {tab === 'login' ? 'Entrar no Aplicativo' : 'Cadastro de Membro'}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                {tab === 'login'
                  ? 'Acesse a Bíblia Sagrada, cultos ao vivo, estudos bíblicos e pedidos de oração'
                  : 'Crie sua conta para participar da comunidade IGEAD-MT'}
              </p>
            </div>

            {/* Alternância de Abas: Entrar / Criar Conta */}
            <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 mb-6">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700 font-bold'
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

            {/* FORMULÁRIO: LOGIN */}
            {tab === 'login' ? (
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
                      className="w-full pl-10 pr-3.5 py-3 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
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
                      className="w-full pl-10 pr-10 py-3 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validando acesso...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Entrar no Aplicativo</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleTabChange('register')}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                  >
                    Ainda não possui conta?{' '}
                    <strong className="underline font-bold text-amber-700 dark:text-amber-400">
                      Cadastre-se gratuitamente
                    </strong>
                  </button>
                </div>
              </form>
            ) : (
              /* FORMULÁRIO: CADASTRO */
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
                      className="w-full pl-10 pr-3.5 py-3 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
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
                      className="w-full pl-10 pr-3.5 py-3 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Senha (mínimo de 6 caracteres)
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        autoComplete="new-password"
                        className="w-full pl-10 pr-10 py-3 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Confirmar Senha
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        autoComplete="new-password"
                        className="w-full pl-10 pr-10 py-3 text-base sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        aria-label={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
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
                    onClick={() => handleTabChange('login')}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                  >
                    Já possui uma conta cadastrada?{' '}
                    <strong className="underline font-bold text-amber-700 dark:text-amber-400">
                      Entrar
                    </strong>
                  </button>
                </div>
              </form>
            )}

            {/* Aviso de Segurança e Contato */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col items-center gap-2 text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Autenticação criptografada Supabase</span>
              </div>
              <a
                href={CHURCH_INFO.whatsappContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Dificuldades para acessar? Fale no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé da Tela de Login */}
      <footer className="w-full py-4 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        © {new Date().getFullYear()} Igreja Geração Eleita — IGEAD-MT. Todos os direitos reservados.
      </footer>
    </div>
  );
};
