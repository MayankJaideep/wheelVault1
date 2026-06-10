import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, Bell, ChevronDown, LogOut, Settings, LayoutDashboard, PlusCircle, MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { cn } from '../../lib/utils';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => { setIsMobileMenuOpen(false); setIsUserMenuOpen(false); }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navLinks = [
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/auctions', label: 'Auctions' },
    { path: '/collections', label: 'Collections' },
  ];

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', isScrolled ? 'glass-dark shadow-lg' : 'bg-transparent')}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20 px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <span className="text-white font-display font-bold text-xl">W</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-bold text-white tracking-tight">Wheel<span className="text-primary-400">Vault</span></h1>
              <p className="text-[10px] text-gray-500 -mt-1 tracking-wider uppercase">Hot Wheels Market</p>
            </div>
          </Link>

          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Hot Wheels, brands, series..." className="w-full h-12 pl-12 pr-4 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </form>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={cn('px-4 py-2 rounded-lg font-medium transition-colors',
                  location.pathname === link.path ? 'text-primary-400' : 'text-gray-400 hover:text-white')}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/sell" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-500 transition-colors">
                  <PlusCircle className="w-4 h-4" /><span>Sell</span>
                </Link>
                <Link to="/messages" className="btn-icon relative"><MessageSquare className="w-5 h-5 text-gray-400 hover:text-white" /></Link>
                <Link to="/wishlist" className="btn-icon relative"><Heart className="w-5 h-5 text-gray-400 hover:text-white" /></Link>
                <Link to="/cart" className="btn-icon relative">
                  <ShoppingCart className="w-5 h-5 text-gray-400 hover:text-white" />
                  {itemCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{itemCount}</span>}
                </Link>
                <button className="btn-icon relative"><Bell className="w-5 h-5 text-gray-400 hover:text-white" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary-500 rounded-full" />
                </button>
                <div className="relative">
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-dark-800/50 transition-colors">
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt={profile.username} className="w-8 h-8 rounded-lg object-cover" />
                      : <div className="w-8 h-8 bg-dark-800 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-gray-400" /></div>}
                    <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isUserMenuOpen && 'rotate-180')} />
                  </button>
                  {isUserMenuOpen && (
                    <div className="dropdown">
                      <Link to="/dashboard" className="dropdown-item"><LayoutDashboard className="w-4 h-4" />Dashboard</Link>
                      <Link to={`/profile/${profile?.username}`} className="dropdown-item"><User className="w-4 h-4" />My Profile</Link>
                      <Link to="/settings" className="dropdown-item"><Settings className="w-4 h-4" />Settings</Link>
                      <hr className="my-2 border-dark-700" />
                      <button onClick={signOut} className="dropdown-item w-full text-red-400 hover:text-red-300"><LogOut className="w-4 h-4" />Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/signin" className="btn-ghost">Sign In</Link>
                <Link to="/signup" className="hidden sm:block btn-primary">Sign Up</Link>
              </>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden btn-icon">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden glass-card mx-4 mb-4 p-4 animate-slide-down">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." className="w-full h-12 pl-12 pr-4 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </form>
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={cn('block px-4 py-3 rounded-lg font-medium transition-colors',
                    location.pathname === link.path ? 'bg-primary-500/10 text-primary-400' : 'text-gray-400 hover:bg-dark-800/50 hover:text-white')}>
                  {link.label}
                </Link>
              ))}
              {user && <Link to="/sell" className="block px-4 py-3 rounded-lg font-medium text-gray-400 hover:bg-dark-800/50 hover:text-white">Sell an Item</Link>}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
