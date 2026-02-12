import { useState, useEffect, useCallback } from "react";

export interface GuestCartItem {
  productId: string;
  quantity: number;
  needsInstallation: boolean;
  variationId?: string | null;
  variationLabel?: string | null;
  variationPrice?: string | null;
}

interface GuestCart {
  items: GuestCartItem[];
}

const GUEST_CART_KEY = "guest_cart";

function getStoredCart(): GuestCart {
  if (typeof window === "undefined") return { items: [] };
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error parsing guest cart:", e);
  }
  return { items: [] };
}

function saveCart(cart: GuestCart): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("guestCartUpdate"));
  } catch (e) {
    console.error("Error saving guest cart:", e);
  }
}

export function useGuestCart() {
  const [cart, setCart] = useState<GuestCart>({ items: [] });

  useEffect(() => {
    setCart(getStoredCart());

    const handleUpdate = () => {
      setCart(getStoredCart());
    };

    window.addEventListener("guestCartUpdate", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("guestCartUpdate", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addItem = useCallback(
    (item: GuestCartItem) => {
      const currentCart = getStoredCart();
      const existingIndex = currentCart.items.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.variationId === item.variationId
      );

      if (existingIndex >= 0) {
        currentCart.items[existingIndex].quantity += item.quantity;
        currentCart.items[existingIndex].needsInstallation = item.needsInstallation;
      } else {
        currentCart.items.push(item);
      }

      saveCart(currentCart);
      setCart(currentCart);
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, variationId?: string | null) => {
      const currentCart = getStoredCart();
      currentCart.items = currentCart.items.filter(
        (i) =>
          !(i.productId === productId && i.variationId === variationId)
      );
      saveCart(currentCart);
      setCart(currentCart);
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variationId?: string | null) => {
      const currentCart = getStoredCart();
      const existingIndex = currentCart.items.findIndex(
        (i) =>
          i.productId === productId &&
          i.variationId === variationId
      );

      if (existingIndex >= 0) {
        if (quantity <= 0) {
          currentCart.items.splice(existingIndex, 1);
        } else {
          currentCart.items[existingIndex].quantity = quantity;
        }
        saveCart(currentCart);
        setCart(currentCart);
      }
    },
    []
  );

  const clearCart = useCallback(() => {
    const emptyCart = { items: [] };
    saveCart(emptyCart);
    setCart(emptyCart);
  }, []);

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  return {
    cart,
    items: cart.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
  };
}

export function getGuestCartItems(): GuestCartItem[] {
  return getStoredCart().items;
}

export function clearGuestCart(): void {
  saveCart({ items: [] });
}
