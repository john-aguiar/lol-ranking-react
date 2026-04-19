
const express = require('express');
const router = express.Router();
const db = require('./database');


// Cadastro de Jogadores
router.post('/players', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome obrigatório' });
  }

  const result = db.prepare(`
    INSERT INTO players (name)
    VALUES (?)
  `).run(name);

  res.json({ id: result.lastInsertRowid, name });
});

// Listar Jogadores 
router.get('/players', (req, res) => {
  const players = db.prepare(`
    SELECT * FROM players
    ORDER BY name
  `).all();

  res.json(players);
});

// 🔥 ROTA DE DELETE (ESSENCIAL)
router.delete('/players/:id', (req, res) => {
  const { id } = req.params;
  console.log("🔥 DELETE CHAMADO", req.params.id);
  try {
    // Primeiro, deletar registros relacionados em match_players
    db.prepare(`
      DELETE FROM match_players WHERE player_id = ?
    `).run(id);

    const result = db.prepare(`
      DELETE FROM players WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar jogador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para renomear jogador
router.put('/players/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome obrigatório' });
  }

  try {
    const result = db.prepare(`
      UPDATE players SET name = ? WHERE id = ?
    `).run(name, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao renomear jogador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


// Criar Partidas

router.post('/matches', (req, res) => {
  const { mode, teamA, teamB, winner } = req.body;

  const match = db.prepare(
    'INSERT INTO matches (date, mode, winner) VALUES (?, ?, ?)'
  ).run(new Date().toISOString(), mode, winner || null);

  const matchId = match.lastInsertRowid;

  const insertPlayer = db.prepare(`
    INSERT INTO match_players (match_id, player_id, team, won)
    VALUES (?, ?, ?, ?)
  `);

  teamA.forEach(playerId => {
    insertPlayer.run(matchId, playerId, 'A', winner === 'A' ? 1 : 0);
  });

  teamB.forEach(playerId => {
    insertPlayer.run(matchId, playerId, 'B', winner === 'B' ? 1 : 0);
  });

  res.json({ message: 'Partida registrada com sucesso!', matchId });
});

router.get('/ranking', (req, res) => {
  const players = db.prepare(`
    SELECT * FROM players
  `).all();

  const result = players.map(player => {
    
    // 🔥 todas partidas do jogador
    const matches = db.prepare(`
      SELECT m.*, mp.team
      FROM matches m
      JOIN match_players mp ON mp.match_id = m.id
      WHERE mp.player_id = ?
      ORDER BY m.id DESC
    `).all(player.id);

    let wins = 0;
    let losses = 0;
    let recent = [];

    matches.forEach(match => {
      const win = match.winner === match.team;

      if (win) wins++;
      else losses++;

      // pega só os últimos 5
      if (recent.length < 5) {
        recent.push(win ? 'W' : 'L');
      }
    });

    return {
      id: player.id,
      name: player.name,
      wins,
      losses,
      recent
    };
  });

  res.json(result);
});

router.get('/matches', (req, res) => {
  const matches = db.prepare(`
    SELECT 
      m.id, m.date, m.mode, m.winner,
      GROUP_CONCAT(CASE WHEN mp.team = 'A' THEN p.name END) as teamA,
      GROUP_CONCAT(CASE WHEN mp.team = 'B' THEN p.name END) as teamB
    FROM matches m
    JOIN match_players mp ON m.id = mp.match_id
    JOIN players p ON mp.player_id = p.id
    GROUP BY m.id
    ORDER BY m.date DESC
  `).all();

  // Processar para arrays
  const result = matches.map(match => ({
    ...match,
    teamA: match.teamA ? match.teamA.split(',') : [],
    teamB: match.teamB ? match.teamB.split(',') : [],
    status: match.winner ? 'completed' : 'pending'
  }));

  res.json(result);
});

// Atualizar winner de uma match
router.put('/matches/:id', (req, res) => {
  const { id } = req.params;
  const { winner } = req.body;

  if (!['A', 'B'].includes(winner)) {
    return res.status(400).json({ error: 'Winner deve ser A ou B' });
  }

  try {
    // Atualizar winner
    const result = db.prepare(`
      UPDATE matches SET winner = ? WHERE id = ?
    `).run(winner, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    // Atualizar won em match_players
    db.prepare(`
      UPDATE match_players SET won = ? WHERE match_id = ? AND team = ?
    `).run(1, id, winner);

    db.prepare(`
      UPDATE match_players SET won = ? WHERE match_id = ? AND team != ?
    `).run(0, id, winner);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar partida:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/matches/:id', (req, res) => {
  const { id } = req.params;

  try {
    // Primeiro deletar registros relacionados em match_players
    db.prepare(`
      DELETE FROM match_players WHERE match_id = ?
    `).run(id);

    // Depois deletar a partida
    const result = db.prepare(`
      DELETE FROM matches WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar partida:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔥 ROTA PARA LIMPAR TODO O HISTÓRICO E ZERAR PONTUAÇÕES
router.delete('/matches', (req, res) => {
  try {
    // Deletar todos os registros de match_players
    db.prepare(`
      DELETE FROM match_players
    `).run();

    // Deletar todas as partidas
    db.prepare(`
      DELETE FROM matches
    `).run();

    res.json({ success: true, message: 'Todo o histórico foi limpo e as pontuações foram zeradas!' });
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/', (req, res) => {
  res.send('API do Ranking está rodando 🚀');
});

module.exports = router;
