# Firebase Hosting Deployment Guide

Ez a dokumentum lépésről lépésre bemutatja, hogyan lehet deployolni az Angular alkalmazást Firebase Hostingra.

## Előfeltételek

1. **Firebase Account**: Regisztrálj egy Firebase accountot a [Firebase Console](https://console.firebase.google.com/)-ban
2. **Firebase Project**: Hozz létre egy új Firebase projektet vagy használj egy meglévőt
3. **Firebase CLI**: Telepítés helyi gépre

## Telepítés lépései

### 1. Firebase CLI telepítése

```bash
npm install -g firebase-tools
```

### 2. Firebase bejelentkezés

```bash
firebase login
```

Ez megnyitja a böngészőt, ahol be kell jelentkezned a Google fiókoddal.

### 3. Firebase projekt inicializálása

```bash
firebase init hosting
```

A paranccsal válassz ki:
- Egy meglévő Firebase projektet, vagy hozz létre újat
- **Public directory**: `dist/be-strong/browser` (ez az Angular build output)
- **Single-page app**: Igen (újraírást használ az Angular routing miatt)
- **Automatic builds**: Nem (manuálisan buildelünk)

### 4. Firebase projekt ID beállítása

Frissítsd a `.firebaserc` fájlt a Firebase projekt ID-dal:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

A projekt ID-t megtalálod a Firebase Console-ban.

### 5. Build és Deploy

#### Először buildelj production módban:

```bash
npm run build:prod
```

#### Aztán deployolj:

```bash
npm run deploy:hosting
```

Vagy egyszerre mindkettő:

```bash
npm run deploy
```

## Deploy parancsok

- `npm run build:prod` - Production build
- `npm run deploy:hosting` - Build + Firebase Hosting deploy
- `npm run deploy` - Build + Teljes Firebase deploy (ha van más szolgáltatás is)

## Változtatások után

Minden változtatás után:

1. Build production módban: `npm run build:prod`
2. Deploy: `firebase deploy --only hosting`

## Firebase Console

A deploy után az alkalmazás elérhető lesz:
- URL: `https://your-project-id.web.app` vagy `https://your-project-id.firebaseapp.com`
- Firebase Console: https://console.firebase.google.com/project/your-project-id/hosting

## További beállítások

### Egyedi domain

1. Menj a Firebase Console-ban: Hosting → Add custom domain
2. Kövesd az utasításokat a DNS beállításokhoz

### Environment változók

Ha environment változókat használsz (pl. API URL-ek), hozz létre:
- `src/environments/environment.prod.ts` production beállításokkal
- Használd ezt a build során: `ng build --configuration production`

## Hibaelhárítás

### "Firebase project not found"
- Ellenőrizd a `.firebaserc` fájlban a projekt ID-t
- Győződj meg róla, hogy be vagy jelentkezve: `firebase login`

### "Build failed"
- Ellenőrizd, hogy nincs TypeScript vagy compile hiba
- Futtasd: `npm run build:prod` külön

### "Deploy failed"
- Győződj meg róla, hogy a `dist/be-strong/browser` mappa létezik
- Ellenőrizd a Firebase projekt jogosultságaidat

