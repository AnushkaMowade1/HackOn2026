import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, History, Bell, Activity, ShieldCheck, LogOut, User as UserIcon, Siren } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';
import { useTriage } from '../context/TriageContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function AlertNotificationBadge() {
  const { alerts } = useTriage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Show only for receptionist and admin
  if (!user || !['Admin', 'Receptionist'].includes(user.role) || alerts.length === 0) {
    return null;
  }
  
  return (
    <div 
      onClick={() => navigate('/')}
      className="mx-4 mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 cursor-pointer hover:bg-red-100 transition-all animate-pulse"
    >
      <div className="flex items-center gap-3">
        <div className="bg-red-500 p-2 rounded-lg">
          <Siren className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-red-900">
            {alerts.length} Ambulance Alert{alerts.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-red-600">Click to review and add to queue</p>
        </div>
        <Bell className="w-5 h-5 text-red-500" />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const { alerts } = useTriage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Receptionist'] },
    { to: '/queue', icon: Users, label: 'Queue', roles: ['Admin', 'Receptionist'] },
    { to: '/history', icon: History, label: 'Patient History', roles: ['Admin', 'Receptionist'] },
    { to: '/ambulance-alerts', icon: Bell, label: 'Ambulance Alerts', roles: ['Admin', 'Receptionist', 'Ambulance Controller'] },
    { to: '/users', icon: ShieldCheck, label: 'User Management', roles: ['Admin'] },
  ];

  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-red-500 p-2 rounded-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">MedTriage AI</h1>
          <p className="text-xs text-slate-400">Emergency Support</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <AlertNotificationBadge />
        {navItems.map((item) => {
          const showBadge = item.to === '/' && alerts.length > 0 && user && ['Admin', 'Receptionist'].includes(user.role);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative",
                  isActive 
                    ? "bg-red-500/10 text-red-500 font-medium" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {showBadge && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {alerts.length}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-400 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="bg-slate-800/30 p-4 rounded-xl">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Engine Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
