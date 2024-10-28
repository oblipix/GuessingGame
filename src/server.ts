import express, { Express, Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Configura o servidor HTTP
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, "..", "public")));

// Rota principal
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Variável para o número alvo do jogo
let targetNumber = Math.floor(Math.random() * 100) + 1; // Número entre 1 e 100

// Mapeia WebSocket para usernames
const users = new Map<WebSocket, string>();

// Configuração do WebSocket
wss.on("connection", (ws: WebSocket) => {
  console.log("Novo jogador conectado!");

  // Envia uma mensagem inicial ao jogador
  ws.send(
    JSON.stringify({
      type: "game",
      message: "Escolha um número entre 1 e 100",
    })
  );

  // Quando uma mensagem é recebida do jogador
  ws.on("message", (message: string) => {
    try {
      const { type, guess, username } = JSON.parse(message);

      // Se o tipo for username, armazena no mapa
      if (type === "setUsername") {
        users.set(ws, username);
        ws.send(
          JSON.stringify({
            type: "feedback",
            message: `Bem-vindo, ${username}!`,
          })
        );
        return;
      }

      if (type !== "guess") return;

      const numberGuess = Number(guess);

      if (numberGuess === targetNumber) {
        // Envia uma mensagem a todos os jogadores com o resultado
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const winningUsername = users.get(ws); // Pega o username associado à conexão
            client.send(
              JSON.stringify({
                type: "result",
                correct: true, // Indica que a adivinhação foi correta
                message: `${winningUsername} Adivinhou o resultado! O número é ${targetNumber}.`,
              })
            );
          }
        });

        // Define um novo número alvo
        targetNumber = Math.floor(Math.random() * 100) + 1; // Número entre 1 e 100
      } else {
        // Envia feedback para o jogador atual
        ws.send(
          JSON.stringify({
            type: "feedback",
            message: "Incorreto! Tente de novo.",
          })
        );
      }
    } catch (error) {
      console.error("Erro ao processar a mensagem:", error);
      ws.send(
        JSON.stringify({ type: "error", message: "Formato de dados inválido." })
      );
    }
  });

  // Remove o usuário quando a conexão é fechada
  ws.on("close", () => {
    users.delete(ws);
    console.log("Jogador desconectado");
  });
});

// Inicia o servidor HTTP e WebSocket
server.listen(port, () => {
  console.log(`Servidor está escutando na porta ${port}`);
});
