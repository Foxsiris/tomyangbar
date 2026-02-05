import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  RefreshCw, 
  Trash2, 
  Globe, 
  Clock,
  AlertTriangle,
  Server
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const RequestMonitor = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/request-stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetStats = async () => {
    try {
      await fetch(`${API_BASE}/api/admin/request-stats/reset`, { method: 'POST' });
      await fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStats();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000); // Обновляем каждые 5 секунд
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Загрузка статистики запросов...</div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center text-red-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>Ошибка загрузки: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Мониторинг запросов</h2>
          <p className="text-gray-600">Статистика запросов к серверу в реальном времени</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Автообновление
          </label>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
          <button
            onClick={resetStats}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Сбросить
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего запросов</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalRequests?.toLocaleString() || 0}</p>
            </div>
            <Server className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Запросов/мин</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.requestsPerMinute || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Уникальных IP</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.uniqueIps || 0}</p>
            </div>
            <Globe className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.uptimeMinutes || 0} мин</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Top IPs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ IP-адресов по количеству запросов</h3>
        {stats?.topIps?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">IP</th>
                  <th className="text-right py-2 px-4">Запросов</th>
                  <th className="text-left py-2 px-4">Первый запрос</th>
                  <th className="text-left py-2 px-4">Последний запрос</th>
                  <th className="text-left py-2 px-4">Топ путей</th>
                </tr>
              </thead>
              <tbody>
                {stats.topIps.map((ip, index) => (
                  <tr key={index} className={`border-b ${ip.totalRequests > 1000 ? 'bg-red-50' : ip.totalRequests > 500 ? 'bg-yellow-50' : ''}`}>
                    <td className="py-2 px-4 font-mono">
                      {ip.ip}
                      {ip.totalRequests > 1000 && (
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">ПОДОЗРИТЕЛЬНО</span>
                      )}
                    </td>
                    <td className="text-right py-2 px-4 font-bold">{ip.totalRequests.toLocaleString()}</td>
                    <td className="py-2 px-4 text-gray-500">{new Date(ip.firstSeen).toLocaleTimeString()}</td>
                    <td className="py-2 px-4 text-gray-500">{new Date(ip.lastSeen).toLocaleTimeString()}</td>
                    <td className="py-2 px-4">
                      <div className="flex flex-wrap gap-1">
                        {ip.topPaths?.slice(0, 3).map((p, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {p.path} ({p.count})
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Нет данных</p>
        )}
      </div>

      {/* Top Paths */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ запрашиваемых путей</h3>
        {stats?.topPaths?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.topPaths.map((path, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-800 truncate flex-1">{path.path}</code>
                  <span className="ml-2 font-bold text-blue-600">{path.count.toLocaleString()}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((path.count / (stats.topPaths[0]?.count || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Нет данных</p>
        )}
      </div>

      {/* Recent Requests from Top IP */}
      {stats?.topIps?.[0]?.recentRequests?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Последние запросы от топ IP ({stats.topIps[0].ip})
          </h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Время</th>
                  <th className="text-left py-2 px-4">Метод</th>
                  <th className="text-left py-2 px-4">Путь</th>
                </tr>
              </thead>
              <tbody>
                {stats.topIps[0].recentRequests.map((req, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-gray-500">{new Date(req.time).toLocaleTimeString()}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.method === 'GET' ? 'bg-green-100 text-green-800' :
                        req.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {req.method}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-mono">{req.path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestMonitor;
