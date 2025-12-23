import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { SupabaseUserProvider } from './context/SupabaseUserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidePanel from './components/CartSidePanel';
import CartNotification from './components/CartNotification';
import FloatingCart from './components/FloatingCart';
import TelegramPopup from './components/TelegramPopup';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import SBPSuccess from './pages/SBPSuccess';
import SBPCancel from './pages/SBPCancel';

function App() {
  return (
    <SupabaseUserProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />
                <Route path="/payment/sbp/success" element={<SBPSuccess />} />
                <Route path="/payment/sbp/cancel" element={<SBPCancel />} />
              </Routes>
            </motion.main>
            <Footer />
            <CartSidePanel />
            <CartNotification />
            <FloatingCart />
            <TelegramPopup />
          </div>
        </Router>
      </CartProvider>
    </SupabaseUserProvider>
  );
}

export default App;
