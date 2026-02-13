declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export interface DataLayerProduct {
  id: string;
  name: string;
  price: string | number;
  brand?: string;
  category?: string;
  quantity?: number;
  listId?: string;
  listName?: string;
  sku?: string | null;
}

function getDataLayer(): Record<string, unknown>[] {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function formatItem(product: DataLayerProduct, index?: number): Record<string, unknown> {
  const item: Record<string, unknown> = {
    item_id: product.sku || product.id,
    item_name: product.name,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
  };

  if (product.brand) item.item_brand = product.brand;
  if (product.category) item.item_category = product.category;
  if (product.quantity !== undefined) item.quantity = product.quantity;
  if (product.listId) item.item_list_id = product.listId;
  if (product.listName) item.item_list_name = product.listName;
  if (index !== undefined) item.index = index;

  return item;
}

export function trackViewItemList(products: DataLayerProduct[], listId: string, listName: string) {
  try {
    const dl = getDataLayer();
    dl.push({ ecommerce: null });
    dl.push({
      event: 'view_item_list',
      ecommerce: {
        item_list_id: listId,
        item_list_name: listName,
        items: products.map((p, i) => formatItem({ ...p, listId, listName }, i)),
      },
    });
  } catch (_) {}
}

export function trackSelectItem(product: DataLayerProduct, listId?: string, listName?: string) {
  try {
    const dl = getDataLayer();
    dl.push({ ecommerce: null });
    dl.push({
      event: 'select_item',
      ecommerce: {
        item_list_id: listId,
        item_list_name: listName,
        items: [formatItem({ ...product, listId, listName })],
      },
    });
  } catch (_) {}
}

export function trackViewItem(product: DataLayerProduct) {
  try {
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const dl = getDataLayer();
    dl.push({ ecommerce: null });
    dl.push({
      event: 'view_item',
      ecommerce: {
        currency: 'EUR',
        value: price,
        items: [formatItem(product)],
      },
    });
  } catch (_) {}
}

export function trackAddToCart(product: DataLayerProduct) {
  try {
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const qty = product.quantity || 1;
    const dl = getDataLayer();
    dl.push({ ecommerce: null });
    dl.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'EUR',
        value: price * qty,
        items: [formatItem({ ...product, quantity: qty })],
      },
    });
  } catch (_) {}
}

export function trackRemoveFromCart(product: DataLayerProduct) {
  try {
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const qty = product.quantity || 1;
    const dl = getDataLayer();
    dl.push({ ecommerce: null });
    dl.push({
      event: 'remove_from_cart',
      ecommerce: {
        currency: 'EUR',
        value: price * qty,
        items: [formatItem({ ...product, quantity: qty })],
      },
    });
  } catch (_) {}
}

export function trackBeginCheckout(products: DataLayerProduct[], value: number) {
  try {
    const dl = getDataLayer();
    dl.push({ ecommerce: null });
    dl.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'EUR',
        value,
        items: products.map((p, i) => formatItem(p, i)),
      },
    });
  } catch (_) {}
}

export function trackPurchase(
  transactionId: string,
  value: number,
  tax: number,
  shipping: number,
  products: DataLayerProduct[],
) {
  try {
    const dl = getDataLayer();
    dl.push({ ecommerce: null });
    dl.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: transactionId,
        value,
        currency: 'EUR',
        tax,
        shipping,
        items: products.map((p, i) => formatItem(p, i)),
      },
    });
  } catch (_) {}
}
