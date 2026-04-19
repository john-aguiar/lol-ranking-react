import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';

export default function Ranking() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    loadRanking();
  }, []);

  async function loadRanking() {
    const data = await apiGet('/ranking');

    // adiciona total e winrate
    const enriched = data.map(p => {
      const total = p.wins + p.losses;
      const winrate = total ? (p.wins / total) * 100 : 0;

      return { ...p, total, winrate };
    });

    setPlayers(enriched);
  }

  function getRowStyle(index, isProvisional) {
    if (isProvisional) return 'bg-slate-700/80 border border-dashed border-gray-500';
    if (index === 0) return 'bg-blue-600';
    if (index < 3) return 'bg-slate-700';
    return 'bg-slate-800';
  }

  function renderStreak(streak = []) {
    return (
      <div className="flex gap-1">
        {streak.map((s, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded ${
              s === 'W' ? 'bg-green-400' : 'bg-red-500'
            }`}
          />
        ))}
      </div>
    );
  }

  const officialPlayers = players
    .filter(p => p.total >= 10)
    .sort((a, b) => b.winrate - a.winrate);

  const provisionalPlayers = players
    .filter(p => p.total < 10)
    .sort((a, b) => b.winrate - a.winrate);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">🏆 Classificação Baiuca</h1>
      <p className="mb-6 text-sm text-gray-300 max-w-2xl">
        O ranking oficial inclui apenas jogadores com pelo menos <strong>10 partidas</strong>.
        Jogadores com menos de 10 jogos aparecem abaixo, em uma seção provisória separada.
      </p>

      {/* Header */}
      <div className="grid grid-cols-7 text-gray-400 text-sm mb-2 px-2">
        <div>#</div>
        <div>Jogador</div>
        <div>Total</div>
        <div>Vitórias</div>
        <div>Derrotas</div>
        <div>Winrate</div>
        <div>Sequência</div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {officialPlayers.length > 0 ? (
          officialPlayers.map((p, index) => (
            <div
              key={p.id}
              className={`grid grid-cols-7 items-center p-3 rounded ${getRowStyle(index, false)}`}
            >
              <div className="font-bold text-lg">{index + 1}</div>
              <div className="font-semibold">{p.name}</div>
              <div>{p.total}</div>
              <div>{p.wins}</div>
              <div>{p.losses}</div>
              <div>{p.winrate.toFixed(1)}%</div>
              {renderStreak(p.recent)}
            </div>
          ))
        ) : (
          <div className="p-4 rounded bg-slate-800 text-gray-300">
            Nenhum jogador oficial encontrado. Ainda assim, os provisórios aparecem abaixo.
          </div>
        )}

        {provisionalPlayers.length > 0 && (
          <div className="my-4 space-y-2">
            <div className="px-3 py-2 rounded bg-slate-700 text-yellow-300 font-semibold">
              Jogadores provisórios (menos de 10 jogos)
            </div>
            <div className="px-3 py-2 rounded bg-slate-800 text-gray-300 text-sm">
              O ranking oficial considera apenas jogadores com pelo menos <strong>10 partidas</strong>.
            </div>
          </div>
        )}

        {provisionalPlayers.map((p, index) => (
          <div
            key={p.id}
            className={`grid grid-cols-7 items-center p-3 rounded ${getRowStyle(index + officialPlayers.length, true)}`}
          >
            <div className="font-bold text-lg">{officialPlayers.length + index + 1}</div>
            <div className="font-semibold">{p.name}</div>
            <div>{p.total}</div>
            <div>{p.wins}</div>
            <div>{p.losses}</div>
            <div>{p.winrate.toFixed(1)}%</div>
            {renderStreak(p.recent)}
          </div>
        ))}
      </div>
    </div>
  );
}