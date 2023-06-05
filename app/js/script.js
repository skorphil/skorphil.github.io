// Global variables
let currentGroupIndex = 0;
let currentCardIndex = 0;
const score = {};

// Function to show the current card
function showCurrentCard() {
  const groupKey = groupKeys[currentGroupIndex];
  const groupData = quizData[groupKey];
  const cardKeys = Object.keys(groupData);
  const cardKey = cardKeys[currentCardIndex];
  const cardData = groupData[cardKey];

  // Clear previous card
  quizContainer.innerHTML = '';

  // Create question element
  const questionElement = document.createElement('p');
  questionElement.textContent = cardData.question;
  quizContainer.appendChild(questionElement);

  // Create img element
  if (cardData.img) {
    const imageElement = document.createElement('img');
    imageElement.src = 'app/content/img/' + cardData.img;
    quizContainer.appendChild(imageElement);
  }


  // Create options
  cardData.options.forEach((option, index) => {
    const optionContainer = document.createElement('fieldset');

    const radioInput = document.createElement('input');

    radioInput.type = 'radio';
    radioInput.name = `${groupKey}-${cardKey}`;
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
  const groupKey = groupKeys[currentGroupIndex];
  const groupData = quizData[groupKey];
  const cardKeys = Object.keys(groupData);
  const cardKey = cardKeys[currentCardIndex];
  const selectedOption = quizContainer.querySelector(`input[name="${groupKey}-${cardKey}"]:checked`);

  if (selectedOption !== null) {
    const answer = parseInt(selectedOption.value);
    const cardData = groupData[cardKey];

    score[groupKey] = score[groupKey] || {};
    score[groupKey][cardKey] = cardData.answer - 1 === answer;

    // Mark the correct answer
    const options = quizContainer.querySelectorAll(`input[name="${groupKey}-${cardKey}"]`);
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
  const groupKey = groupKeys[currentGroupIndex];
  const groupData = quizData[groupKey];
  const cardKeys = Object.keys(groupData);

  if (currentCardIndex < cardKeys.length - 1) {
    currentCardIndex++;
    setTimeout(showCurrentCard, 1000); // Add a 1-second delay before showing the next card
  } else if (currentGroupIndex < groupKeys.length - 1) {
    currentGroupIndex++;
    currentCardIndex = 0;
    setTimeout(showCurrentCard, 1000); // Add a 1-second delay before showing the next card
  } else {
    setTimeout(showResults, 1000); // Add a 1-second delay before showing results
  }
}


// Function to show the quiz results
function showResults() {
  quizContainer.innerHTML = '';

  Object.keys(score).forEach(groupKey => {
    const groupData = quizData[groupKey];
    const cardKeys = Object.keys(groupData);

    cardKeys.forEach(cardKey => {
      const cardData = groupData[cardKey];
      const resultElement = document.createElement('p');
      const isCorrect = score[groupKey][cardKey] ? 'Correct' : 'Incorrect';
      resultElement.textContent = `${cardData.question} - ${isCorrect}`;

      // Mark the correct answer
      if (!score[groupKey][cardKey]) {
        const options = quizContainer.querySelectorAll(`input[name="${groupKey}-${cardKey}"]`);
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
  });
}

// Fetch the quiz data from JSON file
fetch('app/content/questions.json')
  .then(response => response.json())
  .then(data => {
    // Store the quiz data
    quizData = data;
    // Get the group keys
    groupKeys = Object.keys(quizData);

    // Show the first card
    showCurrentCard();

    // Add event listener to the Check button
    checkButton.addEventListener('click', checkCard);
  })
  .catch(error => {
    console.error('Error fetching quiz data:', error);
  });