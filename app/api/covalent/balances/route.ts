import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Ambil API key dari environment variables
  const API_KEY = process.env.NEXT_PUBLIC_COVALENT_KEY;
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Covalent API key not found. Set NEXT_PUBLIC_COVALENT_KEY in environment variables." },
      { status: 500 }
    );
  }

  // Ambil query parameters
  const { searchParams } = new URL(req.url);
  const chainId = searchParams.get("chainId");
  const address = searchParams.get("address");

  if (!chainId || !address) {
    return NextResponse.json(
      { error: "Missing chainId or address in query parameters." },
      { status: 400 }
    );
  }

  try {
    // Panggil API Covalent
    const res = await fetch(
      `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?nft=true&key=${API_KEY}`
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Covalent API request failed with status ${res.status}: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Unexpected error: ${message}` },
      { status: 500 }
    );
  }
}

