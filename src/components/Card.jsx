export default function Card({ word, mutationType, onReveal }) {
  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow p-6 max-w-md mx-auto text-center">
      <h2 className="text-lg text-muted-foreground mb-2">Mutation Type:</h2>
      <p className="text-2xl font-semibold text-primary mb-4">{mutationType}</p>

      <button
        onClick={onReveal}
        className="bg-primary text-primary-foreground font-medium py-2 px-4 rounded hover:bg-primary/90 transition"
      >
        Reveal Answer
      </button>

      {word && (
        <p className="mt-4 text-lg text-muted-foreground">
          <span className="font-bold">Answer:</span> {word}
        </p>
      )}
    </div>
  );
}
