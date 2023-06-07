let currentCardIndex = 0;
const score = {};

// Function to save the current card to localStorage
function saveCurrentCard() {
  localStorage.setItem('currentCardIndex', currentCardIndex);
}




// Function to show the current card
function showCurrentCard() {
  // Retrieve the current card index from localStorage if it exists
  const storedCardIndex = localStorage.getItem('currentCardIndex');
  if (storedCardIndex !== null) {
    currentCardIndex = parseInt(storedCardIndex);
  }

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
  questionElement.classList.add('question'); // Replace 'className' with the name of the class you want to add
  questionElement.textContent = cardData.question;
  quizContainer.appendChild(questionElement);

  // Create options
  cardData.options.forEach((option, index) => {
    const optionContainer = document.createElement('fieldset');

    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = `${cardKey}`;
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
    const isCorrect = cardData.answer - 1 === answer;

    // Save the result to local storage
    localStorage.setItem(cardKey, isCorrect ? '1' : '0');

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

    if (isCorrect) {
      showNextCard(); // Move to the next card only if the answer is correct
    } else {
      // Show the Next button only for wrong answers
      if (!document.getElementById('nextButton')) {
        const nextButton = document.createElement('button');
        nextButton.id = 'nextButton';
        nextButton.className = 'button';
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', showNextCard);

        // Append the Next button to the parent element
        document.getElementById('quizContainer').appendChild(nextButton);
      }
    }
  } else {
    alert('Please select an answer.');
  }
}





// Function to show the next card
function showNextCard() {
  if (currentCardIndex < Object.keys(quizData).length - 1) {
    currentCardIndex++;
    saveCurrentCard(); // Save the current card to localStorage

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
