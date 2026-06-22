import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart.service';
import { Product } from '../../services/booking-public.service';

const STORAGE_KEY = 'simplifica_cart_v1';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  name: 'Taza corporativa',
  description: 'Una taza bonita',
  price: 12,
  stock_quantity: 50,
  brand: 'Acme',
  model: 'MX-1',
  barcode: null,
  location: null,
  category_id: 'cat-1',
  category_name: 'Merchandising',
  ...overrides,
});

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    cart = TestBed.inject(CartService);
  });

  afterEach(() => localStorage.clear());

  it('starts empty', () => {
    expect(cart.snapshot().items).toEqual([]);
    expect(cart.itemCount()).toBe(0);
    expect(cart.distinctCount()).toBe(0);
    expect(cart.total()).toBe(0);
  });

  describe('add()', () => {
    it('adds a new product with quantity 1', () => {
      cart.add(mockProduct());
      expect(cart.distinctCount()).toBe(1);
      expect(cart.itemCount()).toBe(1);
      expect(cart.quantityOf('p-1')).toBe(1);
    });

    it('bumps quantity of an existing product instead of duplicating', () => {
      const p = mockProduct();
      cart.add(p);
      cart.add(p);
      cart.add(p);
      expect(cart.distinctCount()).toBe(1);
      expect(cart.itemCount()).toBe(3);
    });

    it('preserves the name and price from the first add (price snapshot)', () => {
      const p1 = mockProduct({ price: 12 });
      const p2 = mockProduct({ price: 15 }); // same id, different price
      cart.add(p1);
      cart.add(p2);
      // The displayed line should keep the first-known price. This is
      // important because variant prices can change between sessions and
      // we don't want a stale cart to suddenly re-price on add.
      const items = cart.snapshot().items;
      expect(items[0].price).toBe(12);
    });

    it('handles null price (the total skips it)', () => {
      const p = mockProduct({ price: null });
      cart.add(p);
      expect(cart.total()).toBe(0);
      expect(cart.quantityOf('p-1')).toBe(1);
    });
  });

  describe('setQuantity()', () => {
    beforeEach(() => {
      cart.add(mockProduct());
      cart.add(mockProduct());
      cart.add(mockProduct());
    });

    it('updates the quantity', () => {
      cart.setQuantity('p-1', 5);
      expect(cart.quantityOf('p-1')).toBe(5);
      expect(cart.itemCount()).toBe(5);
    });

    it('removes the line when set to 0', () => {
      cart.setQuantity('p-1', 0);
      expect(cart.distinctCount()).toBe(0);
    });

    it('removes the line when set to a negative value', () => {
      cart.setQuantity('p-1', -3);
      expect(cart.distinctCount()).toBe(0);
    });

    it('ignores updates for products that are not in the cart', () => {
      cart.setQuantity('does-not-exist', 5);
      expect(cart.distinctCount()).toBe(1); // only the original
    });
  });

  describe('remove()', () => {
    it('removes a specific product', () => {
      cart.add(mockProduct({ id: 'a' }));
      cart.add(mockProduct({ id: 'b' }));
      cart.remove('a');
      expect(cart.distinctCount()).toBe(1);
      expect(cart.has('b')).toBe(true);
    });

    it('is a no-op for products that are not in the cart', () => {
      cart.add(mockProduct());
      cart.remove('does-not-exist');
      expect(cart.distinctCount()).toBe(1);
    });
  });

  describe('clear()', () => {
    it('empties the cart', () => {
      cart.add(mockProduct());
      cart.add(mockProduct({ id: 'b' }));
      cart.clear();
      expect(cart.distinctCount()).toBe(0);
      expect(cart.itemCount()).toBe(0);
    });
  });

  describe('total()', () => {
    it('sums price * quantity across lines', () => {
      cart.add(mockProduct({ id: 'a', price: 10 }));
      cart.add(mockProduct({ id: 'a', price: 10 })); // bump
      cart.add(mockProduct({ id: 'b', price: 5 }));
      cart.add(mockProduct({ id: 'c', price: null })); // null price
      expect(cart.total()).toBe(25); // 20 + 5 + 0
    });
  });

  describe('persistence', () => {
    it('persists to localStorage on every change', () => {
      cart.add(mockProduct());
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
      expect(parsed[0].productId).toBe('p-1');
    });

    it('rehydrates on a fresh service instance', () => {
      cart.add(mockProduct());
      cart.add(mockProduct({ id: 'b' }));
      // Re-inject the service. Angular's providedIn:'root' should
      // rehydrate from localStorage on construction.
      const cart2 = TestBed.inject(CartService);
      expect(cart2.distinctCount()).toBe(2);
      expect(cart2.itemCount()).toBe(2);
    });

    it('drops malformed items on load (defensive)', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([
          { productId: 'good', name: 'Good', quantity: 1 },
          { productId: 'bad' }, // missing fields
          'a string', // wrong type entirely
          null,
          { productId: 'zero', name: 'Zero', quantity: 0 }, // invalid quantity
          { productId: 'negative', name: 'Neg', quantity: -1 }, // invalid quantity
        ]),
      );
      const cart2 = TestBed.inject(CartService);
      const items = cart2.snapshot().items;
      expect(items.length).toBe(1);
      expect(items[0].productId).toBe('good');
    });

    it('handles a missing or corrupt localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'not json at all');
      // Should not throw — the service starts empty.
      const cart2 = TestBed.inject(CartService);
      expect(cart2.snapshot().items).toEqual([]);
    });
  });

  describe('soft cap (MAX_ITEMS lines)', () => {
    it('stops adding new lines past 50 distinct products', () => {
      // Insert 50 distinct products, then try to add a 51st.
      for (let i = 0; i < 50; i++) {
        cart.add(mockProduct({ id: `p-${i}` }));
      }
      cart.add(mockProduct({ id: 'p-50-extra' }));
      // The 51st should not be added (line cap is hit).
      // Bumping an existing product is still allowed.
      const items = cart.snapshot().items;
      expect(items.length).toBe(50);
      expect(cart.has('p-50-extra')).toBe(false);
      // Bump an existing product — should still work.
      cart.add(mockProduct({ id: 'p-0' }));
      expect(cart.quantityOf('p-0')).toBe(2);
    });
  });
});
