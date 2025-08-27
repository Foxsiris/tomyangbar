import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Settings, 
  Users, 
  TrendingUp,
  Home,
  LogOut
} from 'lucide-react';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminMenu from '../components/admin/AdminMenu';
import AdminOrders from '../components/admin/AdminOrders';
import AdminStats from '../components/admin/AdminStats';
import AdminSettings from '../components/admin/AdminSettings';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Панель управления', icon: Home, kanji: 'ダッシュボード' },
    { id: 'menu', label: 'Управление меню', icon: Package, kanji: 'メニュー管理' },
    { id: 'orders', label: 'Заказы', icon: ShoppingCart, kanji: '注文' },
    { id: 'stats', label: 'Статистика', icon: BarChart3, kanji: '統計' },
    { id: 'settings', label: 'Настройки', icon: Settings, kanji: '設定' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'menu':
        return <AdminMenu />;
      case 'orders':
        return <AdminOrders />;
      case 'stats':
        return <AdminStats />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🦆</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tom Yang Bar</h1>
                <p className="text-sm text-gray-500">Админ-панель</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Администратор</span>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-lg p-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-400">{item.kanji}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
