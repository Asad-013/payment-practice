// validators/index.ts

/**
 * Validate customer checkout input details
 */
export function validateCheckoutInput(data: any): { isValid: boolean; error?: string } {
  if (!data) return { isValid: false, error: 'Request body is empty.' };

  const { customerName, customerEmail, customerPhone, shippingAddress, items } = data;

  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
    return { isValid: false, error: 'Invalid customer name (must be at least 2 characters).' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customerEmail || !emailRegex.test(customerEmail)) {
    return { isValid: false, error: 'Invalid customer email address format.' };
  }

  if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim().length < 6) {
    return { isValid: false, error: 'Invalid phone number (must be at least 6 digits).' };
  }

  if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length < 5) {
    return { isValid: false, error: 'Invalid shipping address (must be at least 5 characters).' };
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { isValid: false, error: 'Cart is empty. Add items to checkout.' };
  }

  for (const item of items) {
    if (!item.product || !item.product.id || typeof item.quantity !== 'number' || item.quantity <= 0) {
      return { isValid: false, error: 'Invalid catalog items in shopping cart.' };
    }
  }

  return { isValid: true };
}

/**
 * Validate query parameter for payment status searches
 */
export function validatePaymentQuery(query: any): { isValid: boolean; error?: string } {
  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return { isValid: false, error: 'Invalid query parameter (must be at least 3 characters).' };
  }
  return { isValid: true };
}

/**
 * Validate product attributes for CRUD operations
 */
export function validateProductInput(data: any): { isValid: boolean; error?: string } {
  if (!data) return { isValid: false, error: 'Product data is empty.' };

  const { name, price, stock } = data;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, error: 'Product name is required.' };
  }

  if (typeof price !== 'number' || price < 0) {
    return { isValid: false, error: 'Product price must be a positive number.' };
  }

  if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
    return { isValid: false, error: 'Product stock must be a positive integer.' };
  }

  return { isValid: true };
}
