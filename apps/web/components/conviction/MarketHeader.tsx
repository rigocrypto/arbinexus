"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDemoWallet } from "../../context/DemoWalletContext";

export default function MarketHeader({ market }: any) {
  const { publicKey, connected } = useWallet();
  const deadline = new Date(market.deadline);
  const now = Date.now();
  const remaining = Math.max(0, deadline.getTime() - now);
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);

  const statusKey = market.status as "open" | "closed" | "resolved";
  const statusColor = {
    open: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
    resolved: "bg-blue-100 text-blue-800",
  }[statusKey] || "bg-gray-100 text-gray-800";

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-700">{market.question}</h1>
      <p className="text-sm text-gray-600 mt-2">{market.description}</p>

      <div className="mt-4 flex items-center space-x-4 text-sm flex-wrap gap-3">
        <div>
          <strong>Deadline:</strong> {deadline.toUTCString()}
        </div>
        <div>
          <strong>⏱ Time left:</strong> {days}d {hours}h
        </div>
        <div className={`px-2 py-1 rounded font-semibold ${statusColor}`}>
          {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
        </div>
        <div>
          <strong>Wallet:</strong>{" "}
          {connected && publicKey ? (
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
            </span>
          ) : ( 
            <span className="text-gray-500">Not connected</span>
          )}
          {/* Mock connect for demo flows: sets a local pseudo public key for demo staking */}
          {!connected && (
            <MockConnectButton />
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded">
        <strong className="block mb-2">✓ Resolution criteria:</strong>
        <ul className="list-disc ml-5 space-y-1">
          <li>Public demo or deployment link is available before deadline</li>
          <li>Solana wallet connection works</li>
          <li>At least one core Solana interaction is functional</li>
          <li>Public proof (GitHub, demo video, or live app)</li>
        </ul>
      </div>
    </div>
  );
}

function MockConnectButton() {
  const { mockPublicKey, mockConnect, mockDisconnect } = useDemoWallet();

  if (mockPublicKey) {
    return (
      <>
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{mockPublicKey}</span>
        <button className="ml-2 text-xs text-red-600" onClick={mockDisconnect}>
          Mock Disconnect
        </button>
      </>
    );
  }

  return (
    <button
      className="ml-3 px-2 py-1 text-xs bg-indigo-50 border border-indigo-100 rounded"
      onClick={mockConnect}
    >
      Mock Connect
    </button>
  );
}
