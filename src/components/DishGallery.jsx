import { motion } from 'framer-motion';
import { Eye, Heart } from 'lucide-react';
import LazyImage from './LazyImage';

const DishGallery = () => {
  const dishes = [
    {
      id: 1,
      name: 'Ролл Филадельфия',
      category: 'Роллы',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      price: '450 ₽'
    },
    {
      id: 2,
      name: 'Суши с лососем',
      category: 'Суши',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      price: '380 ₽'
    },
    {
      id: 3,
      name: 'Вок с курицей',
      category: 'Вок',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      price: '520 ₽'
    },
    {
      id: 4,
      name: 'Ролл Калифорния',
      category: 'Роллы',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      price: '420 ₽'
    },
    {
      id: 5,
      name: 'Том Ям',
      category: 'Супы',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      price: '480 ₽'
    },
    {
      id: 6,
      name: 'Пад Тай',
      category: 'Паста',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      price: '550 ₽'
    }
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Галерея наших блюд
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Взгляните на наши вкусные блюда
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="relative overflow-hidden">
                <LazyImage
                  src={dish.image || '/vite.svg'}
                  alt={dish.name}
                  className="w-full h-48 group-hover:scale-110 transition-transform duration-300"
                  fallbackSrc="/vite.svg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-4">
                    <button className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
                      <Eye className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
                      <Heart className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    {dish.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white text-primary-600 font-semibold text-sm px-3 py-1 rounded-full">
                    {dish.price}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {dish.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  Вкусное блюдо из свежих ингредиентов
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="btn-primary inline-flex items-center">
            Смотреть все блюда
            <Eye className="ml-2 w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default DishGallery;
