from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from .db import Base

class Architecture(Base):
    __tablename__ = "architectures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    system_description = Column(Text, nullable=False)
    constraints = Column(Text, nullable=True)
    result = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)