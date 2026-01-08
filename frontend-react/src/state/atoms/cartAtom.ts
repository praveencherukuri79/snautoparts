import { atom, AtomEffect } from 'recoil';

// Local cart item for client-side state (different from API CartItem)
export interface LocalCartItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  imageUrl?: string;
  maxQuantity: number;
}

// Local storage effect for cart persistence
const cartLocalStorageEffect: AtomEffect<LocalCartItem[]> = ({ setSelf, onSet }) => {
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
export const cartAtom = atom<LocalCartItem[]>({
  key: 'cartAtom',
  default: [],
  effects: [cartLocalStorageEffect],
});
