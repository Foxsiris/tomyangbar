import { motion } from 'framer-motion';

const Section = ({ 
  title, 
  subtitle, 
  children, 
  className = '', 
  titleClassName = '',
  subtitleClassName = '',
  delay = 0 
}) => {
  return (
    <section className={`section-padding ${className}`}>
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {title && (
              <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${titleClassName}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${subtitleClassName}`}>
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
