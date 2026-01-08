import { useCallback, useMemo } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { cartAtom, notificationAtom, LocalCartItem } from '@/state/atoms';
import type { ProductDetail } from '@/models';

export interface UseCartReturn {
  /** Cart items */
  items: LocalCartItem[];
  /** Total items count */
  itemCount: number;
  /** Subtotal price */
  subtotal: number;
  /** Loading state */
  isLoading: boolean;
  /** Add item to cart */
  addItem: (product: ProductDetail, quantity?: number) => void;
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
  const [items, setItems] = useRecoilState<LocalCartItem[]>(cartAtom);
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
    (product: ProductDetail, quantity: number = 1) => {
      const existingIndex = items.findIndex(
        (item: LocalCartItem) => item.productId === product.id
      );

      if (existingIndex >= 0) {
        // Update existing item
        setItems((prev: LocalCartItem[]) =>
          prev.map((item: LocalCartItem, index: number) =>
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
        // Add new item - convert API ProductDetail to LocalCartItem
        const price = parseFloat(product.price);
        const comparePrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : undefined;
        
        const newItem: LocalCartItem = {
          id: `cart-${product.id}-${Date.now()}`,
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: comparePrice ?? price,
          salePrice: comparePrice ? price : undefined,
          quantity,
          imageUrl: product.imageUrl ?? product.images?.[0],
          maxQuantity: product.stockQuantity,
        };

        setItems((prev: LocalCartItem[]) => [...prev, newItem]);
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
        setItems((prev: LocalCartItem[]) => prev.filter((item: LocalCartItem) => item.id !== itemId));
        setNotification({
          id: `cart-${Date.now()}`,
          message: 'Item removed from cart',
          type: 'info',
        });
      } else {
        setItems((prev: LocalCartItem[]) =>
          prev.map((item: LocalCartItem) =>
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
      const item = items.find((i: LocalCartItem) => i.id === itemId);
      setItems((prev: LocalCartItem[]) => prev.filter((i: LocalCartItem) => i.id !== itemId));
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
      return items.some((item: LocalCartItem) => item.productId === productId);
    },
    [items]
  );

  // Get quantity
  const getQuantity = useCallback(
    (productId: string): number => {
      const item = items.find((i: LocalCartItem) => i.productId === productId);
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
