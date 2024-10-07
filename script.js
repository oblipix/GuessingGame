// script.js

let randomNumber = Math.floor(Math.random() * 100) + 1; 
let attempts = 0;

const guessButton = document.getElementById('guess-button');
const guessInput = document.getElementById('guess-input');
const attemptsDisplay = document.getElementById('attempts');
const resultMessage = document.getElementById('result-message');
const restartButton = document.getElementById('restart-button');
const confettiContainer = document.getElementById('confetti-container');

// Array de mensagens motivacionais
const motivationalMessages = [
    "Você está indo muito bem!",
    "Não desista, você consegue!",
    "Tente novamente, você está quase lá!",
    "Continue assim, você está perto!",
    "A cada tentativa, você fica mais próximo do sucesso!",
    "Sua persistência vai te levar à vitória!",
    "Continue tentando, você está arrasando!",
    "Cada palpite conta! Você consegue!",
    "Você está fazendo um ótimo trabalho!",
    "Cada tentativa é um passo mais perto!"
];

// Função para gerar confetes
function createConfetti() {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + 'vw'; // Posição horizontal aleatória
    confetti.style.backgroundColor = getRandomColor(); // Cor aleatória
    confetti.style.animationDuration = Math.random() * 2 + 3 + 's'; // Duração aleatória
    
    confettiContainer.appendChild(confetti);

    // Remove o confete após a animação
    setTimeout(() => {
        confetti.remove();
    }, 5000); // Ajuste o tempo conforme necessário
}

// Gera uma cor aleatória
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Função para adicionar o emoji
function createEmoji() {
    const emoji = document.createElement('div');
    emoji.classList.add('emoji');
    emoji.innerText = '🎉'; // Emoji de festivo
    emoji.style.fontSize = '200px'; // Tamanho do emoji, ajuste conforme necessário
    emoji.style.position = 'absolute'; // Para que o emoji apareça em qualquer lugar
    emoji.style.left = '50%'; // Alinha horizontalmente ao centro
    emoji.style.top = '50%'; // Alinha verticalmente ao centro
    emoji.style.transform = 'translate(-50%, -50%)'; // Move para centralizar
    document.body.appendChild(emoji);

    // Remove o emoji após 3 segundos
    setTimeout(() => {
        emoji.remove();
    }, 3000); // Ajuste o tempo conforme necessário
}

// Adiciona um evento de clique ao botão de adivinhar
guessButton.addEventListener('click', () => {
    const userGuess = parseInt(guessInput.value);

    // Verifica se o palpite está dentro do intervalo permitido
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        resultMessage.innerText = 'Por favor, insira um número entre 1 e 100.';
        return; 
    }

    attempts++;
    attemptsDisplay.innerText = `Tentativas: ${attempts}`;

    // Verifica se o palpite é o número correto
    if (userGuess === randomNumber) {
        resultMessage.innerText = `Parabéns! Você adivinhou o número ${randomNumber} em ${attempts} tentativas.`;
        restartButton.style.display = 'block'; 
        guessButton.disabled = true; 
        
        // Gera confetes e emoji quando o número é adivinhado corretamente
        for (let i = 0; i < 100; i++) {
            createConfetti();
        }
        createEmoji(); // Adiciona o emoji festivo
    } else if (userGuess < randomNumber) {
        if (randomNumber - userGuess <= 5) { // Verifica se está perto
            resultMessage.innerText = 'Muito perto! Tente um número um pouco maior! ' + getRandomMotivationalMessage();
        } else {
            resultMessage.innerText = 'Tente um número maior!';
        }
    } else if (userGuess > randomNumber) {
        if (userGuess - randomNumber <= 5) { // Verifica se está perto
            resultMessage.innerText = 'Muito perto! Tente um número um pouco menor! ' + getRandomMotivationalMessage();
        } else {
            resultMessage.innerText = 'Tente um número menor!';
        }
    }

    // Mensagem de incentivo após 4 tentativas
    if (attempts > 4) {
        resultMessage.innerText += ' Não desista, você consegue! ' + getRandomMotivationalMessage();
    }
});

// Função para pegar uma mensagem motivacional aleatória
function getRandomMotivationalMessage() {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    return motivationalMessages[randomIndex];
}

// Adiciona um evento de clique ao botão de reiniciar
restartButton.addEventListener('click', () => {
    randomNumber = Math.floor(Math.random() * 100) + 1; 
    attempts = 0;
    attemptsDisplay.innerText = `Tentativas: ${attempts}`;
    resultMessage.innerText = '';
    guessInput.value = '';
    restartButton.style.display = 'none'; 
    guessButton.disabled = false; 
});
