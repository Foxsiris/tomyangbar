import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import ContactInfo from './ContactInfo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary-400">Tom Yang Bar</h3>
            <p className="text-gray-300 text-sm">
              Аутентичная азиатская кухня в современной атмосфере. 
              Мы предлагаем лучшие блюда японской, китайской и тайской кухни.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-400">Быстрые ссылки</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Меню
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  О нас
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-400">Контакты</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-primary-400" />
                <span className="text-gray-300 text-sm">+7 (927) 112-65-00</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-primary-400" />
                <span className="text-gray-300 text-sm">info@tomyangbar.ru</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-primary-400" />
                <span className="text-gray-300 text-sm">г. Москва, ул. Примерная, 123</span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-400">Часы работы</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-primary-400" />
                <div className="text-gray-300 text-sm">
                  <div>Пн-Вс: 11:00 - 23:00</div>
                  <div>Доставка: 11:00 - 22:00</div>
                </div>
              </div>
            </div>
            <div className="bg-primary-600 rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-2">Минимальный заказ</h5>
              <p className="text-sm">1000 ₽ для доставки</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Tom Yang Bar. Все права защищены.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                Политика конфиденциальности
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
