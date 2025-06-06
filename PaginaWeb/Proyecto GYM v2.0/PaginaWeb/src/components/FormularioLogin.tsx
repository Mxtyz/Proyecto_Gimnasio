import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Check } from 'lucide-react';

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onForgotPassword, 
  onRegister,
  onLoginSuccess 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  // Simulated valid credentials (would be replaced by actual auth)
  const USER_VALID = "admin";
  const PASS_VALID = "1234";
  
  useEffect(() => {
    // Check for remembered email on load
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError('Por favor, complete todos los campos');
      return;
    }
    
    // Check credentials (mock authentication)
    if (email === USER_VALID && password === PASS_VALID) {
      setError('');
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('userEmail', email);
      } else {
        localStorage.removeItem('userEmail');
      }
      
      // Proceed to dashboard
      onLoginSuccess();
    } else {
      setError('Correo o contraseña incorrectos');
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Acceso al Sistema
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            <Mail className="inline mr-2" size={16} /> Correo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="text-gray-500" size={16} />
            </div>
            <input
              id="email"
              type="text"
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            <Lock className="inline mr-2" size={16} /> Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="text-gray-500" size={16} />
            </div>
            <input
              id="password"
              type="password"
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-amber-500"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Recuérdame en este dispositivo
          </label>
        </div>
        
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 mb-4"
        >
          Iniciar sesión
        </button>
        
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-amber-600 hover:underline mb-2 block mx-auto"
          >
            ¿Olvidaste tu contraseña?
          </button>
          
          <button
            type="button"
            onClick={onRegister}
            className="text-amber-600 hover:underline block mx-auto"
          >
            ¿No tienes cuenta? Regístrate aquí
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;