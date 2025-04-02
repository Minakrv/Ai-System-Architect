# 🧠 AI System Architecture Generator

An intelligent architecture assistant that generates multiple system design options (including Mermaid.js diagrams, stack suggestions, pros & cons) based on your system description and constraints.

## ✨ Features

- 🧾 Multi-step form UX
- 📄 Upload `.txt` or `.md` files as input
- 🤖 Uses OpenRouter AI (GPT or Mixtral)
- 📈 Generates Mermaid.js diagrams
- ✅ Pros & Cons analysis
- 📊 Backend metrics (most-used stacks, serverless, etc.)
- 💾 Save designs to localStorage
- 📤 Export as PDF / Markdown
- 🔗 Shareable URLs (coming soon)

---

## 📦 Tech Stack

| Layer       | Tech                     |
|-------------|--------------------------|
| Frontend    | Next.js, React, TailwindCSS |
| Backend     | FastAPI, Python          |
| AI Layer    | OpenRouter (OpenAI GPT-4 Turbo, Mixtral) |
| Diagrams    | Mermaid.js               |
| Database    | PostgreSQL (via SQLAlchemy) |
| Hosting     | Vercel (frontend), Render/Fly.io (backend) |

---

## 🧪 Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ai-system-architecture-generator.git
cd ai-system-architecture-generator
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env
echo "OPENROUTER_API_KEY=your-key" > .env

# Init DB
python init_db.py

# Start server
uvicorn main:app --reload
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 🛠 Environment Variables

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend
```
OPENROUTER_API_KEY=your-openrouter-key
DATABASE_URL=postgresql+asyncpg://localhost/architecture_ai
```

---


## 📤 Deployment

### Frontend → [Vercel](https://vercel.com/)
- Connect GitHub repo
- Set `NEXT_PUBLIC_API_URL` to your backend Render URL

### Backend → [Render](https://render.com/)
- New web service
- Add Python environment
- Add `.env` values
- Use `uvicorn main:app --host 0.0.0.0 --port 8000`

---

## 🙌 Credits

Made with ❤️ by [Mina Baghkalayeh](https://www.linkedin.com/in/mina-baghkalayeh-14b4321aa/)
