// src/components/Footer.jsx

import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-white/70 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌿</span>
            <span className="font-display font-bold text-xl text-harvest-300">Agrozon</span>
          </div>
          <p className="text-sm font-body leading-relaxed">
            Connecting farmers directly to consumers across India. Fresh, fair, and fast.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-display font-semibold text-white mb-3 text-sm tracking-wide uppercase">
            Shop
          </h4>
          <ul className="space-y-1.5 text-sm font-body">
            {['Vegetables','Fruits','Grains','Dairy','Spices'].map(cat => (
              <li key={cat}>
                <Link to={`/?cat=${cat.toLowerCase()}`}
                  className="hover:text-harvest-300 transition-colors">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="font-display font-semibold text-white mb-3 text-sm tracking-wide uppercase">
            About
          </h4>
          <ul className="space-y-1.5 text-sm font-body">
            <li><span className="hover:text-harvest-300 cursor-pointer transition-colors">About Us</span></li>
            <li><span className="hover:text-harvest-300 cursor-pointer transition-colors">For Farmers</span></li>
            <li><span className="hover:text-harvest-300 cursor-pointer transition-colors">Contact</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs font-body">
        © {new Date().getFullYear()} Agrozon — Made with 🌾 for farmers of India
      </div>
    </footer>
  )
}
