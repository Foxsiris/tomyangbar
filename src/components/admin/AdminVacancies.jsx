import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, Briefcase, ChefHat, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

const AdminVacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadVacancies();
  }, [statusFilter]);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await apiClient.get(`/api/vacancies${params}`);
      setVacancies(response.vacancies || []);
    } catch (error) {
      console.error('Error loading vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus, notes = '') => {
    try {
      await apiClient.updateVacancyStatus(id, newStatus, notes);
      await loadVacancies();
      if (selectedVacancy?.id === id) {
        setSelectedVacancy({ ...selectedVacancy, status: newStatus, notes });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: 'Новая', color: 'bg-blue-100 text-blue-800', icon: Clock },
      viewed: { label: 'Просмотрена', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
      contacted: { label: 'Связались', color: 'bg-purple-100 text-purple-800', icon: Phone },
      rejected: { label: 'Отклонена', color: 'bg-red-100 text-red-800', icon: XCircle },
      hired: { label: 'Принят', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
      </span>
    );
  };

  const statusCounts = {
    all: vacancies.length,
    new: vacancies.filter(v => v.status === 'new').length,
    viewed: vacancies.filter(v => v.status === 'viewed').length,
    contacted: vacancies.filter(v => v.status === 'contacted').length,
    rejected: vacancies.filter(v => v.status === 'rejected').length,
    hired: vacancies.filter(v => v.status === 'hired').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Заявки на вакансии</h2>
        
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-4 rounded-lg text-center transition-colors ${
                statusFilter === status
                  ? 'bg-primary-100 border-2 border-primary-600'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {status === 'all' ? 'Все' : 
                 status === 'new' ? 'Новые' :
                 status === 'viewed' ? 'Просмотренные' :
                 status === 'contacted' ? 'Связались' :
                 status === 'rejected' ? 'Отклоненные' :
                 'Принятые'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Список заявок */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - список */}
        <div className="lg:col-span-2 space-y-4">
          {vacancies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Нет заявок</p>
            </div>
          ) : (
            vacancies.map((vacancy) => (
              <motion.div
                key={vacancy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedVacancy(vacancy)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vacancy.last_name} {vacancy.first_name} {vacancy.middle_name}
                    </h3>
                    <p className="text-sm text-gray-500">{vacancy.specialty}</p>
                  </div>
                  {getStatusBadge(vacancy.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{vacancy.age} лет</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{vacancy.work_experience} лет опыта</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 col-span-2">
                    <Phone className="w-4 h-4" />
                    <span>{vacancy.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500 text-xs col-span-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(vacancy.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Правая колонка - детали */}
        <div className="lg:col-span-1">
          {selectedVacancy ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 sticky top-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Детали заявки</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">ФИО</label>
                  <p className="text-gray-900">
                    {selectedVacancy.last_name} {selectedVacancy.first_name} {selectedVacancy.middle_name || ''}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Возраст</label>
                  <p className="text-gray-900">{selectedVacancy.age} лет</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Стаж работы</label>
                  <p className="text-gray-900">{selectedVacancy.work_experience} лет</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Телефон</label>
                  <p className="text-gray-900">
                    <a href={`tel:${selectedVacancy.phone}`} className="text-primary-600 hover:underline">
                      {selectedVacancy.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Специальность</label>
                  <p className="text-gray-900">{selectedVacancy.specialty}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Статус</label>
                  <div className="mt-1">{getStatusBadge(selectedVacancy.status)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Дата подачи</label>
                  <p className="text-gray-900">
                    {new Date(selectedVacancy.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {selectedVacancy.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Заметки</label>
                    <p className="text-gray-900">{selectedVacancy.notes}</p>
                  </div>
                )}
              </div>

              {/* Действия */}
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Изменить статус:</p>
                
                {selectedVacancy.status !== 'viewed' && (
                  <button
                    onClick={() => updateStatus(selectedVacancy.id, 'viewed')}
                    className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                  >
                    Отметить как просмотренную
                  </button>
                )}

                {selectedVacancy.status !== 'contacted' && (
                  <button
                    onClick={() => updateStatus(selectedVacancy.id, 'contacted')}
                    className="w-full px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    Отметить как связались
                  </button>
                )}

                {selectedVacancy.status !== 'hired' && (
                  <button
                    onClick={() => updateStatus(selectedVacancy.id, 'hired')}
                    className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    Принять на работу
                  </button>
                )}

                {selectedVacancy.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      if (confirm('Вы уверены, что хотите отклонить эту заявку?')) {
                        updateStatus(selectedVacancy.id, 'rejected');
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Отклонить
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Выберите заявку для просмотра деталей</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVacancies;

