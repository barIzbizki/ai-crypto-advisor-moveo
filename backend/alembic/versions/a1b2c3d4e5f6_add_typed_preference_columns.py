"""add typed preference columns

Revision ID: a1b2c3d4e5f6
Revises: 0d5f9f58926b
Create Date: 2026-09-04 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '0d5f9f58926b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('user_preferences', sa.Column('investor_type', sa.String(255), nullable=True))
    op.add_column('user_preferences', sa.Column('crypto_assets', sa.JSON(), nullable=True))
    op.add_column('user_preferences', sa.Column('content_types', sa.JSON(), nullable=True))

    connection = op.get_bind()

    reverse_map = {
        'long_term_hold': 'hodler',
        'active_trading': 'day_trader',
        'nft_collecting': 'nft_collector',
    }

    rows = connection.execute(sa.text("SELECT id, trading_strategy, notification_preferences FROM user_preferences")).fetchall()

    for row in rows:
        row_id, trading_strategy, notification_prefs = row

        if trading_strategy not in reverse_map:
            raise ValueError(f"Unrecognized trading_strategy value: {trading_strategy}")

        investor_type = reverse_map[trading_strategy]

        crypto_assets = []
        content_types = []
        if notification_prefs and isinstance(notification_prefs, dict):
            crypto_assets = notification_prefs.get('crypto_assets', [])
            content_types = notification_prefs.get('content_types', [])

        if not crypto_assets:
            crypto_assets = []
        if not content_types:
            content_types = []

        connection.execute(
            sa.text(
                "UPDATE user_preferences SET investor_type = :investor_type, crypto_assets = :crypto_assets, content_types = :content_types WHERE id = :id"
            ),
            {
                'investor_type': investor_type,
                'crypto_assets': sa.JSON.astext(str(crypto_assets).replace("'", '"')),
                'content_types': sa.JSON.astext(str(content_types).replace("'", '"')),
                'id': row_id,
            }
        )

    connection.commit()


def downgrade() -> None:
    op.drop_column('user_preferences', 'content_types')
    op.drop_column('user_preferences', 'crypto_assets')
    op.drop_column('user_preferences', 'investor_type')
