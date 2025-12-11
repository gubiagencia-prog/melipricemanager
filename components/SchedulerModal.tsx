import React, { useState, useEffect } from 'react';
import { Product, PriceSchedule, AdjustmentType } from '../types';
import { X, Wand2, Calendar, DollarSign, Percent, Loader2 } from 'lucide-react';
import { getPricingStrategy } from '../services/geminiService';

interface SchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (schedule: Omit<PriceSchedule, 'id' | 'status' | 'isActive'>) => void;
}

export const SchedulerModal: React.FC<SchedulerModalProps> = ({ isOpen, onClose, product, onSave }) => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<AdjustmentType>('percentage');
  const [value, setValue] = useState<number>(0);
  const [aiGoal, setAiGoal] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set defaults to current date/time + 1 hour
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      const twoHoursLater = new Date(nextHour.getTime() + 60 * 60 * 1000);

      setStartDate(formatDate(nextHour));
      setStartTime(formatTime(nextHour));
      setEndDate(formatDate(twoHoursLater));
      setEndTime(formatTime(twoHoursLater));
      setValue(0);
      setAiGoal('');
    }
  }, [isOpen]);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const formatTime = (d: Date) => d.toTimeString().slice(0, 5);

  const handleAiSuggest = async () => {
    if (!product || !aiGoal.trim()) return;
    setIsAiLoading(true);
    
    try {
      const suggestion = await getPricingStrategy(product, aiGoal);
      setType(suggestion.suggestedType);
      
      // If AI suggests 'fixed', it returns a discount amount. 
      // We convert this to a Target Price for the UI.
      if (suggestion.suggestedType === 'fixed') {
        setValue(Math.max(0, product.originalPrice - suggestion.suggestedValue));
      } else {
        setValue(suggestion.suggestedValue);
      }
      
      // Calculate end time based on start time + duration
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + suggestion.suggestedDurationHours * 60 * 60 * 1000);
      
      setEndDate(formatDate(endDateTime));
      setEndTime(formatTime(endDateTime));

    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const startISO = `${startDate}T${startTime}:00`;
    const endISO = `${endDate}T${endTime}:00`;

    onSave({
      productId: product.id,
      startTime: startISO,
      endTime: endISO,
      type,
      value
    });
    onClose();
  };

  if (!isOpen || !product) return null;

  // Calculate preview price
  let previewPrice = product.originalPrice;
  if (value > 0 || (type === 'fixed' && value >= 0)) {
    if (type === 'percentage') {
      previewPrice = product.originalPrice * (1 - value / 100);
    } else {
      // For fixed type, the value IS the price
      previewPrice = value;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Programar Cambio de Precio</h2>
            <p className="text-sm text-slate-500">Producto: {product.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* AI Section */}
          <div className="mb-8 bg-indigo-50 rounded-xl p-5 border border-indigo-100">
            <div className="flex items-center gap-2 mb-3 text-indigo-700 font-medium">
              <Wand2 className="w-5 h-5" />
              <span>Asistente de Precios IA</span>
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Ej: Quiero vender rápido el stock de invierno..." 
                className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
              />
              <button 
                onClick={handleAiSuggest}
                disabled={isAiLoading || !aiGoal.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sugerir'}
              </button>
            </div>
          </div>

          <form id="schedulerForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Inicio</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    required 
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input 
                    type="time" 
                    required 
                    className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Fin</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    required 
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <input 
                    type="time" 
                    required 
                    className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-xl bg-slate-50">
              <label className="text-sm font-medium text-slate-700 block mb-3">Tipo de Ajuste</label>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setType('percentage');
                      setValue(0);
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${type === 'percentage' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Porcentaje (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('fixed');
                      setValue(product.originalPrice);
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${type === 'fixed' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Precio Final ($)
                  </button>
                </div>
                
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                  </div>
                  <input 
                    type="number" 
                    min="0"
                    step={type === 'percentage' ? "1" : "0.5"}
                    required
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={type === 'percentage' ? "Descuento % (ej: 20)" : "Nuevo precio final (ej: 4999)"}
                    value={value || ''}
                    onChange={(e) => setValue(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <div className="text-sm text-slate-500">Precio Original: <span className="line-through">${product.originalPrice}</span></div>
                <div className="text-lg font-bold text-green-600">Nuevo Precio: ${previewPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button 
            type="submit" 
            form="schedulerForm"
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            Confirmar Programación
          </button>
        </div>
      </div>
    </div>
  );
};