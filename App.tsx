import React, { useState, useEffect } from 'react';
import { Product, PriceSchedule, NotificationItem } from './types';
import { INITIAL_PRODUCTS } from './services/mockData';
import { meliService } from './services/meliService';
import { ProductCard } from './components/ProductCard';
import { SchedulerModal } from './components/SchedulerModal';
import { ScheduledJobsList } from './components/ScheduledJobsList';
import { NotificationToast } from './components/NotificationToast';
import { LoginPage } from './components/LoginPage';
import { ShoppingBag, LayoutDashboard, Clock, User, LogIn, Link2, Search, Filter, ArrowUpDown, LogOut } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'login' | 'dashboard'>('login');
  
  // App Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [schedules, setSchedules] = useState<PriceSchedule[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [meliConnected, setMeliConnected] = useState(false);
  const [meliUser, setMeliUser] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [processingProducts, setProcessingProducts] = useState<string[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Filters & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  // Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Function to add notification
  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotification: NotificationItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type
    };
    setNotifications(prev => [...prev, newNotification]);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Check for OAuth Callback
  useEffect(() => {
    const checkForCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        setIsConnecting(true);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        
        try {
          const { user, token } = await meliService.login(code);
          setMeliUser(user);
          setMeliConnected(true);
          setIsAuthenticated(true);
          setCurrentUser(user);
          setCurrentView('dashboard');
          addNotification('Mercado Libre Vinculado', 'Conexión exitosa', 'success');
          
          const items = await meliService.fetchMyItems(token);
          setProducts(items);
          setSchedules([]); // Reset schedules for new account
        } catch (error) {
          addNotification('Error', 'No se pudo vincular la cuenta', 'warning');
        } finally {
          setIsConnecting(false);
        }
      }
      setIsCheckingAuth(false);
    };

    checkForCallback();
  }, []);

  // Timer to update time and check schedule statuses
  useEffect(() => {
    if (currentView !== 'dashboard') return;

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      updatePricesBasedOnSchedule(now);
    }, 5000); 

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules, currentView]);

  const updatePricesBasedOnSchedule = (now: Date) => {
    const updatedProducts = products.map(p => ({ ...p }));
    let hasProductUpdates = false;
    
    const updatedSchedules = schedules.map(schedule => {
      const start = new Date(schedule.startTime);
      const end = new Date(schedule.endTime);
      const previousStatus = schedule.status;
      
      let status: PriceSchedule['status'] = 'pending';
      let isActive = false;

      if (now >= start && now <= end) {
        status = 'active';
        isActive = true;
      } else if (now > end) {
        status = 'completed';
      }

      // Notification Logic
      const productName = productTitleMap[schedule.productId] || 'Producto';
      if (previousStatus === 'pending' && status === 'active') {
         addNotification('¡Oferta Iniciada!', `El precio de "${productName}" se ha actualizado.`, 'success');
      } else if (previousStatus === 'active' && status === 'completed') {
         addNotification('Oferta Finalizada', `El precio de "${productName}" ha vuelto a su estado original.`, 'info');
      }

      return { ...schedule, status, isActive };
    });

    const hasStatusChanged = JSON.stringify(updatedSchedules) !== JSON.stringify(schedules);
    
    if (hasStatusChanged) {
      setSchedules(updatedSchedules);
    }

    // Reset prices
    updatedProducts.forEach(p => {
        if (p.currentPrice !== p.originalPrice) {
            p.currentPrice = p.originalPrice;
            hasProductUpdates = true;
        }
    });

    // Apply active schedules
    updatedSchedules.filter(s => s.isActive).forEach(schedule => {
      const productIndex = updatedProducts.findIndex(p => p.id === schedule.productId);
      if (productIndex !== -1) {
        const prod = updatedProducts[productIndex];
        
        let newPrice = prod.originalPrice;
        if (schedule.type === 'percentage') {
          newPrice = Math.round(prod.originalPrice * (1 - schedule.value / 100));
        } else {
          newPrice = schedule.value;
        }

        if (prod.currentPrice !== newPrice) {
            prod.currentPrice = newPrice;
            hasProductUpdates = true;
        }
      }
    });

    if (hasProductUpdates) {
       setProducts(updatedProducts);
    }
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveSchedule = (scheduleData: Omit<PriceSchedule, 'id' | 'status' | 'isActive'>) => {
    const newSchedule: PriceSchedule = {
      ...scheduleData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      isActive: false
    };
    
    setSchedules(prev => [...prev, newSchedule].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
    addNotification('Programación Creada', `El cambio de precio iniciará a las ${new Date(newSchedule.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 'success');
    updatePricesBasedOnSchedule(new Date());
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    addNotification('Programación Cancelada', 'El cambio de precio ha sido eliminado.', 'warning');
    setTimeout(() => updatePricesBasedOnSchedule(new Date()), 100);
  };

  // --- Auth & API ---

  const handleLocalLogin = (email: string) => {
    setCurrentUser(email.split('@')[0]); // Simple user name extraction
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    addNotification('Bienvenido', 'Has iniciado sesión correctamente.', 'success');
  };

  const handleConnectMeli = () => {
    setIsConnecting(true);
    // Redirect to Mercado Libre Auth Page
    window.location.href = meliService.getAuthUrl();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMeliConnected(false);
    setMeliUser(null);
    setCurrentUser(null);
    setProducts(INITIAL_PRODUCTS); // Reset to mock data
    setCurrentView('login');
  };

  const handleToggleStatus = async (product: Product) => {
    if (!meliConnected) {
        addNotification('Requiere Vinculación', 'Debes conectar tu cuenta de Mercado Libre para cambiar el estado.', 'warning');
        return;
    }

    setProcessingProducts(prev => [...prev, product.id]);
    try {
        const newStatus = await meliService.toggleItemStatus(product.id, product.status);
        
        setProducts(prev => prev.map(p => {
            if (p.id === product.id) {
                return { ...p, status: newStatus };
            }
            return p;
        }));

        const actionText = newStatus === 'active' ? 'reactivada' : 'pausada';
        addNotification('Estado Actualizado', `La publicación ha sido ${actionText}.`, 'info');

    } catch (error) {
        addNotification('Error', 'No se pudo actualizar el estado', 'warning');
    } finally {
        setProcessingProducts(prev => prev.filter(id => id !== product.id));
    }
  };

  // --- Derived State ---

  const filteredProducts = products
    .filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
        switch (sortBy) {
            case 'price-asc': return a.currentPrice - b.currentPrice;
            case 'price-desc': return b.currentPrice - a.currentPrice;
            case 'stock-asc': return a.stock - b.stock;
            case 'stock-desc': return b.stock - a.stock;
            default: return 0;
        }
    });

  const productTitleMap = products.reduce((acc, p) => {
    acc[p.id] = p.title;
    return acc;
  }, {} as Record<string, string>);

  // --- RENDER ---

  if (isConnecting || isCheckingAuth && new URLSearchParams(window.location.search).get('code')) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-slate-800">Vinculando con Mercado Libre...</h2>
                <p className="text-slate-500">Por favor espera un momento mientras configuramos tu cuenta.</p>
            </div>
        </div>
    );
  }

  if (currentView === 'login') {
      return (
          <LoginPage 
            onLogin={handleLocalLogin} 
            onMeliLogin={handleConnectMeli}
            isConnecting={isConnecting}
          />
      );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <NotificationToast notifications={notifications} onDismiss={removeNotification} />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-2 rounded-lg text-yellow-900 shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">MercadoPrice Scheduler</h1>
              <p className="text-xs text-slate-500 font-medium">Gestión Automática</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {!meliConnected ? (
                <button 
                    onClick={handleConnectMeli}
                    disabled={isConnecting}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                    {isConnecting ? (
                        <div className="w-4 h-4 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Link2 className="w-4 h-4" />
                    )}
                    Vincular Mercado Libre
                </button>
             ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                    <div className="bg-green-100 p-1 rounded-full"><Link2 className="w-3 h-3 text-green-600" /></div>
                    <span className="text-xs font-semibold text-green-700">Conectado: {meliUser}</span>
                </div>
             )}
             
             <div className="h-8 w-px bg-slate-200 mx-1"></div>

             <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block">
                     <div className="text-sm font-bold text-slate-700">{currentUser}</div>
                     <div className="text-xs text-slate-400">Usuario</div>
                 </div>
                 <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Cerrar Sesión"
                 >
                    <LogOut className="w-5 h-5" />
                 </button>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Publicaciones</div>
            <div className="flex justify-between items-end">
                <div className="text-3xl font-bold text-slate-800">{products.length}</div>
                <div className="bg-slate-100 p-2 rounded-full text-slate-500"><ShoppingBag className="w-4 h-4"/></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Ofertas Activas</div>
            <div className="flex justify-between items-end">
                <div className="text-3xl font-bold text-green-600">{schedules.filter(s => s.status === 'active').length}</div>
                <div className="bg-green-100 p-2 rounded-full text-green-600"><Clock className="w-4 h-4"/></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Programados</div>
            <div className="flex justify-between items-end">
                <div className="text-3xl font-bold text-blue-600">{schedules.filter(s => s.status === 'pending').length}</div>
                <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Clock className="w-4 h-4"/></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pausadas</div>
            <div className="flex justify-between items-end">
                <div className="text-3xl font-bold text-slate-400">{products.filter(p => p.status === 'paused').length}</div>
                <div className="bg-slate-100 p-2 rounded-full text-slate-400"><ShoppingBag className="w-4 h-4"/></div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                Mis Publicaciones
                </h2>
                <div className="text-sm text-slate-500 mt-1">
                    {meliConnected ? 'Sincronizado con Mercado Libre' : 'Modo Demo (Vincula tu cuenta para ver tus productos reales)'}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar producto..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-48 pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
                
                <div className="flex gap-3">
                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full sm:w-36 pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer"
                        >
                            <option value="all">Todos</option>
                            <option value="active">Activas</option>
                            <option value="paused">Pausadas</option>
                        </select>
                    </div>

                    <div className="relative">
                        <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full sm:w-44 pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer"
                        >
                            <option value="default">Relevancia</option>
                            <option value="price-asc">Precio: Menor a Mayor</option>
                            <option value="price-desc">Precio: Mayor a Menor</option>
                            <option value="stock-asc">Stock: Menor a Mayor</option>
                            <option value="stock-desc">Stock: Mayor a Menor</option>
                        </select>
                    </div>
                </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No se encontraron productos</p>
                <p className="text-slate-400 text-sm">Intenta ajustar tus filtros de búsqueda</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                const isActiveSale = schedules.some(s => s.productId === product.id && s.isActive);
                return (
                    <ProductCard 
                    key={product.id} 
                    product={product} 
                    onSelect={handleOpenModal} 
                    isActiveSale={isActiveSale}
                    onToggleStatus={handleToggleStatus}
                    isProcessing={processingProducts.includes(product.id)}
                    />
                );
                })}
            </div>
          )}
        </section>

        {/* Schedule Table */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Agenda de Cambios de Precio
          </h2>
          <ScheduledJobsList 
            schedules={schedules} 
            productTitleMap={productTitleMap} 
            onDelete={handleDeleteSchedule}
          />
        </section>

      </main>

      <SchedulerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveSchedule}
      />
    </div>
  );
};

export default App;