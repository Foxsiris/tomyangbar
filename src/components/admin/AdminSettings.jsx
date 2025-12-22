import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  Settings, 
  Clock, 
  DollarSign, 
  Truck, 
  Bell, 
  Shield,
  Save,
  RotateCcw
} from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
          restaurant: {
        name: 'Tom Yang Bar',
        phone: '+7 (927) 112-65-00',
        email: 'info@tomyangbar.ru',
        address: 'г. Саратов, ул. Чапаева, д. 89',
      workingHours: {
        monday: { open: '11:00', close: '23:00', closed: false },
        tuesday: { open: '11:00', close: '23:00', closed: false },
        wednesday: { open: '11:00', close: '23:00', closed: false },
        thursday: { open: '11:00', close: '23:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '11:00', close: '23:00', closed: false },
        sunday: { open: '11:00', close: '23:00', closed: false }
      }
    },
    delivery: {
      enabled: true,
      minOrder: 1000,
      deliveryFee: 200,
      freeDeliveryThreshold: 1000,
      deliveryTime: 45,
      maxDistance: 10
    },
    notifications: {
      newOrders: true,
      orderUpdates: true,
      lowStock: true,
      dailyReport: true,
      email: 'admin@tomyangbar.ru'
    },
    payment: {
      cash: true,
      card: true,
      online: false
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      restaurant: {
        ...prev.restaurant,
        workingHours: {
          ...prev.restaurant.workingHours,
          [day]: {
            ...prev.restaurant.workingHours[day],
            [field]: value
          }
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Имитация сохранения
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Настройки успешно сохранены!');
  };

  const handleReset = () => {
    if (window.confirm('Вы уверены, что хотите сбросить все настройки?')) {
      // Здесь можно добавить логику сброса к значениям по умолчанию
      alert('Настройки сброшены к значениям по умолчанию');
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Понедельник' },
    { key: 'tuesday', label: 'Вторник' },
    { key: 'wednesday', label: 'Среда' },
    { key: 'thursday', label: 'Четверг' },
    { key: 'friday', label: 'Пятница' },
    { key: 'saturday', label: 'Суббота' },
    { key: 'sunday', label: 'Воскресенье' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Настройки ресторана</h2>
        <p className="text-gray-600">Управляйте настройками и конфигурацией</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Restaurant Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Информация о ресторане</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название ресторана
              </label>
              <input
                type="text"
                value={settings.restaurant.name}
                onChange={(e) => handleSettingChange('restaurant', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                value={settings.restaurant.phone}
                onChange={(e) => handleSettingChange('restaurant', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.restaurant.email}
                onChange={(e) => handleSettingChange('restaurant', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес
              </label>
              <input
                type="text"
                value={settings.restaurant.address}
                onChange={(e) => handleSettingChange('restaurant', 'address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Working Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Часы работы</h3>
          </div>
          
          <div className="space-y-3">
            {daysOfWeek.map((day) => (
              <div key={day.key} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-700">
                  {day.label}
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!settings.restaurant.workingHours[day.key].closed}
                    onChange={(e) => handleWorkingHoursChange(day.key, 'closed', !e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Открыто</span>
                </label>
                
                {!settings.restaurant.workingHours[day.key].closed && (
                  <>
                    <input
                      type="time"
                      value={settings.restaurant.workingHours[day.key].open}
                      onChange={(e) => handleWorkingHoursChange(day.key, 'open', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="time"
                      value={settings.restaurant.workingHours[day.key].close}
                      onChange={(e) => handleWorkingHoursChange(day.key, 'close', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Delivery Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <Truck className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Настройки доставки</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.delivery.enabled}
                  onChange={(e) => handleSettingChange('delivery', 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Включить доставку</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Минимальная сумма заказа (₽)
              </label>
              <input
                type="number"
                value={settings.delivery.minOrder}
                onChange={(e) => handleSettingChange('delivery', 'minOrder', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Стоимость доставки (₽)
              </label>
              <input
                type="number"
                value={settings.delivery.deliveryFee}
                onChange={(e) => handleSettingChange('delivery', 'deliveryFee', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бесплатная доставка от (₽)
              </label>
              <input
                type="number"
                value={settings.delivery.freeDeliveryThreshold}
                onChange={(e) => handleSettingChange('delivery', 'freeDeliveryThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Время доставки (мин)
              </label>
              <input
                type="number"
                value={settings.delivery.deliveryTime}
                onChange={(e) => handleSettingChange('delivery', 'deliveryTime', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Максимальное расстояние (км)
              </label>
              <input
                type="number"
                value={settings.delivery.maxDistance}
                onChange={(e) => handleSettingChange('delivery', 'maxDistance', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Payment Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Способы оплаты</h3>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.payment.cash}
                onChange={(e) => handleSettingChange('payment', 'cash', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Наличные при получении</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.payment.card}
                onChange={(e) => handleSettingChange('payment', 'card', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Банковская карта при получении</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.payment.online}
                onChange={(e) => handleSettingChange('payment', 'online', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Онлайн оплата</span>
            </label>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.newOrders}
                  onChange={(e) => handleSettingChange('notifications', 'newOrders', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Новые заказы</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.orderUpdates}
                  onChange={(e) => handleSettingChange('notifications', 'orderUpdates', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Обновления заказов</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.lowStock}
                  onChange={(e) => handleSettingChange('notifications', 'lowStock', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Низкий запас ингредиентов</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.dailyReport}
                  onChange={(e) => handleSettingChange('notifications', 'dailyReport', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Ежедневный отчет</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email для уведомлений
              </label>
              <input
                type="email"
                value={settings.notifications.email}
                onChange={(e) => handleSettingChange('notifications', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end space-x-4"
      >
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Сбросить
        </button>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
