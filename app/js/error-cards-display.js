/**
 * Draw question card with provided data
 * @param {Object} cardContent - card data (question, options, img, ID...) to draw
 * @param {number} cardContent.id
 * @param {string} cardContent.question
 * @param {string[]} cardContent.options
 * @param {string} [cardContent.img]
 * @param {number} cardContent.numberPerGroup
 * @param {number} cardContent.group
 * @param {number} [cardContent.chosenOption]
 * @param {boolean} cardContent.isAnswered - true if card was answered in error mode
 * @param {boolean} cardContent.drawCard - true if card was answered in error mode
 * @return {void} Nothing
 */
function drawCard(cardContent) {

  const nextUnansweredButton = document.getElementById('next-error-button')
  nextUnansweredButton.classList.add('disabled')

  // Create meta-element
  const metaElement = document.getElementById('question-id')
  metaElement.innerHTML = '';
  metaElement.textContent =
    `Г${cardContent.group}, В${cardContent.numberPerGroup}`;

  // Create img element
  document.getElementById('image-container').innerHTML = '';
  if (cardContent.img) {
    const imageElement = document.createElement('img');
    imageElement.src = 'app/content/' + cardContent.img;
    document.getElementById('image-container').appendChild(imageElement);
  }

  // Create question element
  const questionElement = document.getElementById('question-text');
  questionElement.innerHTML = '';
  questionElement.textContent = cardContent.question;

  // Create options
  const optionsContainerElement = document.getElementById('options-container');
  optionsContainerElement.innerHTML = '';

  cardContent.options.forEach((option, optionIndex) => {
    const optionElement = document.createElement('div');
    optionElement.textContent = option;
    optionElement.classList.add('singleOption', 'disable-hover');
    optionElement.id = `option-${optionIndex}`
    optionsContainerElement.appendChild(optionElement);

    // If card was answered, add listeners
    if (cardContent.drawButton !== true) {
      optionElement.classList.remove('disable-hover');

      // TODO add content to access from js (optionIndex)
      const optionListener = function () {
        console.log(`answer - ${cardContent.answer}, chosenOption - ${optionIndex}`)
        answerCard(cardContent.id, optionIndex, answeredCards = getAnsweredCards(), allCards)
      }
      optionElement.addEventListener('click', optionListener);
    }
  })

  // If card was answered, display answers and enable next-unanswered-button
  if (cardContent.drawButton === true) {
    const correctOption = cardContent.answer - 1;
    const chosenOption = cardContent.chosenOption;
    if (cardContent.isAnswered === false) {
      document.getElementById(`option-${correctOption}`).classList.add('correct');
      document.getElementById(`option-${chosenOption}`).classList.add('error');
    } else { document.getElementById(`option-${correctOption}`).classList.add('correct'); }

    nextUnansweredButton.addEventListener('click', nextButtonListener);
    nextUnansweredButton.classList.remove('disabled')
  }
};


function nextButtonListener() {
  const nextCardId = getNextErrorId(getAnsweredCards())
  if (nextCardId) {
    drawNewPage(nextCardId, allCards, answeredCards = getAnsweredCards())
  } else throw console.error(`Wrong card ID: ${nextCardId}`);
}


/**
 * 
 * @param {Object<number, boolean|null>} cardsStateList
 * @param {number} openedCardId
 * @param {object} allCards
 */
function drawTabList(groupList, selectedGroup, openedCardId) {
  document.getElementById('group-bar').innerHTML = '';

  for (let groupNumber of groupList) {
    const groupLinkElement = document.createElement('li');
    groupLinkElement.textContent = groupNumber;
    groupLinkElement.classList.add('group-link', 'tab', 'active');
    groupLinkElement.setAttribute('data-tabs', `group-${groupNumber}`);
    document.getElementById('group-bar').appendChild(groupLinkElement);
    if (groupNumber !== selectedGroup) {
      const groupTabListener = function () {
        drawCardList(getGroupErrorCards(groupNumber, allCards, answeredCards = getAnsweredCards()), openedCardId)
        drawTabList(getErrorGroupList(allCards), groupNumber, openedCardId)
      }
      groupLinkElement.classList.remove('active')
      groupLinkElement.addEventListener('click', groupTabListener); // add listener
      // draw card list
      // change classes of other tabs or draw new tablist
    }
  }
}


// 203 : {isCorrect: false, group: 2, numberPerGroup: 72}
function drawCardList(cardsStateList, openedCardId) {
  document.getElementById('card-list-container').innerHTML = '';
  for (let cardId in cardsStateList) {
    cardId = parseInt(cardId)
    const cardLinkElement = document.createElement('div');
    cardLinkElement.textContent = cardsStateList[cardId]['numberPerGroup'];
    cardLinkElement.classList.add('card-link', `card-${cardId}`);
    cardLinkElement.addEventListener('click', function () {
      drawNewPage(cardId, allCards, answeredCards = getAnsweredCards())
    });
    if (cardsStateList[cardId]['isCorrect'] === true) { cardLinkElement.classList.add('correct') }
    else if (cardsStateList[cardId]['isCorrect'] === false) { cardLinkElement.classList.add('wrong') }
    console.log(`cardId: ${typeof (cardId)} openedCardId: ${typeof (openedCardId)}`)
    if (openedCardId === cardId) {
      console.log(`currently selected card: ${cardId}`)
      cardLinkElement.classList.add('current')
      cardLinkElement.classList.remove('correct', 'wrong')
    }
    document.getElementById('card-list-container').appendChild(cardLinkElement);
  }
}


function answerCard(cardId, optionId, answeredCards = getAnsweredCards(), allCards) {
  answer = logAnswer(cardId, optionId, answeredCards, allCards)
  drawCard(getContentForCard(cardId, allCards, answer, true))
}


function drawNewPage(cardId, allCards, answeredCards = getAnsweredCards()) {
  // if cardId null, draw emptystate "all question being answered"
  drawCard(cardContent = getContentForCard(cardId, allCards, answeredCards))
  const selectedGroup = getCardGroup(cardId, allCards)
  const groupList = getErrorGroupList(allCards, answeredCards)
  drawTabList(groupList, selectedGroup, cardId)
  const cardsStateList = getGroupErrorCards(selectedGroup, allCards, answeredCards)
  drawCardList(cardsStateList, openedCardId = cardId)
  saveState(cardId, 'currentCardError')
}


