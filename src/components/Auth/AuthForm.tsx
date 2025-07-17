import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !email.includes('@')) {
        const result = await signIn(email, password);
        if (result?.error) {
          if (result.error.message.includes('Invalid login credentials')) {
            setError('Credenciales inválidas. Verifica tu email y contraseña.');
          } else if (result.error.message.includes('Email not confirmed')) {
            setError('Por favor, confirma tu email. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.');
          } else {
            setError(result.error.message);
          }
          setLoading(false);
          return;
        }
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      let result;
      
      if (isLogin) {
        result = await login(email, password);
      } else {
        const result = await signUp(email, password);
        if (result?.error) {
          setError(result.error.message);
          setLoading(false);
          return;
        }
        setError('');
        setMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
      }

      if (!result.success) {
        setError(result.error || 'Ocurrió un error');
      } else if (result.error) {
        // This handles the email confirmation case
        setSuccess(result.error);
      }
    } catch (err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Por favor, confirma tu email. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.');
      } else {
        setError(err.message || 'Error de autenticación');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Future<span className="text-purple-400">Cal</span>
            </h1>
            <p className="text-gray-300">
              {isLogin ? 'Bienvenido de nuevo' : 'Únete al futuro de los eventos'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu email"
                  className="w-full pl-12 pr-4 py-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-12 pr-12 py-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 rounded-lg p-3">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-400 text-sm text-center bg-green-900/20 rounded-lg p-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-purple-400 hover:text-purple-300 font-medium mt-2 transition-colors duration-300"
            >
              {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              </p>
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;