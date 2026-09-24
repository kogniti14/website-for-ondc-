# Firebase Realtime Database Developer Reference & API Guide
# Kogniti Minds Private Limited

## 1. Importing Centralized Firebase Services

Always import from `@/services/firebase`:

```typescript
import { db, auth, storage } from '@/services/firebase';
import { ref, get, set, update, onValue, off, runTransaction } from 'firebase/database';
```

---

## 2. Common Patterns

### Realtime Listener with Automatic Cleanup
```typescript
useEffect(() => {
  const productsRef = ref(db, 'products');
  const unsubscribe = onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      setProducts(Object.values(data));
    }
  });

  return () => {
    off(productsRef);
  };
}, []);
```

### Atomic Inventory Decrement via Transaction
```typescript
const itemStockRef = ref(db, `products/${productId}/stock`);
await runTransaction(itemStockRef, (currentStock) => {
  if (currentStock === null) return 0;
  if (currentStock < orderQty) {
    throw new Error('Insufficient inventory available');
  }
  return currentStock - orderQty;
});
```
