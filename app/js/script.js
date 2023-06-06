let currentCardIndex = 0;
const score = {};

// Function to show the current card
function showCurrentCard() {
  const cardKey = Object.keys(quizData)[currentCardIndex];
  const cardData = quizData[cardKey];

  // Clear previous card
  quizContainer.innerHTML = '';

  // Create img element
  if (cardData.img) {
    const imageElement = document.createElement('img');
    imageElement.src = 'app/content/' + cardData.img;
    quizContainer.appendChild(imageElement);
  }

  // Create question element
  const questionElement = document.createElement('p');
  questionElement.classList.add('question');
  questionElement.textContent = cardData.question;
  quizContainer.appendChild(questionElement);

  // Create options
  cardData.options.forEach((option, index) => {
    const optionContainer = document.createElement('fieldset');

    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = cardKey;
    radioInput.value = index;

    const optionLabel = document.createElement('label');
    optionLabel.textContent = option;

    optionContainer.appendChild(radioInput);
    optionContainer.appendChild(optionLabel);

    quizContainer.appendChild(optionContainer);
  });
}

// Function to check the current card
function checkCard() {
  const cardKey = Object.keys(quizData)[currentCardIndex];
  const selectedOption = quizContainer.querySelector(`input[name="${cardKey}"]:checked`);

  if (selectedOption !== null) {
    const answer = parseInt(selectedOption.value);
    const cardData = quizData[cardKey];

    score[cardKey] = cardData.answer - 1 === answer;

    // Mark the correct answer
    const options = quizContainer.querySelectorAll(`input[name="${cardKey}"]`);
    const correctAnswer = cardData.answer - 1;
    options.forEach((option, index) => {
      const label = option.nextElementSibling;
      if (index === correctAnswer) {
        label.style.color = 'green';
      } else {
        label.style.color = 'initial';
      }
    });

    selectedOption.disabled = true; // Disable options after checking

    if (cardData.answer - 1 === answer) {
      showNextCard(); // Move to the next card only if the answer is correct
    }
  } else {
    alert('Please select an answer.');
  }
}

// Function to show the next card
function showNextCard() {
  if (currentCardIndex < Object.keys(quizData).length - 1) {
    currentCardIndex++;
    setTimeout(showCurrentCard, 1000); // Add a 1-second delay before showing the next card
  } else {
    setTimeout(showResults, 1000); // Add a 1-second delay before showing results
  }
}

// Function to show the quiz results
function showResults() {
  quizContainer.innerHTML = '';

  Object.keys(score).forEach(cardKey => {
    const cardData = quizData[cardKey];
    const resultElement = document.createElement('p');
    const isCorrect = score[cardKey] ? 'Correct' : 'Incorrect';
    resultElement.textContent = `${cardData.question} - ${isCorrect}`;

    // Mark the correct answer
    if (!score[cardKey]) {
      const options = quizContainer.querySelectorAll(`input[name="${cardKey}"]`);
      const correctAnswer = cardData.answer - 1;
      options.forEach((option, index) => {
        if (index === correctAnswer) {
          const label = option.nextElementSibling;
          label.style.color = 'green';
        }
      });
    }

    quizContainer.appendChild(resultElement);
  });
}

// Fetch the quiz data from JSON file
fetch('app/content/cards.json')
  .then(response => response.json())
  .then(data => {
    // Store the quiz data
    quizData = data;

    // Show the first card
    showCurrentCard();

    // Add event listener to the Check button
    checkButton.addEventListener('click', checkCard);
  })
  .catch(error => {
    console.error('Error fetching quiz data:', error);
  });
