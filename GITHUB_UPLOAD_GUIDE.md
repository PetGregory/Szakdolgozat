# Backend GitHub-ra Feltöltés - Részletes Útmutató

## ✅ Előfeltételek

1. GitHub repository már létezik: https://github.com/PetGregory/beStrong-backend
2. Git Bash telepítve van (vagy VS Code Terminal Git Bash módban)

## 🚀 Módszer 1: Automatikus Script (Ajánlott)

### Lépések:

1. **Nyisd meg a Git Bash-t**
   - Windows Start → "Git Bash" keresés
   - Vagy VS Code Terminal → New Terminal → Git Bash kiválasztása

2. **Menj a backend mappába**
   ```bash
   cd C:/Users/USER/beStrong/backend
   ```

3. **Futtasd a script-et**
   ```bash
   bash UPLOAD_TO_GITHUB.sh
   ```

4. **Push a GitHub-ra**
   ```bash
   git push -u origin main
   ```

5. **Ha kéri a hitelesítést:**
   - Username: `PetGregory`
   - Password: **GitHub Personal Access Token** (nem a jelszó!)

## 🔧 Módszer 2: Manuális (Ha a script nem működik)

### Lépésről lépésre:

```bash
# 1. Menj a backend mappába
cd C:/Users/USER/beStrong/backend

# 2. Töröld a régi remote-ot (ha van)
git remote remove origin

# 3. Ha még nincs git repo, inicializáld
git init

# 4. Add hozzá az összes fájlt
git add .

# 5. Commit
git commit -m "Initial commit - Backend for Render"

# 6. Main branch beállítása
git branch -M main

# 7. Remote hozzáadása
git remote add origin https://github.com/PetGregory/beStrong-backend.git

# 8. Ellenőrzés
git remote -v

# 9. Push
git push -u origin main
```

## 🔑 GitHub Personal Access Token

Ha "permission denied" hibát kapsz:

1. Menj ide: https://github.com/settings/tokens
2. Kattints: **Generate new token** → **Generate new token (classic)**
3. Nevezd el: `Render Deploy`
4. Válaszd ki: ✅ `repo` (full control)
5. Kattints: **Generate token**
6. **Másold ki a tokent!** (csak egyszer látható)
7. Ezt add meg password helyett a `git push` során

## ✅ Ellenőrzés

Miután sikeresen feltöltötted:

1. Menj ide: https://github.com/PetGregory/beStrong-backend
2. Látnod kellene a fájlokat:
   - `server.js`
   - `package.json`
   - `routes/workouts.js`
   - `services/workoutGenerator.js`
   - `workoutData.json`
   - stb.

## 🚀 Következő lépés: Render.com Deploy

Miután a GitHub-on látod a fájlokat:

1. Menj Render Dashboard-ra: https://dashboard.render.com
2. **New** → **Web Service**
3. **Connect GitHub** → Válaszd a `beStrong-backend` repository-t
4. Beállítások:
   - **Name**: `beStrong-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Create Web Service**
6. Várd meg, amíg deploy-ol (5-10 perc)
7. Másold ki a **URL**-t (pl: `https://bestrong-backend.onrender.com`)
8. Frissítsd a `src/environments/environment.prod.ts` fájlt az új URL-lel
9. Re-deploy a frontend-et Firebase Hosting-re

## ❓ Problémák

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/PetGregory/beStrong-backend.git
```

### "fatal: not a git repository"
```bash
git init
```

### "nothing to commit"
```bash
git add .
git commit -m "Initial commit"
```

### "permission denied"
- Használj GitHub Personal Access Token-t password helyett!

