"""add feedback table

Revision ID: 41aee08d410c
Revises: 848f70c4193f
Create Date: 2026-09-04 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '41aee08d410c'
down_revision: Union[str, None] = '848f70c4193f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('feedback',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('content_id', sa.String(length=255), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'content_id', name='uq_feedback_user_content')
    )
    op.create_index(op.f('ix_feedback_user_id'), 'feedback', ['user_id'])
    op.create_index(op.f('ix_feedback_content_id'), 'feedback', ['content_id'])


def downgrade() -> None:
    op.drop_index(op.f('ix_feedback_content_id'), table_name='feedback')
    op.drop_index(op.f('ix_feedback_user_id'), table_name='feedback')
    op.drop_table('feedback')
