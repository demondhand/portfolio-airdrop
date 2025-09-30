import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const API_KEY = process.env.NEXT_PUBLIC_COVALENT_KEY;
  const { searchParams } = new URL(req.url);
  const chainId = searchParams.get("chainId");
  const address = searchParams.get("address");

  if (!API_KEY) {
    return NextResponse.json({ error: "Covalent API key not found" }, { status: 500 });
  }
  if (!chainId || !address) {
    return NextResponse.json({ error: "Missing chainId or address" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?nft=true&key=${API_KEY}`
    );
    if (!res.ok) {
      return NextResponse.json({ error: `Covalent API failed: ${res.statusText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
