"""feedback rating to is_upvote

Revision ID: 0d5f9f58926b
Revises: 41aee08d410c
Create Date: 2026-09-04 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0d5f9f58926b'
down_revision: Union[str, None] = '41aee08d410c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('feedback', sa.Column('is_upvote', sa.Boolean(), nullable=True))
    op.execute('UPDATE feedback SET is_upvote = (rating >= 3)')
    op.alter_column('feedback', 'is_upvote', nullable=False)
    op.drop_column('feedback', 'rating')


def downgrade() -> None:
    op.add_column('feedback', sa.Column('rating', sa.Integer(), nullable=True))
    op.execute('UPDATE feedback SET rating = CASE WHEN is_upvote THEN 5 ELSE 1 END')
    op.alter_column('feedback', 'rating', nullable=False)
    op.drop_column('feedback', 'is_upvote')
