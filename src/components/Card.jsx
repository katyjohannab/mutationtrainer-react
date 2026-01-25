export default function Card({ word, mutationType, onReveal }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-md mx-auto text-center">
      <h2 className="text-lg text-slate-500 mb-2">Mutation Type:</h2>
      <p className="text-2xl font-semibold text-emerald-800 mb-4">{mutationType}</p>

      <button
        onClick={onReveal}
        className="bg-emerald-600 text-white font-medium py-2 px-4 rounded hover:bg-emerald-700 transition"
      >
        Reveal Answer
      </button>

      {word && (
        <p className="mt-4 text-lg text-gray-700">
          <span className="font-bold">Answer:</span> {word}
        </p>
      )}
    </div>
  );
}
