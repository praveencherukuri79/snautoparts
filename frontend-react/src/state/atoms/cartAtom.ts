import { atom } from 'recoil';
import type { CartItem } from '@/types';

// Local storage effect for cart persistence
const cartLocalStorageEffect = ({ setSelf, onSet }: { 
  setSelf: (value: CartItem[]) => void; 
  onSet: (callback: (newValue: CartItem[], _: CartItem[], isReset: boolean) => void) => void 
}) => {
  if (typeof window === 'undefined') return;
  
  const savedValue = localStorage.getItem('sn-cart');
  if (savedValue != null) {
    try {
      setSelf(JSON.parse(savedValue));
    } catch {
      setSelf([]);
    }
  }

  onSet((newValue, _, isReset) => {
    if (isReset) {
      localStorage.removeItem('sn-cart');
    } else {
      localStorage.setItem('sn-cart', JSON.stringify(newValue));
    }
  });
};

/**
 * Cart Atom
 * Manages shopping cart items with local storage persistence
 */
export const cartAtom = atom<CartItem[]>({
  key: 'cartAtom',
  default: [],
  effects: [cartLocalStorageEffect],
});
