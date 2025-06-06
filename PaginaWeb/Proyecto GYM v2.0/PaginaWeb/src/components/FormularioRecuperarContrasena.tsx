import React, { useState } from 'react';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  
  // For demo purposes - verification code will be simulated
  const MOCK_CODE = "123456";
  
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({ text: 'Por favor, ingresa un correo electrónico válido', type: 'error' });
      return;
    }
    
    // Simulate sending verification code
    setMessage({ 
      text: `Código de verificación enviado a ${email}. Revisa tu bandeja de entrada.`, 
      type: 'success' 
    });
    
    // Move to verification step
    setTimeout(() => {
      setStep(2);
      setMessage({ text: '', type: '' });
    }, 2000);
  };
  
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode !== MOCK_CODE) {
      setMessage({ text: 'Código de verificación incorrecto', type: 'error' });
      return;
    }
    
    setMessage({ text: 'Código verificado correctamente', type: 'success' });
    
    // Move to reset password step
    setTimeout(() => {
      setStep(3);
      setMessage({ text: '', type: '' });
    }, 1500);
  };
  
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setMessage({ text: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    
    // Simulate password reset
    setMessage({ text: 'Contraseña actualizada correctamente', type: 'success' });
    
    // Return to login after success
    setTimeout(() => {
      onBackToLogin();
    }, 2000);
  };
  
  return (
    <div>
      <button 
        onClick={onBackToLogin}
        className="flex items-center text-amber-600 hover:underline mb-4"
      >
        <ArrowLeft size={16} className="mr-1" /> Volver al inicio de sesión
      </button>
      
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Recuperar Contraseña
      </h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {message.text}
        </div>
      )}
      
      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recovery-email">
              <Mail className="inline mr-2" size={16} /> Correo Electrónico
            </label>
            <input
              id="recovery-email"
              type="email"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Te enviaremos un código de verificación a este correo electrónico para restablecer tu contraseña.
          </p>
          
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Enviar Código
          </button>
        </form>
      )}
      
      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="verification-code">
              <KeyRound className="inline mr-2" size={16} /> Código de Verificación
            </label>
            <input
              id="verification-code"
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Ingresa el código de 6 dígitos"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Hemos enviado un código de verificación a <strong>{email}</strong>. Por favor, ingrésalo aquí.
          </p>
          
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Verificar Código
          </button>
        </form>
      )}
      
      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new-password">
              <KeyRound className="inline mr-2" size={16} /> Nueva Contraseña
            </label>
            <input
              id="new-password"
              type="password"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Ingresa tu nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
              <KeyRound className="inline mr-2" size={16} /> Confirmar Contraseña
            </label>
            <input
              id="confirm-password"
              type="password"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Confirma tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Actualizar Contraseña
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;