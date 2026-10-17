# 🚀 VupsRouter — Ultimate Full-Stack AI Model Hub

> A premium all-in-one AI platform to discover, compare, and use free AI models from a single unified interface. Built with a futuristic 3D design aesthetic.

![VupsRouter](https://img.shields.io/badge/VupsRouter-AI%20Model%20Hub-6C63FF?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)

---

## ✨ Features

- 🧠 **Unified AI Chat Interface** — Stream conversations with any available model
- 🔍 **Live Model Discovery** — Real-time catalog from FlagshipRouter, OpenRouter, Google AI, Hugging Face, and Ollama
- ⚖️ **Model Comparison** — Side-by-side model capability comparisons
- 🌐 **3D Animated UI** — Immersive Three.js / React Three Fiber visuals
- 🔐 **Secure Auth** — JWT-based session authentication with bcrypt password hashing
- 🎛️ **Provider Dashboard** — Live health status for all connected providers
- 📱 **Fully Responsive** — Mobile-first design with smooth animations
- ⚡ **Streaming Responses** — Real-time SSE token streaming from providers
- 🔒 **API Key Protection** — All provider keys stay server-side only

---

## 🏗️ Architecture

```
VupsRouter/
├── client/               # React 19 + Vite frontend
│   └── src/
│       ├── components/   # Navbar, Footer, 3D scenes, animations
│       ├── pages/        # Home, Chat, ModelExplorer, Compare, Dashboard…
│       ├── context/      # Auth + Theme providers
│       ├── services/     # Axios API client
│       └── theme/        # MUI theme customization
│
└── server/               # Node.js + Express backend
    └── src/
        ├── config/       # env validation (Zod), Prisma client
        ├── controllers/  # auth, chat, model controllers
        ├── middleware/   # auth guard, rate limiter, error handler
        ├── providers/    # FlagshipRouter, OpenRouter, Google AI, HuggingFace, Ollama
        ├── routes/       # REST API routes
        ├── services/     # auth, chat, email services
        └── utils/        # logger, model catalog
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- A running [FlagshipRouter](https://github.com/CrazyVillainFF/VupsRouter) gateway (or Ollama, OpenRouter, etc.)

### 1. Clone the repository
```bash
git clone https://github.com/CrazyVillainFF/VupsRouter.git
cd VupsRouter
```

### 2. Install dependencies
```bash
# Root dependencies (concurrently)
npm install

# Client dependencies
npm install --prefix client

# Server dependencies
npm install --prefix server
```

### 3. Configure environment
```bash
cp .env.example server/.env
```

Edit `server/.env` with your credentials:
```env
PORT=5001
DATABASE_URL="file:./dev.db"
SESSION_SECRET=your_32_char_secret_here

# FlagshipRouter (required for default setup)
FLAGSHIPROUTER_BASE_URL=http://localhost:20128/v1
FLAGSHIPROUTER_API_KEY=your_key_here

# Optional additional providers
OPENROUTER_API_KEY=
GOOGLE_AI_API_KEY=
HUGGINGFACE_API_KEY=
```

### 4. Set up the database
```bash
cd server
npx prisma db push
npx prisma generate
```

### 5. Start development servers
```bash
# From root — starts both client (port 5173) and server (port 5001)
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 🔌 API Reference

### Models
| Endpoint | Description |
|----------|-------------|
| `GET /api/models` | List all available models across providers |
| `GET /api/models/:modelId` | Get model details |
| `GET /api/providers` | List all providers with health status |
| `GET /api/health` | Full system health check |

### Chat
| Endpoint | Description |
|----------|-------------|
| `POST /api/chat` | Send a chat completion request |
| `POST /api/chat/stream` | Server-sent events streaming endpoint |
| `GET /api/chats` | List user conversations (auth required) |
| `POST /api/chats` | Create a conversation (auth required) |

### Auth
| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/signup` | Register a new account |
| `POST /api/auth/signin` | Sign in and receive JWT |
| `POST /api/auth/signout` | Invalidate session |
| `GET /api/auth/me` | Get current user profile |

---

## 🛡️ Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT tokens with configurable expiry
- **Rate limiting** on all endpoints (stricter on `/api/chat`)
- Provider API keys **never** sent to the browser
- Helmet security headers
- CORS restricted to configured origins
- Zod input validation on all request bodies

---

## 🌟 Supported Providers

| Provider | Status | Notes |
|----------|--------|-------|
| **FlagshipRouter** | ✅ Primary | Local OpenAI-compatible gateway |
| **Ollama** | ✅ Local | Auto-detected at localhost:11434 |
| **OpenRouter** | ⚙️ Optional | Requires `OPENROUTER_API_KEY` |
| **Google AI** | ⚙️ Optional | Requires `GOOGLE_AI_API_KEY` |
| **Hugging Face** | ⚙️ Optional | Requires `HUGGINGFACE_API_KEY` |

---

## 📦 Tech Stack

**Frontend:** React 19, Vite, Material UI, Three.js, React Three Fiber, Framer Motion, React Router  
**Backend:** Node.js, Express 5, Prisma ORM, SQLite (dev) / PostgreSQL (prod)  
**Security:** JWT, bcrypt, Helmet, express-rate-limit  
**Streaming:** Server-Sent Events (SSE)

---

## 📄 License

MIT © VupsRouter Contributors
