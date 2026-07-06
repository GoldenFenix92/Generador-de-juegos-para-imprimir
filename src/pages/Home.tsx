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
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Generador de Juegos Imprimibles
        </h1>
        <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          Selecciona un juego, configura los parametros y descarga tu PDF listo para imprimir.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => navigate(`/generator/${game.id}`)}
            className="glass-card glass-card-hover cursor-pointer text-left p-6"
          >
            <h2 className="mb-1 text-xl font-semibold text-primary">{game.name}</h2>
            <p className="text-sm text-muted">{game.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
