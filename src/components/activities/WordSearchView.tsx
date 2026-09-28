import React, { useState, useEffect } from 'react';
import { ActivityItem } from '../../types';
import { Search, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { playCorrectSound, playGentleTryAgainSound } from '../../utils/soundEffects';

interface WordSearchViewProps {
  activity: ActivityItem;
  onComplete: (score: number, total: number) => void;
}

const GRID_SIZE = 10;
const SPANISH_ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

export const WordSearchView: React.FC<WordSearchViewProps> = ({ activity, onComplete }) => {
  const data = activity.data || {};
  const wordsToFind: string[] = (data.palabras || ['MEXICO', 'MAIZ', 'ALDEA', 'PUEBLO', 'TEMPLO'])
    .map((w: string) => w.toUpperCase().replace(/[^A-ZÑ]/g, ''))
    .filter((w: string) => w.length >= 3 && w.length <= GRID_SIZE);

  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ r: number; c: number }[]>([]);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Generate word search grid
  useEffect(() => {
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));

    // Place each word in grid
    wordsToFind.forEach((word) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;
        const direction = Math.random() > 0.5 ? 'H' : 'V'; // Horizontal or Vertical
        const len = word.length;

        if (direction === 'H') {
          const r = Math.floor(Math.random() * GRID_SIZE);
          const c = Math.floor(Math.random() * (GRID_SIZE - len + 1));

          // Check if space is free
          let fits = true;
          for (let i = 0; i < len; i++) {
            if (newGrid[r][c + i] !== '' && newGrid[r][c + i] !== word[i]) {
              fits = false;
              break;
            }
          }
          if (fits) {
            for (let i = 0; i < len; i++) {
              newGrid[r][c + i] = word[i];
            }
            placed = true;
          }
        } else {
          const r = Math.floor(Math.random() * (GRID_SIZE - len + 1));
          const c = Math.floor(Math.random() * GRID_SIZE);

          let fits = true;
          for (let i = 0; i < len; i++) {
            if (newGrid[r + i][c] !== '' && newGrid[r + i][c] !== word[i]) {
              fits = false;
              break;
            }
          }
          if (fits) {
            for (let i = 0; i < len; i++) {
              newGrid[r + i][c] = word[i];
            }
            placed = true;
          }
        }
      }
    });

    // Fill remaining empty cells with random letters
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newGrid[r][c]) {
          newGrid[r][c] = SPANISH_ALPHABET[Math.floor(Math.random() * SPANISH_ALPHABET.length)];
        }
      }
    }

    setGrid(newGrid);
    setFoundWords([]);
    setSelectedCoords([]);
  }, [activity.id]);

  const handleCellClick = (r: number, c: number) => {
    // Check if cell already in selection
    const exists = selectedCoords.some((coord) => coord.r === r && coord.c === c);

    let newCoords: { r: number; c: number }[];
    if (exists) {
      newCoords = selectedCoords.filter((coord) => !(coord.r === r && coord.c === c));
    } else {
      newCoords = [...selectedCoords, { r, c }];
    }
    setSelectedCoords(newCoords);

    // Form word from selected coords
    const formedWord = newCoords.map((coord) => grid[coord.r][coord.c]).join('');
    const reversedWord = formedWord.split('').reverse().join('');

    if (wordsToFind.includes(formedWord) && !foundWords.includes(formedWord)) {
      playCorrectSound();
      const updatedFound = [...foundWords, formedWord];
      setFoundWords(updatedFound);
      setSelectedCoords([]);

      if (updatedFound.length === wordsToFind.length) {
        onComplete(wordsToFind.length, wordsToFind.length);
      }
    } else if (wordsToFind.includes(reversedWord) && !foundWords.includes(reversedWord)) {
      playCorrectSound();
      const updatedFound = [...foundWords, reversedWord];
      setFoundWords(updatedFound);
      setSelectedCoords([]);

      if (updatedFound.length === wordsToFind.length) {
        onComplete(wordsToFind.length, wordsToFind.length);
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedCoords([]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-teal-50 border border-teal-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-teal-950 font-heading">
              Sopa de Letras Histórica
            </h3>
            <p className="text-xs text-teal-800">
              Toca las letras en orden para encontrar las palabras escondidas.
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-teal-900 bg-white px-3 py-1.5 rounded-full border border-teal-300">
          Encontradas: {foundWords.length} de {wordsToFind.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Letter Grid (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xs flex flex-col items-center">
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5 select-none touch-manipulation">
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const isSelected = selectedCoords.some((coord) => coord.r === r && coord.c === c);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs scale-105 ring-2 ring-teal-300'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/80 active:scale-95'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-4 flex items-center justify-between w-full max-w-sm px-2">
            <span className="text-xs text-stone-500 font-medium">
              Seleccionadas: {selectedCoords.length} letras
            </span>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs font-bold text-stone-500 hover:text-stone-800"
            >
              Limpiar selección
            </button>
          </div>
        </div>

        {/* Word list checklist (1 col) */}
        <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
              Palabras a buscar:
            </h4>
            <div className="space-y-2">
              {wordsToFind.map((word, idx) => {
                const isFound = foundWords.includes(word);
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                      isFound
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 line-through'
                        : 'bg-white border-stone-200 text-stone-800'
                    }`}
                  >
                    <span>{word}</span>
                    {isFound && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {foundWords.length === wordsToFind.length && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <div className="text-xs font-bold text-emerald-900 mb-2">
                ¡Encontraste todas las palabras!
              </div>
              <button
                type="button"
                onClick={() => onComplete(wordsToFind.length, wordsToFind.length)}
                className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Finalizar actividad
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
