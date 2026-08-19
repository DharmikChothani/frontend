import { NextResponse } from "next/server";

export async function GET() {
  const items = [
    { id: 1, name: "Item 1 - Vercel Deployment Ready" },
    { id: 2, name: "Item 2 - Server / Client Component" },
    { id: 3, name: "Item 3 - Next.js App Router" },
  ];

  return NextResponse.json(items);
}
