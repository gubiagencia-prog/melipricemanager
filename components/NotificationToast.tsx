import React, { useEffect } from 'react';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationToastProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {notifications.map((notification) => (
        <ToastItem key={notification.id} item={notification} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ item: NotificationItem; onDismiss: (id: string) => void }> = ({ item, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(item.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  const getIcon = () => {
    switch (item.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (item.type) {
      case 'success': return 'border-green-500';
      case 'warning': return 'border-amber-500';
      default: return 'border-blue-500';
    }
  };

  return (
    <div className={`pointer-events-auto bg-white rounded-lg shadow-lg border-l-4 ${getBorderColor()} p-4 flex items-start gap-3 animate-slide-in`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
        <p className="text-sm text-slate-600 mt-1">{item.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(item.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};