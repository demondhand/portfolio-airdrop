import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_COVALENT_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: "Covalent API key not found" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.covalenthq.com/v1/chains/?key=${API_KEY}`);
    if (!res.ok) {
      return NextResponse.json({ error: `Covalent API failed: ${res.statusText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
