// Base de datos de preguntas por asignatura
const questionsDatabase = {
  informatica: [
    {
      question: "¿Cuál es la función principal de la máscara de subred en una red IPv4?",
      options: [
        "Asignar direcciones MAC de forma automática",
        "Diferenciar la porción de red de la porción de host",
        "Cifrar el tráfico de datos en la capa de red",
        "Acelerar la velocidad de transmisión de los switches"
      ],
      correct: 1,
      explanation: "La máscara de subred determina qué parte de la IP pertenece a la red y qué parte identifica al equipo de trabajo (host)."
    },
    {
      question: "¿En cuál capa del modelo OSI opera un Switch capa 2?",
      options: ["Capa 1 - Física", "Capa 2 - Enlace de datos", "Capa 3 - Red", "Capa 4 - Transporte"],
      correct: 1,
      explanation: "Los switches tradicionales trabajan en la capa 2 (Enlace de Datos) con direcciones físicas MAC."
    }
  ],
  filosofia: [
    {
      question: "¿Qué caracteriza al pensamiento filosófico de la Vanguardia en América Latina?",
      options: [
        "La imitación estricta de la lírica clásica europea",
        "La ruptura con el academicismo y la búsqueda de identidad propia",
        "El rechazo total a la tecnología y modernidad",
        "El uso exclusivo de la narrativa épica tradicional"
      ],
      correct: 1,
      explanation: "Las vanguardias latinoamericanas buscaron romper los moldes tradicionales para expresar la realidad y modernidad del continente."
    }
  ],
  quimica: [
    {
      question: "¿Qué ocurre en una reacción de oxidación-reducción (REDOX)?",
      options: [
        "Un átomo gana protones y otro gana neutrones",
        "Se transfieren electrones entre especies químicas",
        "Solo cambian los estados de agregación física",
        "Se destruye la masa total del reactivo"
      ],
      correct: 1,
      explanation: "En las reacciones REDOX hay una transferencia de electrones: una especie se oxida (pierde electrones) y otra se reduce (gana electrones)."
    }
  ],
  matematicas: [
    {
      question: "Si $f(x) = 2x + 5$, ¿cuál es el valor de $f(3)$?",
      options: ["10", "11", "13", "15"],
      correct: 1,
      explanation: "Sustituyendo $x = 3$: $f(3) = 2(3) + 5 = 6 + 5 = 11$."
    }
  ]
};

// Estado de la aplicación
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let timer = null;
let timeLeft = 600; // 10 minutos
let isPracticeMode = false;
let completedCount = 0;

// Elementos del DOM
const setupCard = document.getElementById('setup-card');
const quizCard = document.getElementById('quiz-card');
const resultCard = document.getElementById('result-card');

const quizForm = document.getElementById('quiz-form');
const subjectSelect = document.getElementById('subject-select');
const subjectBadge = document.getElementById('subject-badge');

const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressBar = document.getElementById('progress-bar');

const timerContainer = document.getElementById('timer-container');
const timeLeftDisplay = document.getElementById('time-left');

const feedbackContainer = document.getElementById('feedback-container');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackExplanation = document.getElementById('feedback-explanation');
const nextBtn = document.getElementById('next-btn');

const finalScore = document.getElementById('final-score');
const scorePercentage = document.getElementById('score-percentage');
const reviewList = document.getElementById('review-list');
const restartBtn = document.getElementById('restart-btn');
const completedCountDisplay = document.getElementById('completed-count');

// Evento de inicio del examen
quizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const selectedSubject = subjectSelect.value;
  isPracticeMode = document.querySelector('input[name="mode"]:checked').value === 'practice';
  
  currentQuestions = questionsDatabase[selectedSubject] || questionsDatabase.informatica;
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  
  subjectBadge.textContent = subjectSelect.options[subjectSelect.selectedIndex].text;
  
  setupCard.classList.add('hidden');
  quizCard.classList.remove('hidden');
  
  if (isPracticeMode) {
    timerContainer.classList.add('hidden');
  } else {
    timerContainer.classList.remove('hidden');
    startTimer();
  }
  
  loadQuestion();
});

// Cargar pregunta en pantalla
function loadQuestion() {
  const currentQ = currentQuestions[currentQuestionIndex];
  
  questionNumber.textContent = `Pregunta ${currentQuestionIndex + 1} de ${currentQuestions.length}`;
  questionText.textContent = currentQ.question;
  
  const progressPercent = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
  
  optionsContainer.innerHTML = '';
  feedbackContainer.classList.add('hidden');
  nextBtn.disabled = true;
  
  currentQ.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => selectOption(index));
    optionsContainer.appendChild(btn);
  });
}

// Selección de opción
function selectOption(selectedIndex) {
  const currentQ = currentQuestions[currentQuestionIndex];
  const optionButtons = optionsContainer.children;
  
  // Deshabilitar todos los botones
  Array.from(optionButtons).forEach(btn => btn.disabled = true);
  
  const isCorrect = selectedIndex === currentQ.correct;
  if (isCorrect) score++;
  
  userAnswers.push({
    question: currentQ.question,
    userOption: currentQ.options[selectedIndex],
    correctOption: currentQ.options[currentQ.correct],
    isCorrect: isCorrect
  });
  
  optionButtons[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    optionButtons[currentQ.correct].classList.add('correct');
  }
  
  // Mostrar retroalimentación si es modo práctica
  if (isPracticeMode) {
    feedbackContainer.classList.remove('hidden');
    feedbackContainer.className = `feedback-box ${isCorrect ? 'correct' : 'wrong'}`;
    feedbackTitle.textContent = isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta';
    feedbackExplanation.textContent = currentQ.explanation;
  }
  
  nextBtn.disabled = false;
}

// Botón de siguiente pregunta
nextBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuestions.length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
});

// Temporizador
function startTimer() {
  timeLeft = 600; // 10 minutos
  updateTimerDisplay();
  
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      finishQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeLeftDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Finalizar examen
function finishQuiz() {
  clearInterval(timer);
  
  quizCard.classList.add('hidden');
  resultCard.classList.remove('hidden');
  
  completedCount++;
  completedCountDisplay.textContent = completedCount;
  
  const total = currentQuestions.length;
  const percentage = Math.round((score / total) * 100);
  
  finalScore.textContent = `${score} / ${total}`;
  scorePercentage.textContent = `${percentage}% de aciertos`;
  
  // Generar lista de revisión
  reviewList.innerHTML = '';
  userAnswers.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `
      <p>${i + 1}. ${item.question}</p>
      <span class="${item.isCorrect ? 'text-correct' : 'text-wrong'}">
        Tu respuesta: ${item.userOption} ${item.isCorrect ? '✓' : '✗'}
      </span>
      ${!item.isCorrect ? `<br><span class="text-correct">Correcta: ${item.correctOption}</span>` : ''}
    `;
    reviewList.appendChild(div);
  });
}

// Reiniciar
restartBtn.addEventListener('click', () => {
  resultCard.classList.add('hidden');
  setupCard.classList.remove('hidden');
});