import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api'

export default function History() {
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [playerFilter, setPlayerFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editMatch, setEditMatch] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editWinner, setEditWinner] = useState('A')
  const [teamA, setTeamA] = useState([])
  const [teamB, setTeamB] = useState([])
  const [mode, setMode] = useState('3x3')
  const [winner, setWinner] = useState('A')

  useEffect(() => {
    loadPlayers()
    loadMatches()
  }, [])

  async function loadPlayers() {
    const data = await apiGet('/players')
    setPlayers(data)
  }

  async function loadMatches() {
    const data = await apiGet('/matches')
    setMatches(data)
  }

  function togglePlayer(team, player) {
    const teamAHas = teamA.some(p => p.id === player.id)
    const teamBHas = teamB.some(p => p.id === player.id)
    if (team === 'A') {
      if (teamAHas) {
        setTeamA(teamA.filter(p => p.id !== player.id))
      } else {
        setTeamA([...teamA, player])
        if (teamBHas) setTeamB(teamB.filter(p => p.id !== player.id))
      }
    } else {
      if (teamBHas) {
        setTeamB(teamB.filter(p => p.id !== player.id))
      } else {
        setTeamB([...teamB, player])
        if (teamAHas) setTeamA(teamA.filter(p => p.id !== player.id))
      }
    }
  }

  async function createHistory() {
    if (teamA.length === 0 || teamB.length === 0) {
      alert('Selecione jogadores para os dois times.')
      return
    }

    await apiPost('/matches', {
      mode,
      teamA: teamA.map(p => p.id),
      teamB: teamB.map(p => p.id),
      winner
    })

    setShowForm(false)
    setTeamA([])
    setTeamB([])
    setMode('3x3')
    setWinner('A')
    loadMatches()
  }

  async function finishMatch(matchId, selectedWinner) {
    await apiPut(`/matches/${matchId}`, { winner: selectedWinner })
    loadMatches()
  }

  async function editMatchWinner(match) {
    setEditMatch(match)
    setEditWinner(match.winner || 'A')
    setShowEditModal(true)
  }

  async function saveEditedMatch() {
    if (!editMatch) return

    await apiPut(`/matches/${editMatch.id}`, { winner: editWinner })
    setShowEditModal(false)
    setEditMatch(null)
    loadMatches()
  }

  async function deleteMatch(matchId) {
    const confirmed = window.confirm('Tem certeza que deseja deletar esta partida?')
    if (!confirmed) return

    await apiDelete(`/matches/${matchId}`)
    loadMatches()
  }

  const filteredMatches = matches.filter(match => {
    const matchDate = match.date.slice(0, 10)
    const dateOk = dateFilter ? matchDate === dateFilter : true
    const playerOk = playerFilter
      ? match.teamA.includes(playerFilter) || match.teamB.includes(playerFilter)
      : true
    return dateOk && playerOk
  })

  const completedMatches = filteredMatches.filter(m => m.status === 'completed')

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">📜 Histórico de Partidas</h1>
          <p className="text-gray-400">Registre partidas concluídas e acompanhe o vencedor e os times.</p>
        </div>
        <button
          className="bg-green-500 text-black px-4 py-2 rounded"
          onClick={() => setShowForm(true)}
        >
          Nova partida
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="date"
          className="p-2 text-black"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
        <select
          className="p-2 text-black"
          value={playerFilter}
          onChange={e => setPlayerFilter(e.target.value)}
        >
          <option value="">Filtrar por jogador</option>
          {players.map(player => (
            <option key={player.id} value={player.name}>{player.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Partidas registradas</h2>
        <div className="space-y-4">
          {completedMatches.map(match => (
            <div key={match.id} className="bg-slate-800 p-4 rounded">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-semibold">{new Date(match.date).toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Modo: {match.mode}</p>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Vencedor:</span> Time {match.winner}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Time A</h3>
                  {match.teamA.map(player => (
                    <p key={player} className="text-sm">{player}</p>
                  ))}
                </div>
                <div>
                  <h3 className="font-semibold">Time B</h3>
                  {match.teamB.map(player => (
                    <p key={player} className="text-sm">{player}</p>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="bg-blue-500 px-3 py-2 rounded"
                  onClick={() => editMatchWinner(match)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-500 px-3 py-2 rounded"
                  onClick={() => deleteMatch(match.id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Nova partida</h2>
                <p className="text-gray-400">Registre um jogo com os times e o vencedor.</p>
              </div>
              <button
                className="text-gray-300 hover:text-white"
                onClick={() => setShowForm(false)}
              >
                Fechar
              </button>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Modo</label>
              <select
                className="p-2 text-black w-full"
                value={mode}
                onChange={e => setMode(e.target.value)}
              >
                <option value="3x3">3x3</option>
                <option value="4x4">4x4</option>
                <option value="5x5">5x5</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="font-semibold mb-2">Time A</h3>
                {players.map(player => (
                  <label key={player.id} className="block mb-1">
                    <input
                      type="checkbox"
                      checked={teamA.some(p => p.id === player.id)}
                      onChange={() => togglePlayer('A', player)}
                    />
                    <span className="ml-2">{player.name}</span>
                  </label>
                ))}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Time B</h3>
                {players.map(player => (
                  <label key={player.id} className="block mb-1">
                    <input
                      type="checkbox"
                      checked={teamB.some(p => p.id === player.id)}
                      onChange={() => togglePlayer('B', player)}
                    />
                    <span className="ml-2">{player.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Vencedor</label>
              <select
                className="p-2 text-black w-full"
                value={winner}
                onChange={e => setWinner(e.target.value)}
              >
                <option value="A">Time A</option>
                <option value="B">Time B</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 px-4 py-2 rounded"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-500 px-4 py-2 rounded"
                onClick={createHistory}
              >
                Salvar partida
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Editar partida</h2>
                <p className="text-gray-400">Altere apenas o vencedor para atualizar o ranking.</p>
              </div>
              <button
                className="text-gray-300 hover:text-white"
                onClick={() => setShowEditModal(false)}
              >
                Fechar
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">{new Date(editMatch.date).toLocaleString()}</p>
              <p className="text-sm text-gray-400 mb-4">Modo: {editMatch.mode}</p>
              <label className="block mb-2">Vencedor atual</label>
              <select
                className="p-2 text-black w-full"
                value={editWinner}
                onChange={e => setEditWinner(e.target.value)}
              >
                <option value="A">Time A</option>
                <option value="B">Time B</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 px-4 py-2 rounded"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-500 px-4 py-2 rounded"
                onClick={saveEditedMatch}
              >
                Salvar alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
