const score = {};

var currentAppMode = 'all'

var currentCardAll = 1
var nextCardAll = ''
var allCards = {}
var isRandomAll = false
var answeredCardsAll = {}
var remainingCards = {}

const allErrors = {}

const optionListeners = [];

// Starting the app in desired mode
function startApp(appMode) {

  // If appMode being passed to function, we must set that mode
  if (appMode === 'all' || appMode === 'error') {
    currentAppMode = appMode;
  } // If no appMode passed, we check if there are saved appMode in localStorage
  else if (localStorage.getItem('currentAppMode') === 'all'
    || localStorage.getItem('currentAppMode') === 'error') {
    currentAppMode = localStorage.getItem('currentAppMode');
  }

  // If we didnt retrieve currentAppMode, we will set it to 'all' as default
  if (currentAppMode === 'all') {
    console.log('allMode');
    if (localStorage.getItem('isRandomAll') !== null) {
      isRandomAll = JSON.parse(localStorage.getItem('isRandomAll'));
    } else {
      isRandomAll = true
      localStorage.setItem('isRandomAll', isRandomAll);
    }
    drawCurrentCard(getCurrentCard());
  } else if (currentAppMode === 'error') {
    console.log('errorMode');
  } else {
    currentAppMode = 'all';
    console.log('allMode_asdefault');
  }

  // Save currentAppMode and vars to localStorage
  localStorage.setItem('currentAppMode', currentAppMode);

}


// Get currentCard number
function getCurrentCard(appMode = currentAppMode) {

  if (appMode === 'all') {
    if (localStorage.getItem('currentCardAll') !== null) {
      console.log('currentCard for all mode parsed from local storage')
      currentCard = parseInt(localStorage.getItem('currentCardAll'));
    } else {
      console.log('currentCard for all mode being asked from getNextCard')
      currentCard = getNextCard(appMode)
    }

    localStorage.setItem('currentCardAll', currentCard);
    currentCardAll = currentCard

  } else if (appMode === 'error') {
    if (localStorage.getItem('currentCardError') !== null) {
      currentCard = parseInt(localStorage.getItem('currentCardError'));
    } else {
      currentCard = getNextCard(appMode)
    }

    localStorage.setItem('currentCardError', currentCard);

  } else throw new Error(`Wrong appMode: ${appMode}`);

  return currentCard
}

function getNextCard(appMode = currentAppMode) {
  if (appMode === 'all') {
    if (localStorage.getItem('answeredCardsAll') !== null) {
      answeredCardsAll = JSON.parse(localStorage.getItem('answeredCardsAll'));
      remainingCards = Object.fromEntries(
        Object.entries(allCards).filter(([key]) => !Object.keys(answeredCardsAll).includes(key))
      )
      console.log('Remaining cards from all being generated')
    } else if (localStorage.getItem('answeredCardsAll') === null) {
      remainingCards = allCards
    }
    if (isRandomAll === true) {
      // return 'random true'
      const keys = Object.keys(remainingCards);
      // console.log(keys)
      const randomIndex = Math.floor(Math.random() * keys.length);
      const randomCard = parseInt(keys[randomIndex]);
      // console.log('random')
      nextCard = randomCard
      console.log('Next card being randomly generated')
    } else if (isRandomAll === false) {
    }
  } else if (appMode === 'error') {

  } else throw new Error(`Wrong appMode: ${appMode}`);
  // console.log(nextCard)
  return nextCard
}


function drawCurrentCard(cardNumber = getCurrentCard()) {

  optionListeners.length = 0
  currentCardAll = cardNumber
  localStorage.setItem('currentCardAll', cardNumber);
  quizContainer.innerHTML = '';
  cardContent = allCards[cardNumber]

  // Create meta-element
  const metaElement = document.createElement('p');
  metaElement.textContent =
    `Question: ${cardContent.numberPerGroup}, Group: ${cardContent.group}`;
  quizContainer.appendChild(metaElement);

  // Create img element
  if (cardContent.img) {
    const imageElement = document.createElement('img');
    imageElement.src = 'app/content/' + cardContent.img;
    quizContainer.appendChild(imageElement);
  }

  // Create question element
  const questionElement = document.createElement('p');
  questionElement.classList.add('question'); // Replace 'className' with the name of the class you want to add
  questionElement.textContent = cardContent.question;
  quizContainer.appendChild(questionElement);

  // Create options
  cardContent.options.forEach((option, index) => {
    const optionElement = document.createElement('div');
    optionElement.textContent = option;
    optionElement.classList.add('singleOption');
    optionElement.id = index
    quizContainer.appendChild(optionElement);

    const optionListener = function () {
      checkAnswer(index, currentCardAll);
    };

    // If this is unanswered card, we add listener. If it's already answered, we disable hover
    if (currentAppMode === 'all' && answeredCardsAll.hasOwnProperty(currentCardAll.toString())) {
      console.log('question being answered')
      optionElement.classList.add('disable-hover');
    } else if (currentAppMode === 'all' && answeredCardsAll.hasOwnProperty(currentCardAll) === false) {
      optionElement.addEventListener('click', optionListener);
      optionListeners.push(optionListener); // Store the listener function in the array so later we can disable em after answer
    }
  })

  if (currentAppMode === 'all' && answeredCardsAll.hasOwnProperty(currentCardAll)) {
    const nextButton = document.createElement('button');
    nextButton.id = 'nextButton';
    nextButton.className = 'button';
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', function () { drawCurrentCard(getNextCard()) });
    document.getElementById('quizContainer').appendChild(nextButton);
    if (answeredCardsAll[currentCardAll][1] === false) {
      console.log('currentCardAll is in answeredCardsAll and wrong')
      document.getElementById(answeredCardsAll[currentCardAll][0]).classList.add('error');
      document.getElementById(parseInt(allCards[currentCardAll]['answer']) - 1).classList.add('correct');

    } else if (answeredCardsAll[currentCardAll][1] === true) {
      console.log('currentCardAll is in answeredCardsAll and correct')
      document.getElementById(answeredCardsAll[currentCardAll][0]).classList.add('correct');
    }
  }
  drawCardList()
}

function checkAnswer(selected_option, card) {
  if (selected_option + 1 === parseInt(allCards[card]['answer'])) {
    // return true
    // optionElement.style.backgroundColor = 'green';
    // showNextCard();
    console.log("correct answer")
    document.getElementById(selected_option).classList.add('correct');

    checkAnsweredCardsLocalStorage()
    answeredCardsAll[card] = [selected_option, true];
    localStorage.setItem('answeredCardsAll', JSON.stringify(answeredCardsAll));

  }
  else if (selected_option + 1 !== parseInt(allCards[card]['answer'])) {
    console.log("wrong answer")
    document.getElementById(selected_option).classList.add('error');
    document.getElementById(parseInt(allCards[card]['answer']) - 1).classList.add('correct');

    checkAnsweredCardsLocalStorage()
    answeredCardsAll[card] = [selected_option, false]
    localStorage.setItem('answeredCardsAll', JSON.stringify(answeredCardsAll));

  }
  optionListeners.forEach((optionListener, index) => {
    const optionElement = document.getElementById(index);
    optionElement.removeEventListener('click', optionListener);
    optionElement.classList.add('disable-hover');
  });
  optionListeners.length = 0

  // Draw next button
  const nextButton = document.createElement('button');
  nextButton.id = 'nextButton';
  nextButton.className = 'button';
  nextButton.textContent = 'Next';
  nextButton.addEventListener('click', function () { drawCurrentCard(getNextCard()) });
  document.getElementById('quizContainer').appendChild(nextButton);
}

function drawCardList(appMode = 'all') {

  document.getElementById('card-list-container').innerHTML = '';

  // Draw bar with groups
  document.getElementById('group-bar').innerHTML = '';

  const groupNumbers = [...new Set(Object.values(allCards).map(item => item.group))];
  groupNumbers.forEach((group) => {
    const groupLinkElement = document.createElement('div');
    groupLinkElement.textContent = group;
    groupLinkElement.classList.add('group-link', 'tab');
    groupLinkElement.setAttribute('data-tabs', `group-${group}`);
    document.getElementById('group-bar').appendChild(groupLinkElement);

    console.log(group);
    console.log(parseInt(allCards[currentCardAll].group));


    if (group === parseInt(allCards[currentCardAll].group)) {
      groupLinkElement.classList.add('active')
    }
  });
  // Apply style to currently active tab




  for (const key in allCards) {
    const cardLinkElement = document.createElement('div');
    cardLinkElement.textContent = allCards[key]['numberPerGroup'];
    cardLinkElement.classList.add('card-link', `group-${allCards[key].group}`);
    cardLinkElement.addEventListener('click', function () { drawCurrentCard(key) });
    // console.log(typeof (key))

    // console.log(typeof (currentCardAll))

    console.log(`${allCards[key]['group']} и ${allCards[currentCardAll]['group']}`)

    if (allCards[key]['group'] !== allCards[currentCardAll]['group']) {
      cardLinkElement.style.display = "none";
    };

    if (parseInt(currentCardAll) === parseInt(key)) {
      cardLinkElement.classList.add('current');
    }
    if (answeredCardsAll.hasOwnProperty(key.toString()) && answeredCardsAll[key][1]) {
      cardLinkElement.classList.add('answered-correct');
    } else if (answeredCardsAll.hasOwnProperty(key.toString()) && answeredCardsAll[key][1] == false) {
      cardLinkElement.classList.add('answered-wrong')
    }
    document.getElementById('card-list-container').appendChild(cardLinkElement);

  }
  var groupLinks = document.querySelectorAll(".group-link");
  console.log(groupLinks)
  var cardLinks = document.querySelectorAll(".card-link");
  console.log(cardLinks)


  groupLinks.forEach((tab) => {
    console.log(`each tab :${tab}`)
    tab.addEventListener("click", () => {
      groupLinks.forEach((tab1) => {
        tab1.classList.remove("active");
      })
      tab.classList.add("active");
      var tabval = tab.getAttribute("data-tabs");

      cardLinks.forEach((item) => {
        item.style.display = "none";
      })
      var cardsInGroup = document.querySelectorAll(`.${tabval}`)
      console.log(`cards in group :${cardsInGroup}`)
      cardsInGroup.forEach((card) => {
        card.style.display = "flex"
        console.log(card)
      })
    })
  })

}



checkAnsweredCardsLocalStorage()
function checkAnsweredCardsLocalStorage() {
  if (localStorage.getItem('answeredCardsAll') !== null) {
    answeredCardsAll = JSON.parse(localStorage.getItem('answeredCardsAll'));
  }
}

fetch('app/content/cards.json')
  .then(response => response.json())
  .then(jsonData => {
    allCards = jsonData;
    startApp()
  })
  .catch(error => {
    console.error('Error fetching quiz data:', error);
  });

