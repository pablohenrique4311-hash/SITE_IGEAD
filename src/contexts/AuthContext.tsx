import { getWhatsAppAdminStatus } from '../constants/authConfig';
import { clearLegacyPrivateStorage } from '../lib/privateStorage';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  displayName: string;
  firstName: string;
  isWhatsAppAdmin: boolean;
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ error: Error | null; user?: User | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Traduz mensagens técnicas de erro do Supabase para português amigável
 */
export function translateAuthError(error: Error | null | undefined): string {
  if (!error) return '';
  const message = error.message || '';

  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.';
  }
  if (message.includes('User already registered') || message.includes('already_registered')) {
    return 'Este e-mail já está cadastrado. Tente entrar com sua conta ou utilize a recuperação de senha.';
  }
  if (message.includes('Password should be at least 6 characters') || message.includes('weak_password')) {
    return 'A senha deve conter no mínimo 6 caracteres.';
  }
  if (message.includes('Email not confirmed')) {
    return 'E-mail não confirmado. Verifique o link de confirmação enviado para sua caixa de entrada.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.';
  }
  if (message.includes('valid email')) {
    return 'Por favor, informe um endereço de e-mail válido.';
  }

  return message;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWhatsAppAdmin, setIsWhatsAppAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    // 1. Obtém sessão existente no carregamento inicial
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[Supabase Auth] Falha ao recuperar sessão:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    // 2. Escuta mudanças de estado (login, logout, refresh de token)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Extrai nome de exibição e primeiro nome
  const { displayName, firstName } = useMemo(() => {
    if (!user) {
      return { displayName: '', firstName: '' };
    }
    const metadata = user.user_metadata || {};
    const full =
      (metadata.full_name as string) ||
      (metadata.name as string) ||
      user.email?.split('@')[0] ||
      'Membro';
    const first = full.trim().split(' ')[0] || 'Membro';
    return { displayName: full.trim(), firstName: first };
  }, [user]);

  const openLogin = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        return { error: new Error(translateAuthError(error)) };
      }

      setSession(data.session);
      setUser(data.user);
      setIsAuthModalOpen(false);
      return { error: null };
    } catch (err) {
      const parsedErr = err instanceof Error ? err : new Error('Erro inesperado ao realizar login.');
      return { error: new Error(translateAuthError(parsedErr)) };
    }
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            name: fullName.trim()
          }
        }
      });

      if (error) {
        return { error: new Error(translateAuthError(error)) };
      }

      // Se o usuário foi criado e a sessão iniciada imediatamente (ex: sem confirmação de email estrita)
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return { error: null, user: data.user };
    } catch (err) {
      const parsedErr = err instanceof Error ? err : new Error('Erro inesperado ao criar conta.');
      return { error: new Error(translateAuthError(parsedErr)) };
    }
  };

  const signOut = async () => {
    clearLegacyPrivateStorage();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (err) {
      throw new Error('Não foi possível encerrar a sessão. Tente novamente.');
    }
  };

  useEffect(() => {
    let active = true;
    setIsWhatsAppAdmin(false);
    if (user) {
      getWhatsAppAdminStatus().then((authorized) => {
        if (active) setIsWhatsAppAdmin(authorized);
      });
    }
    return () => { active = false; };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isAuthModalOpen,
      authModalTab,
      displayName,
      firstName,
      isWhatsAppAdmin,
      openLogin,
      openRegister,
      closeAuthModal,
      setAuthModalTab,
      signIn,
      signUp,
      signOut
    }),
    [user, session, loading, isAuthModalOpen, authModalTab, displayName, firstName, isWhatsAppAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
