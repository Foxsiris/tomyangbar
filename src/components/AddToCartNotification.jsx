import { CheckCircle, X } from 'lucide-react';

const AddToCartNotification = ({ isVisible, onClose, dishName }) => {
  if (!isVisible) {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: 'rgba(16, 185, 129, 0.95)',
      color: '#ffffff',
      padding: '16px 20px',
      borderRadius: '8px',
      zIndex: 99999,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontSize: '14px',
      fontWeight: '400',
      maxWidth: '280px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '20px', 
          height: '20px', 
          borderRadius: '50%', 
          background: '#10b981', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '12px',
          color: 'white'
        }}>
          ✓
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '500', marginBottom: '2px', fontSize: '13px' }}>
            {dishName}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            добавлено в корзину
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            color: 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '16px',
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AddToCartNotification;
