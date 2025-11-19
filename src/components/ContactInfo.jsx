import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const ContactInfo = () => {
  const contactData = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: 'Телефон',
      value: '+7 (927) 112-65-00',
      link: 'tel:+79271126500'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Адрес',
      value: 'г. Москва, ул. Примерная, 123',
      link: 'https://maps.google.com'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Часы работы',
      value: 'Пн-Вс: 11:00 - 23:00',
      link: null
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'Email',
      value: 'info@tomyangbar.ru',
      link: 'mailto:info@tomyangbar.ru'
    }
  ];

  const socialLinks = [
    { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
    { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' }
  ];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Контактная информация */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Свяжитесь с нами
            </h3>
            <div className="space-y-4">
              {contactData.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <div className="text-primary-600">
                    {contact.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{contact.title}</p>
                    {contact.link ? (
                      <a
                        href={contact.link}
                        className="text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <p className="text-gray-900">{contact.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Быстрые ссылки
            </h3>
            <ul className="space-y-2">
              {['Меню', 'О нас', 'Доставка', 'Акции', 'Отзывы'].map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <a
                    href="#"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Социальные сети */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Мы в соцсетях
            </h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1 }}
                  className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
