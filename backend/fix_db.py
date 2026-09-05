from core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL'))
        conn.commit()
        print('SUCCESS: name column added to production database!')
    except Exception as e:
        print(f'Error: {e}')
