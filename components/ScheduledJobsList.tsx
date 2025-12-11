import React from 'react';
import { PriceSchedule } from '../types';
import { Calendar, Trash2, Clock, AlertCircle } from 'lucide-react';

interface ScheduledJobsListProps {
  schedules: PriceSchedule[];
  productTitleMap: Record<string, string>;
  onDelete: (id: string) => void;
}

export const ScheduledJobsList: React.FC<ScheduledJobsListProps> = ({ schedules, productTitleMap, onDelete }) => {
  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
          <Calendar className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-slate-900 font-medium">Sin tareas programadas</h3>
        <p className="text-slate-500 text-sm mt-1">Selecciona un producto arriba para comenzar.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'expired': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Producto</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Estado</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Horario</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Ajuste</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {productTitleMap[schedule.productId] || 'Producto desconocido'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(schedule.status)}`}>
                    {schedule.status === 'active' && <Clock className="w-3 h-3 mr-1 animate-pulse" />}
                    {schedule.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-slate-700">Inicio: {new Date(schedule.startTime).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Fin: {new Date(schedule.endTime).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">
                   {schedule.type === 'percentage' 
                      ? <span className="font-bold text-red-500">-{schedule.value}%</span> 
                      : <span className="font-bold text-slate-700">${schedule.value.toLocaleString('es-MX')}</span>
                   }
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDelete(schedule.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Eliminar programación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};