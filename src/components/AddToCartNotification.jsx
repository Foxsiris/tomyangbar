import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

const CartNotificationItem = ({ dishName, color }) => (
  <figure
    className="relative mx-auto min-h-fit w-full max-w-[320px] cursor-default overflow-hidden rounded-2xl p-4 transition-all duration-200 ease-in-out hover:scale-[102%] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]"
  >
    <div className="flex flex-row items-center gap-3">
      <div
        className="flex size-10 items-center justify-center rounded-2xl text-white"
        style={{ backgroundColor: color }}
      >
        <ShoppingBag className="w-5 h-5" />
      </div>
      <div className="flex flex-col overflow-hidden flex-1">
        <figcaption className="text-sm font-medium text-gray-900 truncate">
          {dishName}
        </figcaption>
        <p className="text-xs text-gray-500">добавлено в корзину</p>
      </div>
    </div>
  </figure>
);

const AddToCartNotification = ({ notificationList }) => {
  if (!notificationList || notificationList.length === 0) return null;

  const color = '#10b981';

  return (
    <div
      className="fixed top-4 right-8 sm:right-12 md:right-16 z-[99999] max-h-[calc(100vh-2rem)] overflow-x-hidden overflow-y-auto max-w-[min(320px,calc(100vw-2rem))] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {notificationList.map((item) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 40 }}
              layout
            >
              <CartNotificationItem
                dishName={item.dishName}
                color={color}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AddToCartNotification;
