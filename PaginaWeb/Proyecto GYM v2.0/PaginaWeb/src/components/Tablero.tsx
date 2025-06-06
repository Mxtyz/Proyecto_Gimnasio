import React, { useState } from 'react';
import { Dumbbell, Calendar, Users, Activity, LogOut, Menu, X, Edit, Trash, Plus } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  userType?: 'entrenador' | 'usuario';
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, userType = 'usuario' }) => {
  const [activeTab, setActiveTab] = useState<string>('clases');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<number | null>(null);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-amber-500 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Dumbbell size={28} />
            <h1 className="text-xl font-bold">FitZone Gimnasio</h1>
          </div>
          
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab('clases')}
              className={`flex items-center space-x-1 py-1 px-2 rounded ${
                activeTab === 'clases' ? 'bg-amber-600' : 'hover:bg-amber-600'
              }`}
            >
              <Activity size={18} />
              <span>Clases</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('reservas')}
              className={`flex items-center space-x-1 py-1 px-2 rounded ${
                activeTab === 'reservas' ? 'bg-amber-600' : 'hover:bg-amber-600'
              }`}
            >
              <Calendar size={18} />
              <span>Reservas</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('entrenadores')}
              className={`flex items-center space-x-1 py-1 px-2 rounded ${
                activeTab === 'entrenadores' ? 'bg-amber-600' : 'hover:bg-amber-600'
              }`}
            >
              <Users size={18} />
              <span>Entrenadores</span>
            </button>
            
            <button 
              onClick={onLogout}
              className="flex items-center space-x-1 py-1 px-3 bg-red-500 hover:bg-red-600 rounded transition duration-300"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden bg-amber-600 px-4 py-2">
            <nav className="flex flex-col space-y-2">
              <button 
                onClick={() => {
                  setActiveTab('clases');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 py-2 px-3 rounded ${
                  activeTab === 'clases' ? 'bg-amber-700' : 'hover:bg-amber-700'
                }`}
              >
                <Activity size={18} />
                <span>Clases</span>
              </button>
              
              <button 
                onClick={() => {
                  setActiveTab('reservas');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 py-2 px-3 rounded ${
                  activeTab === 'reservas' ? 'bg-amber-700' : 'hover:bg-amber-700'
                }`}
              >
                <Calendar size={18} />
                <span>Reservas</span>
              </button>
              
              <button 
                onClick={() => {
                  setActiveTab('entrenadores');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 py-2 px-3 rounded ${
                  activeTab === 'entrenadores' ? 'bg-amber-700' : 'hover:bg-amber-700'
                }`}
              >
                <Users size={18} />
                <span>Entrenadores</span>
              </button>
              
              <button 
                onClick={onLogout}
                className="flex items-center space-x-2 py-2 px-3 bg-red-500 hover:bg-red-600 rounded transition duration-300"
              >
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        )}
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'clases' && 'Clases y Actividades'}
            {activeTab === 'reservas' && 'Mis Reservas'}
            {activeTab === 'entrenadores' && 'Nuestros Entrenadores'}
          </h2>
          {userType === 'entrenador' && activeTab === 'clases' && (
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center">
              <Plus size={18} className="mr-2" />
              Agregar Clase
            </button>
          )}
        </div>
        
        {activeTab === 'clases' && <ClasesTab userType={userType} />}
        {activeTab === 'reservas' && <ReservasTab userType={userType} />}
        {activeTab === 'entrenadores' && <EntrenadoresTab />}
      </main>
    </div>
  );
};

interface TabProps {
  userType: 'entrenador' | 'usuario';
}

const ClasesTab: React.FC<TabProps> = ({ userType }) => {
  const clases = [
    {
      id: 1,
      nombre: 'Spinning',
      descripcion: 'Clase de ciclismo indoor de alta intensidad.',
      horarios: ['Lunes 9:00', 'Miércoles 18:00', 'Viernes 19:30'],
      instructor: 'Ana Martínez',
      nivel: 'Todos los niveles',
      duracion: '45 minutos'
    },
    {
      id: 2,
      nombre: 'Yoga',
      descripcion: 'Mejora tu flexibilidad y encuentra tu equilibrio interno.',
      horarios: ['Martes 10:00', 'Jueves 17:00', 'Sábado 9:00'],
      instructor: 'Miguel Torres',
      nivel: 'Principiante',
      duracion: '60 minutos'
    },
    {
      id: 3,
      nombre: 'CrossFit',
      descripcion: 'Entrenamiento funcional de alta intensidad.',
      horarios: ['Lunes 19:00', 'Miércoles 20:00', 'Viernes 18:00'],
      instructor: 'Roberto Sánchez',
      nivel: 'Intermedio-Avanzado',
      duracion: '50 minutos'
    },
    {
      id: 4,
      nombre: 'Pilates',
      descripcion: 'Fortalece tu core y mejora tu postura.',
      horarios: ['Martes 18:00', 'Jueves 19:00', 'Sábado 10:30'],
      instructor: 'Carolina López',
      nivel: 'Todos los niveles',
      duracion: '55 minutos'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clases.map((clase) => (
        <div key={clase.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
          <div className="bg-amber-500 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{clase.nombre}</h3>
              <p className="text-sm opacity-90">{clase.instructor}</p>
            </div>
            {userType === 'entrenador' && (
              <div className="flex space-x-2">
                <button className="p-1 hover:bg-amber-600 rounded">
                  <Edit size={18} />
                </button>
                <button className="p-1 hover:bg-amber-600 rounded">
                  <Trash size={18} />
                </button>
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="text-gray-700 mb-3">{clase.descripcion}</p>
            <div className="mb-3">
              <span className="font-semibold text-sm">Nivel:</span> <span className="text-sm">{clase.nivel}</span>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-sm">Duración:</span> <span className="text-sm">{clase.duracion}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-sm block mb-1">Horarios:</span>
              <ul className="text-sm text-gray-600">
                {clase.horarios.map((horario, idx) => (
                  <li key={idx} className="mb-1">{horario}</li>
                ))}
              </ul>
            </div>
            {userType === 'usuario' && (
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                Reservar Clase
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ReservasTab: React.FC<TabProps> = ({ userType }) => {
  const reservas = [
    {
      id: 1,
      clase: 'Spinning',
      fecha: '12 de julio, 2025',
      hora: '9:00 - 9:45',
      instructor: 'Ana Martínez',
      estado: 'confirmada'
    },
    {
      id: 2,
      clase: 'Yoga',
      fecha: '14 de julio, 2025',
      hora: '17:00 - 18:00',
      instructor: 'Miguel Torres',
      estado: 'pendiente'
    }
  ];
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clase
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reserva.clase}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {reserva.fecha}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {reserva.hora}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {reserva.instructor}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {reserva.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                    {userType === 'entrenador' ? (
                      <button className="text-amber-600 hover:text-amber-900 mr-3">
                        Gestionar
                      </button>
                    ) : (
                      <button className="text-red-600 hover:text-red-900 mr-3">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {userType === 'usuario' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Reservar Nueva Clase</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="clase">
                Clase
              </label>
              <select
                id="clase"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Selecciona una clase</option>
                <option value="spinning">Spinning</option>
                <option value="yoga">Yoga</option>
                <option value="crossfit">CrossFit</option>
                <option value="pilates">Pilates</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fecha">
                Fecha
              </label>
              <input
                id="fecha"
                type="date"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hora">
                Hora
              </label>
              <select
                id="hora"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Selecciona un horario</option>
                <option value="9:00">9:00</option>
                <option value="10:00">10:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
                <option value="19:00">19:00</option>
              </select>
            </div>
          </div>
          
          <button className="mt-6 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Confirmar Reserva
          </button>
        </div>
      )}
    </div>
  );
};

const EntrenadoresTab: React.FC = () => {
  const entrenadores = [
    {
      id: 1,
      nombre: 'Roberto Sánchez',
      especialidad: 'CrossFit y Entrenamiento Funcional',
      experiencia: '8 años',
      certificaciones: ['CrossFit Level 2', 'Entrenamiento Funcional Avanzado'],
      descripcion: 'Especialista en entrenamiento de alta intensidad y técnicas avanzadas de CrossFit.'
    },
    {
      id: 2,
      nombre: 'Ana Martínez',
      especialidad: 'Spinning y Cardio',
      experiencia: '6 años',
      certificaciones: ['Instructor de Spinning Certificado', 'Entrenamiento Cardiovascular'],
      descripcion: 'Experta en clases de spinning con enfoque en resistencia y quema de calorías.'
    },
    {
      id: 3,
      nombre: 'Miguel Torres',
      especialidad: 'Yoga y Meditación',
      experiencia: '10 años',
      certificaciones: ['Yoga Alliance 500h', 'Mindfulness'],
      descripcion: 'Instructor experimentado en varias modalidades de yoga con enfoque en bienestar integral.'
    },
    {
      id: 4,
      nombre: 'Carolina López',
      especialidad: 'Pilates y Rehabilitación',
      experiencia: '7 años',
      certificaciones: ['Pilates Mat y Reformer', 'Rehabilitación Deportiva'],
      descripcion: 'Especialista en técnicas de pilates para mejorar postura y recuperación de lesiones.'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {entrenadores.map((entrenador) => (
        <div key={entrenador.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-gray-200 flex items-center justify-center p-6">
            <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center text-white text-2xl font-bold">
              {entrenador.nombre.split(' ').map(name => name[0]).join('')}
            </div>
          </div>
          <div className="md:w-2/3 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{entrenador.nombre}</h3>
            <p className="text-amber-500 font-semibold mb-3">{entrenador.especialidad}</p>
            <p className="text-sm text-gray-600 mb-3">{entrenador.descripcion}</p>
            <div className="mb-3">
              <span className="text-sm font-semibold">Experiencia:</span> <span className="text-sm">{entrenador.experiencia}</span>
            </div>
            <div>
              <span className="text-sm font-semibold block mb-1">Certificaciones:</span>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {entrenador.certificaciones.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>
            <button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-4 rounded-md transition duration-300 text-sm">
              Ver Horarios
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;