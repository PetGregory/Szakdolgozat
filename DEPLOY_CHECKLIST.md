# Deploy Checklist - 404 Hiba Javítás

## ✅ Probléma
404 hiba: `https://bestrong-backend.onrender.com/workouts/generate`

## ✅ Megoldás
Az `environment.prod.ts` fájlban hiányzott az `/api` az URL-ből.

**Helyes URL**: `https://bestrong-backend.onrender.com/api`

## ✅ Teendők

### 1. Ellenőrizd az environment.prod.ts fájlt
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://bestrong-backend.onrender.com/api'  // ← Van az /api!
};
```

### 2. Újra build-elés (production)
```bash
npm run build -- --configuration production
```

vagy ha van script:
```bash
npm run build:prod
```

### 3. Deploy Firebase Hosting-re
```bash
firebase deploy --only hosting
```

### 4. Ellenőrzés
- Töröld a böngésző cache-ét (Ctrl+Shift+R)
- Vagy inkognitó módban próbáld
- Telefonról is töröld a cache-t vagy inkognitóban próbáld

## 🔍 Backend Route Ellenőrzés

A backend route-ok:
- `/api/workouts/generate` ← POST
- `/health` ← GET (health check)

Tesztelés:
```bash
curl https://bestrong-backend.onrender.com/health
```

Ha ez működik, a backend elérhető!

## 📝 URL Struktúra

**Frontend hívás**: 
- `WorkoutService` → `${apiUrl}/workouts/generate`
- ahol `apiUrl = 'https://bestrong-backend.onrender.com/api'`
- **Eredmény**: `https://bestrong-backend.onrender.com/api/workouts/generate` ✅

**Backend route**: 
- `app.use('/api/workouts', router)` 
- `router.post('/generate', ...)`
- **Eredmény**: `/api/workouts/generate` ✅

**Egyezés**: ✅

