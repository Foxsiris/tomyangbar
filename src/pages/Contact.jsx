import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import Map from '../components/Map';

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
      value: 'ул. Чапаева, 89, Саратов',
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
                answer: 'Да, доставка бесплатная при заказе от 1000 рублей. При заказе менее 1000 рублей стоимость доставки 200 рублей.'
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
    </div>
  );
};

export default Contact;
