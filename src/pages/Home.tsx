import { useNavigate } from "react-router-dom";

const GAMES = [
  { id: "wordsearch", name: "Sopa de Letras", description: "Encuentra palabras ocultas en una cuadricula de letras." },
  { id: "sudoku", name: "Sudoku", description: "Completa la cuadricula con numeros del 1 al 9." },
  { id: "maze", name: "Laberinto", description: "Encuentra el camino desde la entrada hasta la salida." },
  { id: "tictactoe", name: "Tres en Raya", description: "Clasico juego de tablero para dos jugadores." },
] as const;

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Generador de Juegos Imprimibles</h1>
      <p className="mb-8 text-gray-600">
        Selecciona un juego, configura los parámetros y descarga tu PDF listo para imprimir.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => navigate(`/generator/${game.id}`)}
            className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <h2 className="mb-1 text-xl font-semibold text-gray-900">{game.name}</h2>
            <p className="text-sm text-gray-500">{game.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
