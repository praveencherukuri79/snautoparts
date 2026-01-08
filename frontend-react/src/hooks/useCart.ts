import { useCallback, useMemo } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { cartAtom, notificationAtom } from '@/state/atoms';
import { Product, CartItem } from '@/types';

export interface UseCartReturn {
  /** Cart items */
  items: CartItem[];
  /** Total items count */
  itemCount: number;
  /** Subtotal price */
  subtotal: number;
  /** Loading state */
  isLoading: boolean;
  /** Add item to cart */
  addItem: (product: Product, quantity?: number) => void;
  /** Update item quantity */
  updateQuantity: (itemId: string, quantity: number) => void;
  /** Remove item from cart */
  removeItem: (itemId: string) => void;
  /** Clear all items */
  clearCart: () => void;
  /** Check if product is in cart */
  isInCart: (productId: string) => boolean;
  /** Get quantity of product in cart */
  getQuantity: (productId: string) => number;
}

/**
 * useCart Hook
 * 
 * Manages shopping cart state and provides cart-related functions.
 * 
 * @example
 * ```tsx
 * const { items, addItem, removeItem, subtotal } = useCart();
 * 
 * const handleAddToCart = () => {
 *   addItem(product, 1);
 * };
 * ```
 */
export function useCart(): UseCartReturn {
  const [items, setItems] = useRecoilState<CartItem[]>(cartAtom);
  const setNotification = useSetRecoilState(notificationAtom);

  // Calculate totals
  const itemCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.salePrice ?? item.price;
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  // Add item to cart
  const addItem = useCallback(
    (product: Product, quantity: number = 1) => {
      const existingIndex = items.findIndex(
        (item: CartItem) => item.productId === product.id
      );

      if (existingIndex >= 0) {
        // Update existing item
        setItems((prev: CartItem[]) =>
          prev.map((item: CartItem, index: number) =>
            index === existingIndex
              ? { ...item, quantity: Math.min(item.quantity + quantity, item.maxQuantity) }
              : item
          )
        );
        setNotification({
          id: `cart-${Date.now()}`,
          message: `Updated ${product.name} quantity in cart`,
          type: 'success',
        });
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `cart-${product.id}-${Date.now()}`,
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice,
          quantity,
          imageUrl: product.images?.[0]?.url,
          maxQuantity: product.stockQuantity,
        };

        setItems((prev: CartItem[]) => [...prev, newItem]);
        setNotification({
          id: `cart-${Date.now()}`,
          message: `Added ${product.name} to cart`,
          type: 'success',
        });
      }
    },
    [items, setItems, setNotification]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        // Remove if quantity is 0 or negative
        setItems((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== itemId));
        setNotification({
          id: `cart-${Date.now()}`,
          message: 'Item removed from cart',
          type: 'info',
        });
      } else {
        setItems((prev: CartItem[]) =>
          prev.map((item: CartItem) =>
            item.id === itemId
              ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
              : item
          )
        );
      }
    },
    [setItems, setNotification]
  );

  // Remove item
  const removeItem = useCallback(
    (itemId: string) => {
      const item = items.find((i: CartItem) => i.id === itemId);
      setItems((prev: CartItem[]) => prev.filter((i: CartItem) => i.id !== itemId));
      setNotification({
        id: `cart-${Date.now()}`,
        message: item ? `Removed ${item.name} from cart` : 'Item removed from cart',
        type: 'info',
      });
    },
    [items, setItems, setNotification]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
    setNotification({
      id: `cart-${Date.now()}`,
      message: 'Cart cleared',
      type: 'info',
    });
  }, [setItems, setNotification]);

  // Check if in cart
  const isInCart = useCallback(
    (productId: string): boolean => {
      return items.some((item: CartItem) => item.productId === productId);
    },
    [items]
  );

  // Get quantity
  const getQuantity = useCallback(
    (productId: string): number => {
      const item = items.find((i: CartItem) => i.productId === productId);
      return item?.quantity ?? 0;
    },
    [items]
  );

  return {
    items,
    itemCount,
    subtotal,
    isLoading: false, // No async operations in this implementation
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isInCart,
    getQuantity,
  };
}

export default useCart;
