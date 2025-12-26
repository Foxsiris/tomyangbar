import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import Map from '../components/Map';
import { apiClient } from '../services/apiClient';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика отправки формы
    alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Телефон',
      value: '+7 (927) 112-65-00',
      link: 'tel:+79271126500'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      value: 'info@tomyangbar.ru',
      link: 'mailto:info@tomyangbar.ru'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Адрес',
      value: 'г. Саратов, ул. Чапаева, д. 89',
      link: null
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Часы работы',
      value: 'Пн-Вс: 11:00 - 23:00',
      link: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Контакты
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Свяжитесь с нами любым удобным способом. Мы всегда рады ответить на ваши вопросы!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg mb-4">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {info.title}
                </h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-gray-600">{info.value}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Map Section */}
      <Map />

      {/* Delivery Info */}
      <section className="section-padding bg-primary-600">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Доставка
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">45</div>
                <div className="text-primary-100">минут</div>
                <div className="text-sm text-primary-200 mt-1">время доставки</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">1000₽</div>
                <div className="text-primary-100">минимальный заказ</div>
                <div className="text-sm text-primary-200 mt-1">для доставки</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">Бесплатно</div>
                <div className="text-primary-100">доставка</div>
                <div className="text-sm text-primary-200 mt-1">от 1000₽</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Часто задаваемые вопросы
            </h2>
            <p className="text-lg text-gray-600">
              Ответы на популярные вопросы
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: 'Какое время доставки?',
                answer: 'Время доставки составляет от 45 минут в зависимости от загруженности и расстояния.'
              },
              {
                question: 'Есть ли минимальная сумма заказа?',
                answer: 'Да, минимальная сумма заказа для доставки составляет 1000 рублей.'
              },
              {
                question: 'Бесплатная ли доставка?',
                answer: 'Да, доставка бесплатная в зависимости от зоны: зелёная зона — от 1000₽, синяя — от 1700₽, оранжевая — от 2000₽, красная — от 3000₽.'
              },
              {
                question: 'Какие способы оплаты принимаются?',
                answer: 'Мы принимаем оплату наличными при получении заказа, а также картами при заказе через телефон.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vacancy Application Section */}
      <section className="section-padding bg-primary-600">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Присоединяйтесь к нашей команде
            </h2>
            <p className="text-lg text-primary-100">
              Мы всегда ищем талантливых людей для работы на кухне
            </p>
          </motion.div>

          <VacancyForm />
        </div>
      </section>
    </div>
  );
};

// Компонент формы для заявки на вакансию
const VacancyForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    age: '',
    work_experience: '',
    phone: '',
    specialty: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setSubmitMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await apiClient.submitVacancy(formData);

      setSubmitMessage({
        type: 'success',
        text: response.message || 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'
      });

      // Очищаем форму
      setFormData({
        first_name: '',
        last_name: '',
        middle_name: '',
        age: '',
        work_experience: '',
        phone: '',
        specialty: ''
      });
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: error.message || 'Произошла ошибка. Попробуйте позже.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-lg p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Имя */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
              Имя <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите ваше имя"
            />
          </div>

          {/* Фамилия */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
              Фамилия <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите вашу фамилию"
            />
          </div>

          {/* Отчество */}
          <div>
            <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-2">
              Отчество
            </label>
            <input
              type="text"
              id="middle_name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите ваше отчество (необязательно)"
            />
          </div>

          {/* Возраст */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Возраст <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="16"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите ваш возраст"
            />
          </div>

          {/* Стаж работы */}
          <div>
            <label htmlFor="work_experience" className="block text-sm font-medium text-gray-700 mb-2">
              Стаж работы (лет) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="work_experience"
              name="work_experience"
              value={formData.work_experience}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите стаж работы в годах"
            />
          </div>

          {/* Телефон */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Номер телефона <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+7 (XXX) XXX-XX-XX"
            />
          </div>
        </div>

        {/* Специальность */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
            Специальность на кухне <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="specialty"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Например: Повар, Су-шеф, Кондитер, Повар холодного цеха и т.д."
          />
        </div>

        {/* Сообщение об успехе/ошибке */}
        {submitMessage.text && (
          <div
            className={`p-4 rounded-lg ${
              submitMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Отправка...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Отправить заявку</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default Contact;
