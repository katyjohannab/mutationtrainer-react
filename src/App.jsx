

import { useEffect, useState } from "react";
import { loadCards } from "./data/loadCards";

const CARDS_URL = `${import.meta.env.BASE_URL}data/cards.csv`;

export default function App() {
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await loadCards(CARDS_URL);
        if (!cancelled) {
          setCards(data);
          console.log("Loaded cards:", data.length);
          console.log("CSV columns:", Object.keys(data[0] || {}));
          console.log("First row:", data[0]);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      }
    })();

    return () => {
      cancelled = true;
      
    };
  }, []);

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <h2>CSV load failed</h2>
        <pre>{String(error.message || error)}</pre>
        <div>URL tried: {CARDS_URL}</div>
      </div>
    );
  }

  if (!cards.length) return <div style={{ padding: 16 }}>Loading cards…</div>;

  const card = cards[idx];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        Card {idx + 1} / {cards.length}
      </div>

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(card, null, 2)}
      </pre>

      <button onClick={() => setIdx((i) => (i + 1) % cards.length)} style={{ marginTop: 12 }}>
        Next
      </button>
    </div>
  );
}
