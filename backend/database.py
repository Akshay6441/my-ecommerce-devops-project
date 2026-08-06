from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Read DATABASE_URL directly from env — before config/settings loads
# This allows tests to override it by setting os.environ["DATABASE_URL"]
# before any import happens (conftest.py does this)
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/mydatabase"
)

_is_sqlite = DATABASE_URL.startswith("sqlite")

_engine_kwargs = {"pool_pre_ping": True}
if not _is_sqlite:
    # These args are not supported by SQLite
    _engine_kwargs["pool_size"] = 10
    _engine_kwargs["max_overflow"] = 20
else:
    _engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
