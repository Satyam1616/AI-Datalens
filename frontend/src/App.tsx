import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import SchemaManager from './components/SchemaManager';
import { 
  Sun, 
  Moon, 
  Database, 
  LayoutDashboard, 
  Settings, 
  BarChart3,
  Search,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'schema'>('chat');
  const [darkMode, setDarkMode] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; db?: string; error?: string } | null>(null);
  const [isSidebarOpen] = useState(true);

  useEffect(() => {
    checkDbStatus();
    const interval = setInterval(checkDbStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkDbStatus = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/chat/db-status');
      setDbStatus(data);
    } catch (err) {
      setDbStatus({ connected: false, error: 'Backend unreachable' });
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 flex",
      darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <BarChart3 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none text-gray-900 dark:text-white">
                AI-DataLens
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Analytics Platform
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'chat' 
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <LayoutDashboard size={20} className={cn(
                "transition-colors",
                activeTab === 'chat' ? "text-primary-600 dark:text-primary-400" : "group-hover:text-gray-900 dark:group-hover:text-white"
              )} />
              <span className="font-medium">Analytics Chat</span>
              {activeTab === 'chat' && <ChevronRight size={16} className="ml-auto" />}
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === 'schema' 
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Settings size={20} className={cn(
                "transition-colors",
                activeTab === 'schema' ? "text-primary-600 dark:text-primary-400" : "group-hover:text-gray-900 dark:group-hover:text-white"
              )} />
              <span className="font-medium">Metadata Agent</span>
              {activeTab === 'schema' && <ChevronRight size={16} className="ml-auto" />}
            </button>
          </nav>

          {/* Status Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className={cn(
              "p-4 rounded-xl border flex flex-col gap-3",
              dbStatus?.connected 
                ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20" 
                : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">System Status</span>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  dbStatus?.connected ? "bg-green-500" : "bg-red-500"
                )} />
              </div>
              <div className="flex items-center gap-2">
                <Database size={14} className={dbStatus?.connected ? "text-green-600" : "text-red-600"} />
                <span className="text-xs font-semibold truncate">
                  {dbStatus?.connected ? dbStatus.db : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarOpen ? "ml-64" : "ml-0"
      )}>
        {/* Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search queries..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-full text-sm focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              SA
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-6xl mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'chat' ? <ChatInterface /> : <SchemaManager />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
