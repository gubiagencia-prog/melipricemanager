import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Lock, Mail, User, Link2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  onMeliLogin: () => void;
  isConnecting: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onMeliLogin, isConnecting }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Hero / Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white mix-blend-overlay blur-3xl"></div>
             <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-yellow-400 mix-blend-overlay blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm mb-6">
              <ShoppingBag className="w-6 h-6 text-yellow-300" />
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Automatiza tus precios en Mercado Libre
            </h1>
            <p className="text-indigo-100 text-lg opacity-90">
              Programa ofertas, gestiona stock y usa IA para maximizar tus ventas sin esfuerzo manual.
            </p>
          </div>

          <div className="relative z-10 mt-12 space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium bg-white/10 p-3 rounded-lg backdrop-blur-sm">
               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
               Sincronización en tiempo real
            </div>
            <div className="flex items-center gap-3 text-sm font-medium bg-white/10 p-3 rounded-lg backdrop-blur-sm">
               <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
               Estrategias de precios con IA
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {isRegistering ? 'Crear Cuenta' : 'Bienvenido de nuevo'}
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                {isRegistering 
                  ? 'Comienza a optimizar tus ventas hoy' 
                  : 'Ingresa a tu panel de control'}
              </p>
            </div>

            {/* Mercado Libre Direct Login */}
            <button 
              onClick={onMeliLogin}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#FFE600] text-[#2D3277] rounded-xl font-bold hover:bg-[#FDD835] transition-all shadow-sm mb-6 group"
            >
              {isConnecting ? (
                 <div className="w-5 h-5 border-2 border-[#2D3277] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Link2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Continuar con Mercado Libre</span>
                </>
              )}
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">O usa tu email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 ml-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    placeholder="ejemplo@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-slate-200"
              >
                {isRegistering ? 'Crear Cuenta' : 'Ingresar'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500">
                {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
              </span>
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                {isRegistering ? 'Inicia Sesión' : 'Regístrate gratis'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-4 text-center w-full text-xs text-slate-400">
        &copy; 2024 MercadoPrice Scheduler. No afiliado directamente con Mercado Libre.
      </div>
    </div>
  );
};