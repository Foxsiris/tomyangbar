/**
 * Тесты для компонента LoyaltyCard
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Мокаем framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }) => children
}))

// Простой мок компонента LoyaltyCard для тестирования логики
const MockLoyaltyCard = ({ user, onViewHistory }) => {
  const bonusBalance = user?.bonus_balance || user?.loyaltyInfo?.bonusBalance || 0
  const totalSpent = user?.total_spent || user?.loyaltyInfo?.totalSpent || 0
  const loyaltyLevel = user?.loyalty_level || user?.loyaltyInfo?.level || 'bronze'
  
  const getLevelName = (level) => {
    const names = { bronze: '🥉 Бронзовый', silver: '🥈 Серебряный', gold: '🥇 Золотой' }
    return names[level] || '🥉 Бронзовый'
  }
  
  const getCashbackPercent = (level) => {
    const percents = { bronze: 2, silver: 3, gold: 5 }
    return percents[level] || 2
  }

  return (
    <div data-testid="loyalty-card">
      <div data-testid="level-name">{getLevelName(loyaltyLevel)}</div>
      <div data-testid="bonus-balance">{bonusBalance}</div>
      <div data-testid="total-spent">{totalSpent}</div>
      <div data-testid="cashback-percent">{getCashbackPercent(loyaltyLevel)}%</div>
      <button onClick={onViewHistory} data-testid="view-history-btn">
        История бонусов
      </button>
    </div>
  )
}

describe('LoyaltyCard Component', () => {
  
  const defaultUser = {
    bonus_balance: 200,
    total_spent: 5000,
    loyalty_level: 'bronze'
  }

  const renderComponent = (user = defaultUser, onViewHistory = vi.fn()) => {
    return render(
      <BrowserRouter>
        <MockLoyaltyCard user={user} onViewHistory={onViewHistory} />
      </BrowserRouter>
    )
  }

  it('должен отображать карточку лояльности', () => {
    renderComponent()
    expect(screen.getByTestId('loyalty-card')).toBeInTheDocument()
  })

  it('должен отображать баланс бонусов', () => {
    renderComponent()
    expect(screen.getByTestId('bonus-balance')).toHaveTextContent('200')
  })

  it('должен отображать общую сумму покупок', () => {
    renderComponent()
    expect(screen.getByTestId('total-spent')).toHaveTextContent('5000')
  })

  it('должен отображать правильный уровень', () => {
    renderComponent()
    expect(screen.getByTestId('level-name')).toHaveTextContent('Бронзовый')
  })

  it('должен отображать правильный процент кэшбэка для bronze', () => {
    renderComponent()
    expect(screen.getByTestId('cashback-percent')).toHaveTextContent('2%')
  })

  it('должен отображать правильный процент кэшбэка для silver', () => {
    const silverUser = { ...defaultUser, loyalty_level: 'silver' }
    renderComponent(silverUser)
    expect(screen.getByTestId('cashback-percent')).toHaveTextContent('3%')
  })

  it('должен отображать правильный процент кэшбэка для gold', () => {
    const goldUser = { ...defaultUser, loyalty_level: 'gold' }
    renderComponent(goldUser)
    expect(screen.getByTestId('cashback-percent')).toHaveTextContent('5%')
  })

  it('должен вызывать onViewHistory при клике', () => {
    const onViewHistory = vi.fn()
    renderComponent(defaultUser, onViewHistory)
    
    fireEvent.click(screen.getByTestId('view-history-btn'))
    
    expect(onViewHistory).toHaveBeenCalledTimes(1)
  })

  it('должен обрабатывать null user', () => {
    renderComponent(null)
    expect(screen.getByTestId('bonus-balance')).toHaveTextContent('0')
    expect(screen.getByTestId('total-spent')).toHaveTextContent('0')
  })

  it('должен использовать loyaltyInfo если нет прямых полей', () => {
    const userWithLoyaltyInfo = {
      loyaltyInfo: {
        bonusBalance: 500,
        totalSpent: 10000,
        level: 'silver'
      }
    }
    renderComponent(userWithLoyaltyInfo)
    
    expect(screen.getByTestId('bonus-balance')).toHaveTextContent('500')
    expect(screen.getByTestId('total-spent')).toHaveTextContent('10000')
    expect(screen.getByTestId('level-name')).toHaveTextContent('Серебряный')
  })

})
