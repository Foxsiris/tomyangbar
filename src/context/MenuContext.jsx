import { createContext, useContext } from 'react';
import { useMenu } from '../hooks/useMenu';

const MenuContext = createContext();

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
};

export const MenuProvider = ({ children }) => {
  const menuState = useMenu();

  return (
    <MenuContext.Provider value={menuState}>
      {children}
    </MenuContext.Provider>
  );
};
