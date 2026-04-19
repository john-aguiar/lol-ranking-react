import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../services/api';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameName, setRenameName] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    const data = await apiGet('/players');
    setPlayers(data);
  }

  async function createPlayer() {
    if (!name.trim()) return;

    await apiPost('/players', { name });
    setName('');
    loadPlayers();
  }

  async function deletePlayer(id) {
    try {
      const response = await fetch(`http://localhost:3000/players/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Erro ao deletar: ${response.status}`);
      }
      console.log('Jogador deletado com sucesso');
      loadPlayers();
    } catch (error) {
      console.error('Erro ao deletar jogador:', error);
      alert('Erro ao deletar jogador: ' + error.message);
    }
  }

  async function renamePlayer() {
    if (!selectedPlayer) {
      return alert('Jogador não selecionado');
    }

    if (!renameName.trim()) {
      return alert('Informe um nome válido');
    }

    try {
      await apiPut(`/players/${selectedPlayer.id}`, { name: renameName });
      setShowRenameModal(false);
      setRenameName('');
      setSelectedPlayer(null);
      await loadPlayers();
    } catch (error) {
      console.error('Erro ao renomear jogador:', error);
      alert('Erro ao renomear jogador: ' + error.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">👤 Jogadores</h1>

      {/* Form */}
      <div className="flex gap-2 mb-6">
        <input
          className="p-2 text-black w-full"
          placeholder="Nome do jogador"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <button
          className="bg-green-500 px-4 py-2 rounded"
          onClick={createPlayer}
        >
          Criar
        </button>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {players.map(p => (
          <div
            key={p.id}
            className="flex justify-between items-center bg-slate-800 p-3 rounded"
          >
            <span>{p.name}</span>
            <div className="flex gap-2">
              <button
                className="bg-blue-500 px-3 py-1 rounded"
                onClick={() => { 
                  setSelectedPlayer(p);
                  setRenameName(p.name);
                  setShowRenameModal(true);
                }}
              >
                Renomear
              </button>

              <button
                className="bg-red-500 px-3 py-1 rounded"
                onClick={() => { 
                  setSelectedPlayer(p);
                  setShowModal(true);
                }}
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            
              <div className="bg-slate-800 p-6 rounded-lg w-80">
                
                <h2 className="text-xl mb-4">⚠️ Confirmar exclusão</h2>

                <p className="mb-6">
                  Deseja realmente deletar <b>{selectedPlayer?.name}</b>?
                </p>

                <div className="flex justify-end gap-3">
                  
                  <button
                    className="bg-gray-500 px-4 py-2 rounded"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    className="bg-red-600 px-4 py-2 rounded"
                    onClick={() => {
                      deletePlayer(selectedPlayer.id);
                      setShowModal(false);
                    }}
                  >
                    Deletar
                  </button>

                </div>
              </div>
          </div>
        )}

        {showRenameModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg w-80">
              <h2 className="text-xl mb-4">✏️ Renomear Jogador</h2>

              <input
                className="p-2 text-black w-full mb-4"
                placeholder="Novo nome"
                value={renameName}
                onChange={e => setRenameName(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-500 px-4 py-2 rounded"
                  onClick={() => setShowRenameModal(false)}
                >
                  Cancelar
                </button>

                <button
                  className="bg-blue-500 px-4 py-2 rounded"
                  onClick={renamePlayer}
                >
                  Renomear
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}