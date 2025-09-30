"use client";
import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface Chain {
  chain_id: number;
  name: string;
}

interface NFTData {
  external_data?: {
    image?: string;
    name?: string;
  };
}

interface BalanceItem {
  contract_address: string;
  contract_ticker_symbol: string;
  contract_name: string;
  contract_decimals: number;
  balance: string;
  nft_data?: NFTData[];
}

export default function Home() {
  // Integrasi Mini App SDK
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const [wallet, setWallet] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch daftar chain
  const fetchChains = async () => {
    setError("");
    try {
      const res = await fetch("/api/covalent/chains", { cache: "no-store" });
      const data = await res.json();
      setChains(data?.data?.items || []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Fetch balances untuk wallet & chain tertentu
  const fetchBalances = async (chainId: number) => {
    if (!wallet) {
      setError("Please enter wallet address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/covalent/balances?chainId=${chainId}&address=${wallet}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setBalances(data?.data?.items || []);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        Multi-chain Portfolio Viewer
      </h1>

      {/* Input Wallet */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter wallet address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 border border-gray-700 flex-1"
        />
        <button
          onClick={fetchChains}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Load Chains
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Chains */}
      {chains.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {chains.map((c) => (
            <button
              key={c.chain_id}
              onClick={() => fetchBalances(c.chain_id)}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg"
            >
              {c.name} ({c.chain_id})
            </button>
          ))}
        </div>
      )}

      {/* Balances */}
      {loading && <p>Loading balances...</p>}
      {!loading && balances.length > 0 && (
        <div className="space-y-4">
          {balances.map((item) => (
            <div
              key={item.contract_address}
              className="p-4 bg-gray-900 rounded-lg shadow"
            >
              <h3 className="font-semibold">
                {item.contract_ticker_symbol} ({item.contract_name})
              </h3>
              <p>
                Balance: {Number(item.balance) / 10 ** item.contract_decimals}
              </p>

              {/* NFT */}
              {item.nft_data && item.nft_data.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {item.nft_data.map((nft, idx) => (
                    <div
                      key={`${item.contract_address}-${idx}`}
                      className="p-2 bg-gray-800 rounded"
                    >
                      {nft.external_data?.image ? (
                        <img
                          src={nft.external_data.image}
                          alt={nft.external_data.name || "NFT"}
                          className="rounded"
                        />
                      ) : (
                        <div className="h-32 flex items-center justify-center bg-gray-700 rounded">
                          No Image
                        </div>
                      )}
                      <p className="text-sm mt-1">
                        {nft.external_data?.name || "Unnamed NFT"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
