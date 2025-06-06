import React, { useState } from 'react';
import { User, Mail, Phone, ArrowLeft, FileText } from 'lucide-react';

interface RegistrationFormProps {
  onBackToLogin: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    tipoUsuario: 'usuario',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateRut = (rut: string) => {
    return /^\d{7,8}-[\dkK]$/.test(rut);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (Object.values(formData).some(value => value === '')) {
      setError('Por favor, complete todos los campos obligatorios');
      return;
    }
    
    if (!validateRut(formData.rut)) {
      setError('El formato del RUT no es válido. Utilice el formato: 12345678-9');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Por favor, ingrese un correo electrónico válido');
      return;
    }
    
    if (!validatePassword(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setSuccess('Registro exitoso. Ya puedes iniciar sesión con tus credenciales.');
    
    setTimeout(() => {
      onBackToLogin();
    }, 3000);
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
        Registro de Nuevo Usuario
      </h2>
      
      {error && (
        <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 text-sm text-green-600 bg-green-100 rounded-md">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
              <User className="inline mr-1" size={16} /> Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Ingresa tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apellido">
              <User className="inline mr-1" size={16} /> Apellido
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Ingresa tu apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rut">
              <FileText className="inline mr-1" size={16} /> RUT
            </label>
            <input
              id="rut"
              name="rut"
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="12345678-9"
              value={formData.rut}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              <Mail className="inline mr-1" size={16} /> Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="telefono">
              <Phone className="inline mr-1" size={16} /> Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="+56 9 1234 5678"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipoUsuario">
              <User className="inline mr-1" size={16} /> Tipo de Usuario
            </label>
            <select
              id="tipoUsuario"
              name="tipoUsuario"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              value={formData.tipoUsuario}
              onChange={handleChange}
              required
            >
              <option value="usuario">Usuario</option>
              <option value="entrenador">Entrenador</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 8 caracteres, una mayúscula, una minúscula y un número
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;