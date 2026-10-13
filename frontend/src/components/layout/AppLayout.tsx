import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarCheck,
  Users,
  CheckSquare,
  LayoutDashboard,
  UserCog,
  FileBarChart,
  KeyRound,
  LogOut,
  Menu,
  X,
  Shield,
  Briefcase,
  UserCheck,
  Calendar,
  Plus,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTodayPointage } from '../../hooks/usePointage';
import { NotificationBell } from '../NotificationBell';
import { PageSearchDialog } from './PageSearchDialog';
interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string;
}
export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: todayPointage } = useTodayPointage();
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);
  const userRole = user?.role ?? 'ROLE_EMPLOYE';
  const employeeNavItems: NavItem[] = [
    { to: '/pointage', label: 'Pointage journalier', icon: Clock },
    { to: '/mes-conges', label: 'Mes congés & absences', icon: CalendarCheck },
  ];
  const managementNavItems: NavItem[] = [
    {
      to: '/presences',
      label: 'Présences équipe',
      icon: Users,
      roles: ['ROLE_CHEF_SERVICE', 'ROLE_ADMIN_RH'],
    },
    {
      to: '/validation-conges',
      label: 'Validation congés',
      icon: CheckSquare,
      roles: ['ROLE_CHEF_SERVICE', 'ROLE_ADMIN_RH'],
    },
    {
      to: '/tableau-de-bord',
      label: 'Tableau de bord RH',
      icon: LayoutDashboard,
      roles: ['ROLE_CHEF_SERVICE', 'ROLE_ADMIN_RH'],
    },
  ];
  const adminNavItems: NavItem[] = [
    {
      to: '/employes',
      label: 'Gestion des collaborateurs',
      icon: UserCog,
      roles: ['ROLE_ADMIN_RH'],
    },
    {
      to: '/rapports',
      label: 'Rapports & Exports',
      icon: FileBarChart,
      roles: ['ROLE_ADMIN_RH'],
    },
  ];
  const hasRole = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(userRole);
  };
  const searchableItems = [...employeeNavItems, ...managementNavItems, ...adminNavItems]
    .filter((item) => hasRole(item.roles));
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN_RH':
        return {
          label: 'Admin RH',
          color: 'bg-stone-100 text-stone-700 border-stone-200',
          icon: Shield,
        };
      case 'ROLE_CHEF_SERVICE':
        return {
          label: 'Chef de service',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Briefcase,
        };
      default:
        return {
          label: 'Employé',
          color: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: UserCheck,
        };
    }
  };
  const roleInfo = getRoleBadge(userRole);
  const RoleIcon = roleInfo.icon;
  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };
  const isClockedIn = Boolean(todayPointage?.heureArrivee && !todayPointage?.heureDepart);
  const isClockedOut = Boolean(todayPointage?.heureArrivee && todayPointage?.heureDepart);
  const renderNavGroup = (title: string, items: NavItem[]) => {
    const visibleItems = items.filter((item) => hasRole(item.roles));
    if (visibleItems.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
          {title}
        </h3>
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 border-l-2 border-emerald-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-800' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f6f6f3] text-[#1c1f1e] font-sans">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Bizneo HR inspiration) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e0e0da] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#e0e0da]">
            <Link to="/pointage" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#0f5c4d] flex items-center justify-center text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-slate-900 brand-title">
                  RH-Point
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Portail Temps & Congés
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button in Sidebar */}
          <div className="mb-6">
            <Link
              to="/mes-conges"
              onClick={handleNavClick}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-semibold text-white bg-[#0f5c4d] hover:bg-[#0b493e] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Demande de congé</span>
            </Link>
          </div>

          {/* Navigation Sections */}
          {renderNavGroup('Mon Espace Collaborateur', employeeNavItems)}
          {renderNavGroup('Supervision & Équipe', managementNavItems)}
          {renderNavGroup('Administration RH', adminNavItems)}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-[#e0e0da] bg-[#f6f6f3]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded bg-[#0f5c4d] text-white font-semibold text-xs flex items-center justify-center">
              {user?.matricule?.slice(0, 2).toUpperCase() || 'RH'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.matricule || 'Utilisateur'}
              </p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border ${roleInfo.color}`}
              >
                <RoleIcon className="w-3 h-3" />
                {roleInfo.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
            <Link
              to="/changer-mot-de-passe"
              title="Changer de mot de passe"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              Sécurité
            </Link>
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#e0e0da] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Live Clock & Date */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">
                {currentTime.toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono font-bold text-slate-800">
                {currentTime.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>

            <Link
              to="/pointage"
              className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isClockedIn
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : isClockedOut
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isClockedIn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Au poste depuis {todayPointage?.heureArrivee}</span>
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                </>
              ) : isClockedOut ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Journée validée</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Non pointé — Pointer</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </>
              )}
            </Link>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden md:inline-flex items-center gap-2 px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs text-slate-500 hover:border-slate-300 hover:text-slate-800"
              aria-label="Rechercher une page"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Rechercher</span>
              <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] text-slate-500">
                Ctrl K
              </kbd>
            </button>

            {/* Quick Action button */}
            <Link
              to="/mes-conges"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Demande</span>
            </Link>

            <NotificationBell />

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.matricule}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {roleInfo.label}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {searchOpen && (
        <PageSearchDialog
          items={searchableItems}
          onNavigate={navigate}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}
