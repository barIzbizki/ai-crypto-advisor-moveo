## Purpose

Serves current prices and market data for the Dashboard's Coin Prices section, scoped to the user's selected assets.

## ADDED Requirements

### Requirement: Coin Prices returns data for the user's selected assets
The system SHALL return current price data for exactly the coins corresponding to the authenticated user's `crypto_assets`. Broader onboarding categories (`Stablecoins`, `Altcoins`) SHALL resolve to a fixed, documented representative set of coins.

#### Scenario: Named assets return their own price data
- **WHEN** a user's `crypto_assets` includes `BTC` and `ETH`
- **THEN** the returned data includes current price data for BTC and ETH

#### Scenario: Broad category resolves to a representative set
- **WHEN** a user's `crypto_assets` includes `Stablecoins`
- **THEN** the returned data includes the fixed representative stablecoin set rather than being omitted

### Requirement: Each coin entry exposes name, symbol, price, and market info
The system SHALL return, for each coin, its name, symbol, current price, and available market information (e.g. 24h change or market cap, as supplied by the price provider).

#### Scenario: Coin entry includes core fields
- **WHEN** price data for a coin is returned
- **THEN** the entry includes the coin's name, symbol, and current price

### Requirement: Provider failure degrades per coin, not for the whole section
The system SHALL show an "unavailable" state for an individual coin WHEN price data for that coin cannot be retrieved, without failing the entire Coin Prices section.

#### Scenario: Price provider fails for one coin
- **WHEN** the price provider cannot return data for one of the user's selected coins
- **THEN** that coin is marked unavailable while other coins' data is still returned
</content>
