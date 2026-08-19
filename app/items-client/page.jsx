// app/items-client/page.jsx (Client Component with fallback and retry)
"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/backend";

async function getItems() {
  const baseUrl = API_BASE.replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl}/items/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("Primary API endpoint unreachable, attempting fallback /api/items:", e);
  }

  // Fallback call to built-in Next.js route handler /api/items
  const fallbackRes = await fetch("/api/items");
  if (!fallbackRes.ok) {
    throw new Error("Failed to fetch items from primary server or fallback API");
  }
  return fallbackRes.json();
}

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    setError(null);
    getItems()
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) return <p style={{ padding: "2rem" }}>Loading items...</p>;
  if (error)
    return (
      <main style={{ padding: "2rem" }}>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button
          onClick={fetchItems}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          Retry Fetching
        </button>
      </main>
    );

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
