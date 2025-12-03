# BeStrong Backend API

Workout plan generáló backend API Render.com-ra deployolva.

##Render.com Deploy

1. **GitHub Repository**: https://github.com/PetGregory/beStrong-backend
2. **Render URL**: (lesz beállítva a deploy után)
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

## Lokális futtatás

```bash
npm install
npm start
```

A server a `http://localhost:3000` címen fut.

## API Endpoints

- `GET /health` - Health check
- `POST /api/workouts/generate` - Workout plan generálása

## Függőségek

- express
- cors
- dotenv
