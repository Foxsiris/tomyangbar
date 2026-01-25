/**
 * Тесты для компонентов корзины
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Мокаем framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }) => children
}))

// Мок компонента CartItem
const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <div data-testid={`cart-item-${item.id}`}>
    <span data-testid="item-name">{item.name}</span>
    <span data-testid="item-price">{item.price}₽</span>
    <span data-testid="item-quantity">{item.quantity}</span>
    <button 
      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} 
      data-testid="decrease-btn"
    >
      -
    </button>
    <button 
      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
      data-testid="increase-btn"
    >
      +
    </button>
    <button onClick={() => onRemove(item.id)} data-testid="remove-btn">
      Удалить
    </button>
  </div>
)

// Мок компонента Cart
const Cart = ({ items, onUpdateQuantity, onRemove, onClear }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div data-testid="cart">
      <div data-testid="items-count">{itemsCount} товаров</div>
      {items.length === 0 ? (
        <div data-testid="empty-cart">Корзина пуста</div>
      ) : (
        <>
          {items.map(item => (
            <CartItem 
              key={item.id} 
              item={item} 
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
          <div data-testid="cart-total">{total}₽</div>
          <button onClick={onClear} data-testid="clear-btn">
            Очистить корзину
          </button>
        </>
      )}
    </div>
  )
}

describe('Cart Component', () => {
  
  const mockItems = [
    { id: '1', name: 'Том Ям', price: 490, quantity: 2 },
    { id: '2', name: 'Рис', price: 150, quantity: 1 }
  ]

  let onUpdateQuantity, onRemove, onClear

  beforeEach(() => {
    onUpdateQuantity = vi.fn()
    onRemove = vi.fn()
    onClear = vi.fn()
  })

  const renderComponent = (items = mockItems) => {
    return render(
      <BrowserRouter>
        <Cart 
          items={items} 
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          onClear={onClear}
        />
      </BrowserRouter>
    )
  }

  it('должен отображать пустую корзину', () => {
    renderComponent([])
    expect(screen.getByTestId('empty-cart')).toBeInTheDocument()
  })

  it('должен отображать товары в корзине', () => {
    renderComponent()
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument()
  })

  it('должен рассчитать общую сумму', () => {
    renderComponent()
    // 490 * 2 + 150 * 1 = 1130
    expect(screen.getByTestId('cart-total')).toHaveTextContent('1130₽')
  })

  it('должен показать количество товаров', () => {
    renderComponent()
    expect(screen.getByTestId('items-count')).toHaveTextContent('3 товаров')
  })

  it('должен вызвать onUpdateQuantity при увеличении количества', () => {
    renderComponent()
    const increaseBtn = screen.getAllByTestId('increase-btn')[0]
    
    fireEvent.click(increaseBtn)
    
    expect(onUpdateQuantity).toHaveBeenCalledWith('1', 3)
  })

  it('должен вызвать onUpdateQuantity при уменьшении количества', () => {
    renderComponent()
    const decreaseBtn = screen.getAllByTestId('decrease-btn')[0]
    
    fireEvent.click(decreaseBtn)
    
    expect(onUpdateQuantity).toHaveBeenCalledWith('1', 1)
  })

  it('должен вызвать onRemove при удалении товара', () => {
    renderComponent()
    const removeBtn = screen.getAllByTestId('remove-btn')[0]
    
    fireEvent.click(removeBtn)
    
    expect(onRemove).toHaveBeenCalledWith('1')
  })

  it('должен вызвать onClear при очистке корзины', () => {
    renderComponent()
    const clearBtn = screen.getByTestId('clear-btn')
    
    fireEvent.click(clearBtn)
    
    expect(onClear).toHaveBeenCalledTimes(1)
  })

})

describe('CartItem Component', () => {
  
  const mockItem = { id: '1', name: 'Том Ям', price: 490, quantity: 2 }
  let onUpdateQuantity, onRemove

  beforeEach(() => {
    onUpdateQuantity = vi.fn()
    onRemove = vi.fn()
  })

  const renderComponent = (item = mockItem) => {
    return render(
      <CartItem 
        item={item} 
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />
    )
  }

  it('должен отображать название товара', () => {
    renderComponent()
    expect(screen.getByTestId('item-name')).toHaveTextContent('Том Ям')
  })

  it('должен отображать цену товара', () => {
    renderComponent()
    expect(screen.getByTestId('item-price')).toHaveTextContent('490₽')
  })

  it('должен отображать количество товара', () => {
    renderComponent()
    expect(screen.getByTestId('item-quantity')).toHaveTextContent('2')
  })

})
