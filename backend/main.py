from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.architect import router as architect_router

app = FastAPI()

# Enable CORS so frontend can talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev only!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(architect_router)