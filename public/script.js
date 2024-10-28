let randomNumber;
let attempts = 0;
let previousGuesses = new Set();
let socket;
let isMultiplayer = false;
let username = "";
let avatarURL = "caminho/para/seu/avatar.jpg"; // Altere este caminho para o seu avatar padrão
let score = 100;

const guessButton = document.getElementById("guess-button");
const soloButton = document.getElementById("solo-button");
const multiplayerButton = document.getElementById("multiplayer-button");
const guessInput = document.getElementById("guess-input");
const usernameInput = document.getElementById("username");
const gameModal = document.getElementById("game-modal");
const attemptsDisplay = document.getElementById("attempts");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-button");
const confettiContainer = document.getElementById("confetti-container");
const scoreDisplay = document.getElementById("score");
const userInfoContainer = document.getElementById("user-info-container");
const avatarElement = document.getElementById("avatar");
const usernameDisplay = document.getElementById("p-username");
const roomDisplay = document.getElementById("room-display"); // Elemento para exibir a quantidade de pessoas na sala

const avatarOptions = document.querySelectorAll(".avatar-option");
avatarOptions.forEach((avatar) => {
  avatar.addEventListener("click", () => {
    avatarOptions.forEach(option => option.classList.remove('selected'));
    avatar.classList.add('selected');
    avatarURL = avatar.src;
    avatarElement.style.backgroundImage = `url(${avatarURL})`;
    checkInputs();
  });
});

// Função para atualizar a exibição da pontuação
function updateScoreDisplay() {
  scoreDisplay.innerText = `Pontuação: ${score}`;
}

// Função para verificar se os inputs estão preenchidos corretamente
function checkInputs() {
  const usernameValid = usernameInput.value.trim().length > 2;
  const avatarSelected = avatarURL !== "caminho/para/seu/avatar.jpg";
  soloButton.disabled = !(usernameValid && avatarSelected);
  multiplayerButton.disabled = !(usernameValid && avatarSelected);
}

// Função para exibir o nome de usuário
function displayedUsername() {
  const usernameInputValue = usernameInput.value;
  if (usernameInputValue.trim().length > 2) {
    username = usernameInputValue;
    usernameDisplay.textContent = usernameInputValue;
    userInfoContainer.style.display = "flex";
    avatarElement.style.backgroundImage = `url(${avatarURL})`;
    return usernameInputValue;
  }
  alert("Nome de usuário inválido. Deve ter mais de 2 caracteres.");
  return null; // Retornar null se o nome de usuário for inválido
}

// Função para iniciar o jogo solo
function startSoloGame() {
  if (!displayedUsername()) return; // Verifica se o nome de usuário é válido
  randomNumber = Math.floor(Math.random() * 100) + 1;
  attempts = 0;
  previousGuesses.clear();
  score = 100;
  updateScoreDisplay();
  isMultiplayer = false;
  attemptsDisplay.innerText = `Tentativas: ${attempts}`;
  resultMessage.innerText = "";
  guessInput.value = "";
  restartButton.style.display = "none";
  guessButton.disabled = false;
  gameModal.style.display = "none"; // Esconder o modal do jogo solo
}

// Função para iniciar o jogo multiplayer
function startMultiplayerGame() {
  const username = displayedUsername();
  if (!username) return; // Verifica se o nome de usuário é válido

  isMultiplayer = true;
  previousGuesses.clear();

  // Mostrar o modal de seleção de sala
  const roomSelectionModal = document.getElementById("room-selection-modal");
  roomSelectionModal.style.display = "block"; // Exibir modal de seleção de sala

  const roomButtons = document.querySelectorAll(".enter-room-button");
  roomButtons.forEach(button => {
    button.addEventListener("click", () => {
      const roomSelection = button.getAttribute("data-room");
      const roomCode = `Sala ${roomSelection}`;
      const inviteLink = `http://seusite.com/multiplayer?room=${roomSelection}`;

      socket = new WebSocket("ws://localhost:3000");

      socket.onopen = () => {
        console.log("Conectado ao Servidor WebSocket");
        socket.send(JSON.stringify({ type: "joinRoom", room: roomCode, username }));
        alert(`Link de convite: ${inviteLink}`);
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "result") {
          attempts++;
          handleGuessResult(message);
        } else if (message.type === "feedback") {
          attempts++;
          attemptsDisplay.innerText = `Tentativas: ${attempts}`;
          resultMessage.innerText = message.message;
        } else if (message.type === "roomUpdate") {
          // Atualiza a quantidade de pessoas na sala
          const currentPlayers = message.currentPlayers;
          const maxPlayers = 6;
          roomDisplay.innerText = `${currentPlayers}/${maxPlayers}`; // Atualiza o display da sala
        }
      };

      socket.onclose = () => {
        console.log("Conexão WebSocket fechada");
      };

      socket.onerror = (error) => {
        console.error("Erro WebSocket:", error);
      };

      roomSelectionModal.style.display = "none"; // Esconder modal de seleção de sala
      gameModal.style.display = "none"; // Esconder modal de jogo
    });
  });

  // Cancelar seleção de sala
  const cancelRoomSelectionButton = document.getElementById("cancel-room-selection-button");
  cancelRoomSelectionButton.addEventListener("click", () => {
    roomSelectionModal.style.display = "none"; // Esconder modal de seleção de sala
    gameModal.style.display = "block"; // Mostrar modal de jogo novamente
  });
}

// Função para lidar com o resultado do palpite
function handleGuessResult(message) {
  if (message.correct) {
    attempts++;
    score = Math.max(0, score - (attempts * 2));
    updateScoreDisplay();
    resultMessage.innerHTML = message.message.includes(username)
      ? `Parabéns! Você adivinhou o número ${Array.from(previousGuesses).pop()} em ${attempts} tentativas!`
      : `Infelizmente, não foi dessa vez. ${message.message.split(" ")[0]} acertou o número.`;
    endGame();
  } else {
    attempts++;
    resultMessage.innerText = message.hint;
  }
}

// Função para encerrar o jogo
function endGame() {
  restartButton.style.display = "block";
  guessButton.disabled = true;
  for (let i = 0; i < 100; i++) createConfetti();
  createEmoji();
}

function createConfetti() {
  const confetti = document.createElement("div");
  confetti.classList.add("confetti");
  confetti.style.left = Math.random() * 100 + "vw"; // Posição horizontal aleatória
  confetti.style.backgroundColor = getRandomColor(); // Cor aleatória
  confetti.style.animationDuration = Math.random() * 2 + 3 + "s"; // Duração aleatória

  confettiContainer.appendChild(confetti);

  // Remove o confete após a animação
  setTimeout(() => {
    confetti.remove();
  }, 5000); // Ajuste o tempo conforme necessário
}

// Gera uma cor aleatória
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Função para criar o emoji
function createEmoji() {
  const emoji = document.createElement("div");
  emoji.classList.add("emoji");
  emoji.innerText = "🎉"; // Emoji de festivo
  emoji.style.fontSize = "200px"; // Tamanho do emoji, ajuste conforme necessário
  emoji.style.position = "absolute"; // Para que o emoji apareça em qualquer lugar
  emoji.style.left = "50%"; // Alinha horizontalmente ao centro
  emoji.style.top = "50%"; // Alinha verticalmente ao centro
  emoji.style.transform = "translate(-50%, -50%)"; // Move para centralizar
  document.body.appendChild(emoji);

  // Remove o emoji após 3 segundos
  setTimeout(() => {
    emoji.remove();
  }, 3000); // Ajuste o tempo conforme necessário
}

// Função para gerar uma mensagem motivacional aleatória
function getRandomMotivationalMessage() {
  const messages = [
    "Continue tentando!",
    "Você consegue!",
    "Não desista!",
    "Apenas mais uma tentativa!",
    "Acredite em você!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Evento de clique no botão de adivinhar
guessButton.addEventListener("click", () => {
  const userGuess = parseInt(guessInput.value);
  if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
    resultMessage.innerText = "Por favor, insira um número entre 1 e 100.";
    return;
  }

  if (isMultiplayer) {
    if (previousGuesses.has(userGuess)) {
      resultMessage.innerText = "Você já colocou esse palpite, tente outro.";
      return;
    }
    previousGuesses.add(userGuess);
    socket.send(JSON.stringify({ type: "guess", guess: userGuess, username }));
  } else {
    attempts++;
    attemptsDisplay.innerText = `Tentativas: ${attempts}`;
    if (userGuess === randomNumber) {
      resultMessage.innerText = `Parabéns! Você adivinhou o número ${randomNumber} em ${attempts} tentativas!`;
      endGame();
    } else {
      score = Math.max(0, score - (attempts * 2));
      updateScoreDisplay();
      resultMessage.innerText = userGuess < randomNumber ? "Tente um número maior!" : "Tente um número menor!";
    }
  }
});

// Evento de clique no botão de reiniciar
restartButton.addEventListener("click", () => {
  if (isMultiplayer) {
    socket.close(); // Fechar a conexão WebSocket ao reiniciar o jogo
  }
  startSoloGame();
});

// Eventos de clique para iniciar jogos solo e multiplayer
soloButton.addEventListener("click", startSoloGame);
multiplayerButton.addEventListener("click", startMultiplayerGame);

// Mostrar o modal inicial ao carregar a página
window.onload = () => {
  gameModal.style.display = "block"; // Exibir modal de jogo ao carregar a página
};
