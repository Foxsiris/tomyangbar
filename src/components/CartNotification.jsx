import { useCartContext } from '../context/CartContext';
import AddToCartNotification from './AddToCartNotification';

const CartNotification = () => {
  const { notification } = useCartContext();

  return (
    <AddToCartNotification
      isVisible={notification.isVisible}
      onClose={() => {}}
      dishName={notification.dishName}
    />
  );
};

export default CartNotification;
