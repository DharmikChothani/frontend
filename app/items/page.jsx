// app/items/page.jsx (Default route using Next.js rewrites to Render backend)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function getItems() {
  const url = `${API_BASE.replace(/\/$/, "")}/items/`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch items");
    }

    return response.json();
  } catch (error) {
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
      <p style={{ color: "#666", marginBottom: "1rem" }}>
        Fetched server-side. Switch to:{" "}
        <a href="/items-client" style={{ color: "#0070f3", textDecoration: "underline" }}>
          Client Component Version (/items-client)
        </a>
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </main>
  );
}
