import { motion } from 'framer-motion';
import { useUISettings } from '../context/UISettingsContext';

const chefs = [
  {
    id: 1,
    name: 'Илья Карпюк',
    position: 'ШЕФ-ПОВАР',
    description: 'Паназиатская кухня с авторским почерком: воки, рамены, димсамы и роллы. Баланс вкусов, свежие ингредиенты и любовь к деталям.',
    image: '/chef1.png'
  }
];

const TeamSection = () => {
  const { settings: uiSettings } = useUISettings();
  const anim = uiSettings.homeBlockAnimations
    ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } }
    : { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } };
  const cardAnim = (delay) => uiSettings.homeBlockAnimations
    ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay }, viewport: { once: true } }
    : { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } };

  return (
    <section className="section-padding bg-primary-600">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...anim}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Наша команда
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Мастерство, страсть и преданность своему делу
          </p>
        </motion.div>

        <div className="flex justify-center">
          {chefs.map((chef, index) => (
            <motion.div
              key={chef.id}
              {...cardAnim(index * 0.2)}
              className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-sm"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=Chef';
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {chef.name}
                </h3>
                <p className="text-sm text-primary uppercase tracking-wider mb-4 font-medium">
                  {chef.position}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {chef.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
