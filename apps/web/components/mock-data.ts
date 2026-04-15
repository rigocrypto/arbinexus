export interface NavItem {
  label: string;
  href: string;
}

export interface KpiItem {
  label: string;
  value: string;
  delta: string;
}

export interface TopOpportunity {
  pair: string;
  source: string;
  spread: string;
  profit: string;
}

export interface SystemStatusItem {
  name: string;
  status: string;
  tone: "live" | "healthy" | "warn";
}

export interface TrendPoint {
  time: string;
  spread: number;
  volume: number;
  pnl: number;
  winRate: number;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "#" },
  { label: "Opportunities", href: "#" },
  { label: "Markets", href: "#" },
  { label: "Oracle Feeds", href: "#" },
  { label: "Simulation", href: "#" },
  { label: "Portfolio", href: "#" },
  { label: "Analytics", href: "#" },
  { label: "Alerts", href: "#" },
  { label: "Settings", href: "#" }
];

export const heroStats = [
  { label: "Total Opportunities", value: "24" },
  { label: "Avg Spread", value: "0.73%" },
  { label: "Total Volume", value: "$2.14M" },
  { label: "Success Rate", value: "87.6%" }
];

export const topOpportunities: TopOpportunity[] = [
  { pair: "GOLDx / USDC", source: "Pyth vs Jupiter", spread: "1.24%", profit: "$24,680 est." },
  { pair: "SILVERx / USDC", source: "Pyth vs Raydium", spread: "0.87%", profit: "$12,430 est." },
  { pair: "CORNx / USDC", source: "Pyth vs Orca", spread: "0.62%", profit: "$8,215 est." },
  { pair: "OILx / USDC", source: "Pyth vs Meteora", spread: "0.51%", profit: "$6,742 est." }
];

export const systemStatus: SystemStatusItem[] = [
  { name: "Pyth Oracle", status: "Live", tone: "live" },
  { name: "Jupiter API", status: "Live", tone: "live" },
  { name: "Solana RPC", status: "Healthy", tone: "healthy" },
  { name: "ArbiNexus Engine", status: "Operational", tone: "healthy" }
];

export const trendData: TrendPoint[] = [
  { time: "11:00", spread: -0.22, volume: 280, pnl: 440, winRate: 83.4 },
  { time: "12:00", spread: 0.08, volume: 350, pnl: 610, winRate: 84.1 },
  { time: "13:00", spread: -0.48, volume: 330, pnl: 570, winRate: 82.8 },
  { time: "14:00", spread: 0.11, volume: 390, pnl: 720, winRate: 84.9 },
  { time: "15:00", spread: 0.37, volume: 420, pnl: 930, winRate: 86.2 },
  { time: "16:00", spread: -0.17, volume: 365, pnl: 810, winRate: 85.7 },
  { time: "17:00", spread: -0.62, volume: 310, pnl: 690, winRate: 84.7 },
  { time: "18:00", spread: -0.18, volume: 360, pnl: 770, winRate: 85.3 },
  { time: "19:00", spread: -0.34, volume: 340, pnl: 760, winRate: 86.1 },
  { time: "20:00", spread: -0.05, volume: 410, pnl: 980, winRate: 87.0 },
  { time: "21:00", spread: -0.11, volume: 460, pnl: 1100, winRate: 87.6 }
];

export const footerKpis: KpiItem[] = [
  { label: "Total Volume Scanned", value: "$24.68M", delta: "24H" },
  { label: "Total Opportunities", value: "156", delta: "24H" },
  { label: "Avg. Spread", value: "0.73%", delta: "24H" },
  { label: "Simulated PnL", value: "$3,842.21", delta: "24H" },
  { label: "Win Rate", value: "87.6%", delta: "24H" }
];
