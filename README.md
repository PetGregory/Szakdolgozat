# BeStrong - Szakdolgozat

Angular alapú fitness alkalmazás, amely segít a felhasználóknak edzéstervet készíteni, kalóriákat követni és edzéseket rögzíteni.

## 🚀 Hosztolás

Az alkalmazás **Firebase Hosting**-on van hosztolva:

- **Élő URL**: https://bestrong-74932.web.app
- **Firebase Console**: https://console.firebase.google.com/project/bestrong-74932/overview

## 📋 Előfeltételek

A projekt futtatásához szükséges:

- **Node.js** (v18 vagy újabb)
- **npm** (Node Package Manager)
- **Angular CLI** (globálisan telepítve vagy npx-szel)

## 🔧 Telepítés és Futtatás

### 1. Projekt klónozása

```bash
git clone <repository-url>
cd beStrong
```

### 2. Függőségek telepítése

```bash
npm install
```

### 3. Alkalmazás futtatása fejlesztési módban

```bash
npm start
```

Az alkalmazás elérhető lesz a `http://localhost:4200` címen.

### 4. Production build készítése

```bash
npm run build:prod
```

A build fájlok a `dist/be-strong/browser` mappába kerülnek.

### 5. Production build watch módban (automatikus újraépítés változások esetén)

```bash
npm run watch
```

## 🧪 Tesztelés

### Unit tesztek futtatása

```bash
npm test
```

### E2E tesztek futtatása (Cypress)

```bash
# Interaktív módban
npm run e2e:open

# Headless módban
npm run e2e
```

## 📦 Deployment

### Firebase-re való deploy

```bash
# Teljes deploy (hosting + egyéb szolgáltatások)
npm run deploy

# Csak hosting deploy
npm run deploy:hosting
```

**Fontos**: A Firebase deploy előtt győződj meg róla, hogy:
1. Be vagy jelentkezve a Firebase-be (`firebase login`)
2. A projekt megfelelően van konfigurálva (`firebase.json`)
3. A production build sikeresen lefutott

## 🛠️ További Hasznos Parancsok

- `npm run build` - Development build
- `npm run cypress:open` - Cypress tesztelő megnyitása
- `ng generate component <name>` - Új komponens generálása
- `ng generate service <name>` - Új szolgáltatás generálása

## 📁 Projekt Struktúra

```
beStrong/
├── src/
│   ├── app/
│   │   ├── components/      # Komponensek
│   │   ├── services/        # Szolgáltatások
│   │   ├── guards/          # Route guardok
│   │   └── ...
│   ├── environments/        # Környezeti változók
│   └── ...
├── backend/                 # Backend API (Render.com-on hosztolva)
├── dist/                    # Build output
├── firebase.json            # Firebase konfiguráció
└── package.json            # NPM függőségek
```

## 🔗 További Információk

- **Backend API**: Render.com-on hosztolva (lásd: `backend/README.md`)
- **Firebase Project**: bestrong-74932
- **Angular verzió**: 19.2.15

## 📝 Megjegyzések

- A fejlesztési szerver automatikusan újratöltődik, amikor fájlokat módosítasz
- A production build optimalizált és minifikált fájlokat tartalmaz
- A Firebase Hosting automatikusan kezeli a routing-ot (SPA támogatás)
