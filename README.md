# $BUY protocol interface

Eight protocol routes plus a standalone whitepaper:

- `/` — protocol intro with a procedural, interactive 3D flywheel.
- `/burn` — burn terminal with a procedural, interactive 3D supply/void graph.
- `/airdrops` — distribution/claim terminal with an interactive wallet-flow graph.
- `/staking` — stake/unstake/claim terminal with an interactive orbital pool graph.
- `/locks` — create/extend/unlock terminal with a synchronized duration corridor.
- `/liquidity` — add/remove liquidity terminal with an interactive dual-token pool.
- `/buybacks` — autonomous execution engine with market and routing visualization.
- `/flywheel` — interactive protocol system map with a live module inspector.
- `/whitepaper` — project-specific design paper with formulas, charts, status, risks, and roadmap.

## Run locally

Dependencies are intentionally not installed yet.

```bash
npm install
npm run dev
```

Use `npm.cmd` instead of `npm` in PowerShell if the machine blocks `npm.ps1`:

```powershell
npm.cmd install
npm.cmd run dev
```

## Phantom behavior

The site uses the injected Phantom extension provider. It never auto-connects or
stores a wallet address. Connection starts only after a button click, and the app
requests disconnection on `pagehide`, `beforeunload`, and React cleanup. Hover or
focus the connected address to copy it or disconnect manually.

The current direct injected-provider connection needs no Phantom SDK package or
Phantom Portal app ID. Web3 transaction dependencies will be added only after
the token chain and contract/program are known; this avoids shipping unused,
vulnerable transitive packages.

## $BUY holding gate

Burn, airdrop, staking, lock, and liquidity actions require the connected wallet
to hold at least 1,000,000 `$BUY`. The UI reads every matching SPL token account
owned by the wallet, then fails closed when the wallet is below the threshold or
the check cannot be completed.

Copy `.env.example` to `.env.local` and configure:

```env
VITE_SOLANA_RPC_URL=https://your-solana-rpc.example
VITE_BUY_MINT_ADDRESS=YOUR_BUY_SPL_TOKEN_MINT
```

The client-side gate controls this interface. When real programs are deployed,
the same rule must also be enforced by each on-chain instruction; browser checks
alone are not a security boundary.

## Still needed before a real burn

- `$BUY` mint address and chain confirmation.
- Solana RPC URL for balance and supply verification.
- Burn instruction/program or contract ABI/address.
- RPC endpoint and cluster/network choice.
- Balance and protocol-stat data sources.

Until those values are provided, the interface deliberately does not submit a
fake or unsafe transaction.

## Adding the supplied backgrounds later

Place assets in `public/assets/`. The page art layer is isolated behind the UI and
3D canvas. For example:

```css
.intro-page { --page-background-image: url('/assets/intro-background.webp'); }
.burn-page { --page-background-image: url('/assets/burn-background.webp'); }
```
