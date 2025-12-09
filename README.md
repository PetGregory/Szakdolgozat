# BeStrong - Szakdolgozat

Angular alapú fitness alkalmazás edzésterv készítéshez, kalóriák követéséhez és edzések rögzítéséhez.

## Hosztolás

Az alkalmazás **Firebase Hosting**-on van hosztolva:

- **Élő URL**: https://bestrong-74932.web.app

## Telepítés és Futtatás

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

## Deployment

### Firebase-re való deploy

```bash
npm run deploy:hosting
```

**Fontos**: A Firebase deploy előtt győződj meg róla, hogy be vagy jelentkezve a Firebase-be (`firebase login`) és a production build sikeresen lefutott.

## További Információk

- **Backend API**: Render.com-on hosztolva (lásd: `backend/README.md`)
- **Firebase Project**: bestrong-74932
- **Angular verzió**: 19.2.15
