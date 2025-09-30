import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { actions } from "@farcaster/miniapp-sdk";

export default function Home() {
  const [address, setAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [eligible, setEligible] = useState(null);

  const fetchPortfolio = async () => {
    const res = await fetch(
      `https://api.covalenthq.com/v1/8453/address/${address}/balances_v2/?key=cqt_rQcD3wt36yrKPYpYWPMHmQPc7TFc`
    );
    const data = await res.json();
    const items = data.data.items.filter((t) => t.quote > 0);
    setTokens(items);
    checkEligibility(items);
  };

  const checkEligibility = (tokens) => {
    // RULE: eligible jika punya ≥ 100 USDC
    const usdc = tokens.find((t) => t.contract_ticker_symbol === "USDC");
    if (usdc && usdc.balance / 10 ** usdc.contract_decimals >= 100) {
      setEligible(true);
    } else {
      setEligible(false);
    }
  };

  // Hilangkan splash screen Base setelah siap
  if (typeof window !== "undefined") {
    actions.ready();
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Portfolio + Airdrop Checker</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Masukkan alamat wallet"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button
        onClick={fetchPortfolio}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Cek Portfolio
      </button>

      {eligible !== null && (
        <p className="mt-2 font-semibold">
          {eligible ? "✅ Eligible untuk airdrop!" : "❌ Tidak eligible"}
        </p>
      )}

      {tokens.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold">Token Holdings</h2>
          <ul>
            {tokens.map((t, i) => (
              <li key={i}>
                {t.contract_ticker_symbol}:{" "}
                {(t.balance / 10 ** t.contract_decimals).toFixed(2)}
              </li>
            ))}
          </ul>

          <PieChart width={300} height={200}>
            <Pie
              data={tokens}
              dataKey="quote"
              nameKey="contract_ticker_symbol"
              cx="50%"
              cy="50%"
              outerRadius={80}
            >
              {tokens.map((_, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"][i % 4]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      )}
    </div>
  );
}
