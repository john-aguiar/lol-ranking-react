# LoL Ranking React App

Um sistema completo de ranking para League of Legends construído com React no frontend e Express.js + SQLite no backend.

## 🚀 Funcionalidades

- **Gerenciamento de Jogadores**: Adicione, visualize e remova jogadores
- **Criação de Partidas**: Monte times e registre partidas concluídas
- **Sistema de Shuffling**: Distribua jogadores automaticamente em times balanceados
- **Ranking Dinâmico**: Sistema de ranking que calcula automaticamente baseado nas vitórias/derrotas
- **Histórico de Partidas**: Visualize todas as partidas com opção de editar resultados
- **Interface Responsiva**: Design moderno com Tailwind CSS

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento SPA

### Backend
- **Node.js + Express.js** - Servidor web
- **SQLite + better-sqlite3** - Banco de dados
- **CORS** - Controle de acesso cross-origin

## 📁 Estrutura do Projeto

```
lol-ranking-react/
├── backend/                 # API Express.js
│   ├── src/
│   │   ├── database.js     # Configuração SQLite
│   │   ├── routes.js       # Endpoints da API
│   │   └── server.js       # Servidor principal
│   └── package.json
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços (API calls)
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Ponto de entrada
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Backend
```bash
cd backend
npm install
npm start
# Servidor roda em http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Aplicação roda em http://localhost:5173
```

## 📡 API Endpoints

### Jogadores
- `GET /players` - Listar todos os jogadores
- `POST /players` - Criar novo jogador
- `DELETE /players/:id` - Remover jogador

### Partidas
- `GET /matches` - Listar todas as partidas
- `POST /matches` - Criar nova partida
- `PUT /matches/:id` - Atualizar resultado da partida
- `DELETE /matches/:id` - Remover partida

### Ranking
- `GET /ranking` - Obter ranking atual

## 🎯 Como Usar

1. **Adicione Jogadores**: Na página "Jogadores", adicione os participantes
2. **Crie Partidas**: Na página "Partidas", selecione jogadores e faça o shuffling
3. **Registre Resultados**: Após a partida, marque o time vencedor
4. **Acompanhe o Ranking**: Visualize o ranking atualizado automaticamente
5. **Histórico**: Veja todas as partidas na página "Histórico"

## 🔧 Desenvolvimento

### Scripts Disponíveis

#### Backend
- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento (com nodemon)

#### Frontend
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção

## 📊 Banco de Dados

O projeto utiliza SQLite com as seguintes tabelas:

- **players**: Armazena informações dos jogadores
- **matches**: Registra as partidas com data, modo e vencedor
- **match_players**: Relaciona jogadores com partidas (time A/B e se ganhou)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Seu Nome** - [Seu GitHub](https://github.com/seuusuario)

---

⭐ Se este projeto te ajudou, dê uma estrela!