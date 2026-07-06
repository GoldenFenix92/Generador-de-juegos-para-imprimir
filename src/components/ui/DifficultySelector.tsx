import { Select } from "./Select";
import type { Difficulty } from "../../types/games";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
  options?: { value: Difficulty; label: string }[];
}

const DEFAULT_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Medio" },
  { value: "hard", label: "Difícil" },
  { value: "expert", label: "Experto" },
];

export function DifficultySelector({ value, onChange, options = DEFAULT_OPTIONS }: DifficultySelectorProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Dificultad</label>
      <Select value={value} onChange={(e) => onChange(e.target.value as Difficulty)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
