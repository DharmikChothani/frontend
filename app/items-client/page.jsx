// app/items-client/page.jsx (Client Component using Next.js rewrites to Render backend)
"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/backend";

async function getItems() {
  const baseUrl = API_BASE.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/items/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  return response.json();
}

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getItems()
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: "2rem" }}>Loading items...</p>;
  if (error) return <p style={{ padding: "2rem" }}>Error: {error}</p>;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Items (Client Component)</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </main>
  );
}
