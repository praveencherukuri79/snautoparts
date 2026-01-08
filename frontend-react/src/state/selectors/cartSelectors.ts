import { selector } from 'recoil';
import { cartAtom } from '../atoms/cartAtom';

/**
 * Cart Total Items Selector
 */
export const cartTotalItemsSelector = selector<number>({
  key: 'cartTotalItemsSelector',
  get: ({ get }) => {
    const cart = get(cartAtom);
    return cart.reduce((total, item) => total + item.quantity, 0);
  },
});

/**
 * Cart Total Price Selector
 */
export const cartTotalPriceSelector = selector<number>({
  key: 'cartTotalPriceSelector',
  get: ({ get }) => {
    const cart = get(cartAtom);
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
});

/**
 * Cart Summary Selector
 */
export const cartSummarySelector = selector({
  key: 'cartSummarySelector',
  get: ({ get }) => {
    const cart = get(cartAtom);
    const totalItems = get(cartTotalItemsSelector);
    const subtotal = get(cartTotalPriceSelector);
    
    return {
      items: cart,
      totalItems,
      subtotal,
      isEmpty: cart.length === 0,
    };
  },
});
