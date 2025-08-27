import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Menu, X, Phone } from 'lucide-react';
import { useCartContext } from '../context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { getTotalItems, openCart } = useCartContext();

  const navItems = [
    { path: '/', label: 'Главная', kanji: 'ホーム' },
    { path: '/menu', label: 'Меню', kanji: 'メニュー' },
    { path: '/about', label: 'О нас', kanji: '私たち' },
    { path: '/contact', label: 'Контакты', kanji: '連絡先' }
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="text-3xl">🦆</div>
              <div className="flex flex-col">
                <div className="text-xl font-bold text-primary-600">Tom Yang Bar</div>
                <div className="text-xs text-gray-500 tracking-wider">トムヤンバー</div>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                  location.pathname === item.path
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>{item.label}</span>
                  <span className="text-xs text-gray-400 group-hover:text-primary-400 transition-colors">
                    {item.kanji}
                  </span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Contact and Cart */}
          <div className="flex items-center space-x-4">
            {/* Phone */}
            <a
              href="tel:+79271126500"
              className="hidden sm:flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Phone size={16} />
              <span className="text-sm font-medium">+7 (927) 112-65-00</span>
            </a>

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCart}
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart size={24} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{item.label}</span>
                    <span className="text-sm text-gray-400">{item.kanji}</span>
                  </div>
                </Link>
              ))}
              <a
                href="tel:+79271126500"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              >
                +7 (927) 112-65-00
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
