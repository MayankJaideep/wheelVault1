import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">W</span>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">Wheel<span className="text-primary-400">Vault</span></h2>
                <p className="text-xs text-gray-500 tracking-wider uppercase">Hot Wheels Market</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">The premier marketplace for Hot Wheels collectors. Buy, sell, trade, and auction your die-cast treasures with fellow enthusiasts worldwide.</p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="btn-icon bg-dark-800 hover:bg-dark-700"><Icon className="w-5 h-5" /></a>
              ))}
            </div>
          </div>
          {[['Marketplace', [{ label: 'Browse All', path: '/marketplace' }, { label: 'Live Auctions', path: '/auctions' }, { label: 'New Arrivals', path: '/marketplace?filter=new' }, { label: 'Trending', path: '/marketplace?filter=trending' }, { label: 'Collections', path: '/collections' }]],
            ['Categories', [{ label: 'Treasure Hunts', path: '/marketplace?rarity=treasure_hunt' }, { label: 'Chase Cars', path: '/marketplace?rarity=chase' }, { label: 'Mint Condition', path: '/marketplace?condition=mint' }, { label: 'Sealed Packs', path: '/marketplace?packaging=sealed' }]],
            ['Support', [{ label: 'Help Center', path: '/help' }, { label: 'Contact Us', path: '/contact' }, { label: 'FAQ', path: '/faq' }, { label: 'Shipping Info', path: '/shipping' }]]].map(([title, links]: [string, unknown[]]) => (
            <div key={title as string}>
              <h3 className="text-white font-semibold mb-4">{title}</h3>
              <ul className="space-y-3">
                {(links as { label: string; path: string }[]).map(link => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-gray-400 hover:text-primary-400 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <hr className="my-12 border-dark-800" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2024 WheelVault. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(label => (
              <Link key={label} to={`/${label.toLowerCase().replace(/ /g, '-')}`} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
