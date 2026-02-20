import { useCartContext } from '../context/CartContext';
import AddToCartNotification from './AddToCartNotification';

const CartNotification = () => {
  const { notificationList } = useCartContext();

  return <AddToCartNotification notificationList={notificationList} />;
};

export default CartNotification;
