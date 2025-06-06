import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import FormularioLogin from './components/FormularioLogin';
import FormularioRecuperarContrasena from './components/FormularioRecuperarContrasena';
import FormularioRegistro from './components/FormularioRegistro';
import Tablero from './components/Tablero';

function App() {
  const [vistaActual, setVistaActual] = useState<string>('login');
  const [sesionIniciada, setSesionIniciada] = useState<boolean>(false);
  const [tipoUsuario, setTipoUsuario] = useState<'entrenador' | 'usuario'>('usuario');
  
  if (sesionIniciada) {
    return <Tablero onLogout={() => setSesionIniciada(false)} userType={tipoUsuario} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Panel Izquierdo - Formulario */}
        <div className="w-full md:w-3/5 p-8">
          {vistaActual === 'login' && (
            <FormularioLogin 
              onForgotPassword={() => setVistaActual('forgotPassword')}
              onRegister={() => setVistaActual('register')}
              onLoginSuccess={(tipo) => {
                setTipoUsuario(tipo);
                setSesionIniciada(true);
              }}
            />
          )}
          
          {vistaActual === 'forgotPassword' && (
            <FormularioRecuperarContrasena 
              onBackToLogin={() => setVistaActual('login')}
            />
          )}
          
          {vistaActual === 'register' && (
            <FormularioRegistro 
              onBackToLogin={() => setVistaActual('login')}
            />
          )}
        </div>
        
        {/* Panel Derecho - Bienvenida */}
        <div className="w-full md:w-2/5 bg-gray-800 text-white p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Bienvenido a FitZone</h2>
            <p className="text-gray-300 mb-8">Reserva tus entrenamientos fácilmente</p>
          </div>
          
          <div className="flex justify-center mb-8">
            <Dumbbell size={80} className="text-amber-200" />
          </div>
          
          <div className="text-center text-sm">
            <p className="mb-2">Tu camino al éxito fitness comienza aquí</p>
            <p>© 2025 FitZone Gimnasio</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;