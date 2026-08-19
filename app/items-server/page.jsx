// app/items-server/page.jsx (Server Component version for Vercel deployment)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function getItems() {
  const baseUrl = API_BASE.startsWith("http")
    ? API_BASE.replace(/\/$/, "")
    : `http://localhost:3000${API_BASE.replace(/\/$/, "")}`;

  try {
    const response = await fetch(`${baseUrl}/items/`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // for dynamic/real-time data on Vercel
    });

    if (!response.ok) {
      throw new Error("Failed to fetch items");
    }

    return response.json();
  } catch (error) {
    // Fallback data if backend URL is not reachable during SSG/build on Vercel
    return [
      { id: 1, name: "Sample Item 1 (Server Component)" },
      { id: 2, name: "Sample Item 2 (Server Component)" },
    ];
  }
}

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Items (Server Component)</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </main>
  );
}
