
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-slate-800 p-4 flex gap-4 flex-wrap">
      <Link to="/">🏆 Ranking</Link>
      <Link to="/players">👤 Jogadores</Link>
      <Link to="/matches">🎮 Partidas</Link>
      <Link to="/history">🕘 Histórico</Link>
    </nav>
  )
}
