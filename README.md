# 🌐 Full Stack Project – Backend & Frontend

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

A modern full stack application with a **FastAPI** backend and a **React + TypeScript (Vite)** frontend.

---

## 📁 Project Structure

```
project-root/
│
├── Backend/          → FastAPI-based REST API
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── requirements.txt
│   └── venv/
│
└── src/              → React + TypeScript frontend using Vite
    ├── components/
    ├── pages/
    ├── hooks/
    ├── utils/
    ├── types/
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Getting Started

### 🔧 Backend Setup

```bash
# Go to the backend folder
cd Backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload
```

**Backend will be available at:** `http://localhost:8000`  
**API Documentation:** `http://localhost:8000/docs`

### 🎨 Frontend Setup

```bash
# Go to the frontend folder
cd src

# Install dependencies
npm install

# Run the Vite development server
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

---

## ✅ Features

### Backend (FastAPI)
- 🚀 **High Performance** - Built with FastAPI for maximum speed
- 📚 **Automatic Documentation** - Interactive API docs at `/docs`
- 🔄 **Hot Reload** - Automatic server restart during development
- 🛡️ **Type Safety** - Python type hints for better code quality
- 🗃️ **Database Ready** - Easy integration with SQLAlchemy or other ORMs

### Frontend (React + TypeScript + Vite)
- ⚡ **Lightning Fast** - Vite for ultra-fast development experience
- 🔥 **Hot Module Replacement (HMR)** - Instant updates without losing state
- 📱 **Modern React** - Latest React features with hooks and functional components
- 🎯 **TypeScript** - Full type safety and better developer experience
- 🎨 **Component-Based** - Modular and reusable UI components
- 📦 **Optimized Build** - Production-ready builds with code splitting

---

## 📋 Available Scripts

### Backend
```bash
# Start development server
uvicorn app.main:app --reload

# Install new package
pip install package_name
pip freeze > requirements.txt
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## 🔧 Environment Configuration

### Backend (.env)
```env
# Database
DATABASE_URL=sqlite:///./app.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=Full Stack App
```

---

## 📌 Requirements

### System Requirements
- **Python** 3.8+
- **Node.js** 16+
- **npm** 7+

### Key Dependencies

#### Backend
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy (optional)
- Python-multipart

#### Frontend
- React 18+
- TypeScript
- Vite
- React Router DOM
- Axios/Fetch API

---

## 🐳 Docker Setup (Optional)

### Backend Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
```

---

## 🚀 Deployment

### Backend Deployment
```bash
# Using Heroku
heroku create your-app-name
git push heroku main

# Using Railway
railway login
railway init
railway up
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel

# Deploy to Netlify
npx netlify deploy --prod --dir=dist
```

---

## 🧪 Testing

### Backend Tests
```bash
# Install testing dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Frontend Tests
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```
