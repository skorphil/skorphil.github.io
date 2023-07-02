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
 * @return {void} Nothing
 */

function drawCard(cardContent) {

  const nextUnansweredButton = document.getElementById('next-unanswered-button')
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

    // If card was not answered, add listeners
    if (cardContent.chosenOption == undefined) {
      optionElement.classList.remove('disable-hover');
      // add content to access from js (optionIndex)
      const optionListener = function () {
        console.log(`answer - ${cardContent.answer}, chosenOption - ${optionIndex}`)
        answerCard(cardContent.id, optionIndex, answeredCards = getAnsweredCards(), allCards)
      }
      optionElement.addEventListener('click', optionListener);
    }
  })

  // If card was answered, display answers and enable next-unanswered-button
  if (cardContent.chosenOption !== undefined) {
    const correctOption = cardContent.answer - 1;
    const chosenOption = cardContent.chosenOption;
    if (correctOption !== chosenOption) {
      document.getElementById(`option-${correctOption}`).classList.add('correct');
      document.getElementById(`option-${chosenOption}`).classList.add('error');
    } else { document.getElementById(`option-${correctOption}`).classList.add('correct'); }

    nextUnansweredButton.addEventListener('click', nextButtonListener);
    nextUnansweredButton.classList.remove('disabled')
  }
};


function nextButtonListener() {
  const nextCardId = getNextUnansweredId(allCards, getAnsweredCards())

  if (nextCardId) {
    drawCard(getContentForCard(nextCardId, allCards, getAnsweredCards()))
  } else throw console.error(`Wrong card ID: ${nextCardId}`);
}

/**
 * 
 * @param {Object<number, boolean|null>} cardsStateList 
 */

function drawTabList(cardsStateList, openedCardId, allCards) {

  document.getElementById('group-bar').innerHTML = '';

  // draw group tabs
  const uniqueGroups = Object.values(cardsStateList)
    .map(item => item.group)
    .filter((value, index, self) => self.indexOf(value) === index);

  for (const groupNumber of uniqueGroups) {
    const groupLinkElement = document.createElement('div');
    groupLinkElement.textContent = groupNumber;
    groupLinkElement.classList.add('group-link', 'tab');
    groupLinkElement.setAttribute('data-tabs', `group-${groupNumber}`);
    document.getElementById('group-bar').appendChild(groupLinkElement);
    if (groupNumber !== parseInt(allCards[openedCardId].group)) {
      groupLinkElement.classList.remove('active')
      groupLinkElement // listener
    }
  }
}


function drawCardList(cardsStateList, openedCardId, allCards) {
  document.getElementById('card-list-container').innerHTML = '';

}


function nextCard() { }


function answerCard(cardId, optionId, answeredCards = getAnsweredCards(), allCards) {
  logAnswer(cardId, optionId, answeredCards, allCards)
  drawCard(getContentForCard(cardId, allCards, answeredCards))
}




