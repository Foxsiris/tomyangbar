import { useCartContext } from '../context/CartContext';
import AddToCartNotification from './AddToCartNotification';

const CartNotification = () => {
  const { notification } = useCartContext();

  const handleClose = () => {
    // Можно добавить функцию для ручного закрытия уведомления
    // Пока уведомление автоматически скрывается через 3 секунды
  };

  return (
    <AddToCartNotification
      isVisible={notification.isVisible}
      onClose={handleClose}
      dishName={notification.dishName}
    />
  );
};

export default CartNotification;
