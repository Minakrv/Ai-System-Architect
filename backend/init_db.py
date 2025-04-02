import asyncio
from db.db import engine, Base
from db import models  # ✅ This line ensures the Architecture model is loaded

async def create_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(create_db())