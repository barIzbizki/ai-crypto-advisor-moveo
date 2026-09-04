"""drop legacy preference columns

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-09-04 16:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('user_preferences', 'investor_type', nullable=False)
    op.alter_column('user_preferences', 'crypto_assets', nullable=False)
    op.alter_column('user_preferences', 'content_types', nullable=False)
    op.drop_column('user_preferences', 'notification_preferences')
    op.drop_column('user_preferences', 'risk_level')
    op.drop_column('user_preferences', 'trading_strategy')


def downgrade() -> None:
    op.add_column('user_preferences', sa.Column('trading_strategy', sa.String(255), nullable=True))
    op.add_column('user_preferences', sa.Column('risk_level', sa.String(255), nullable=True))
    op.add_column('user_preferences', sa.Column('notification_preferences', sa.JSON(), nullable=True))
    op.alter_column('user_preferences', 'investor_type', nullable=True)
    op.alter_column('user_preferences', 'crypto_assets', nullable=True)
    op.alter_column('user_preferences', 'content_types', nullable=True)
