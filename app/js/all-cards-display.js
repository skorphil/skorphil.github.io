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

// group, numberpergroup, img, question
function drawCard({ group, numberPerGroup, img, question, options, cardId }) {

  // Create meta-element
  const metaElement = document.getElementById('question-id')
  metaElement.innerHTML = '';
  metaElement.textContent =
    `Г${group}, В${numberPerGroup}`;


  // Create img element
  document.getElementById('image-container').innerHTML = '';
  if (img) {
    const imageElement = document.createElement('img');
    imageElement.src = 'app/content/' + cardContent.img;
    document.getElementById('image-container').appendChild(imageElement);
  }

  // Create question element
  const questionElement = document.getElementById('question-text');
  questionElement.innerHTML = '';
  questionElement.textContent = question;


  // create options
  const { isAnswered,
    isfirstAnswerCorrect,
    correctAnswer,
    firstselectedOption } = getCardAnswerHistory(cardId, allCards)

  if (isAnswered) {
    if (isfirstAnswerCorrect) {
      drawOptions({
        'options': options,
        'cardId': cardId,
        'correctId': correctAnswer - 1
      })
    } else if (!isfirstAnswerCorrect) {
      drawOptions({
        'options': options,
        'cardId': cardId,
        'correctId': correctAnswer - 1,
        'wrongId': firstselectedOption
      })
    }
  } else if (!isAnswered) {
    drawOptions({
      'options': options,
      'cardId': cardId
    })
  }


};


function drawOptions({ cardId, options, correctId = null, wrongId = null, isButtonDisabled = true }) {

  const nextUnansweredButton = document.getElementById('next-unanswered-button');
  const optionsContainerElement = document.getElementById('options-container');

  if (isButtonDisabled) {
    nextUnansweredButton.classList.add('disabled')
  } else if (!isButtonDisabled) {
    nextUnansweredButton.addEventListener('click', nextButtonListener);
    nextUnansweredButton.classList.remove('disabled');
  };

  optionsContainerElement.innerHTML = '';

  options.forEach((option, optionIndex) => {
    const optionElement = document.createElement('div');
    optionElement.textContent = option;
    optionElement.classList.add('singleOption', 'disable-hover');
    optionElement.id = `option-${optionIndex}`;
    optionsContainerElement.appendChild(optionElement);
    if (correctId === null) {
      optionElement.classList.remove('disable-hover');
      const optionListener = function () {
        // console.log(`answer - ${cardContent.answer}, chosenOption - ${optionIndex}`)

        // TODO remove reload from answerCard
        const { correctId, wrongId } = answerCard(cardId, optionIndex, answeredCards = getAnsweredCards(), allCards)
        drawOptions({
          'options': options,
          isButtonDisabled: false,
          'wrongId': wrongId,
          'correctId': correctId
        })
      }
      optionElement.addEventListener('click', optionListener);

    }
  });

  if (correctId !== null) {
    const correctOptionElement = document.getElementById(`option-${correctId}`)

    correctOptionElement.classList.add('correct');
  };
  if (wrongId !== null) {
    const wrongOptionElement = document.getElementById(`option-${wrongId}`)

    wrongOptionElement.classList.add('error');
  }
}

function nextButtonListener() {
  const nextCardId = getNextUnansweredId(allCards, getAnsweredCards())
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
    const groupLinkElement = document.createElement('div');
    groupLinkElement.textContent = groupNumber;
    groupLinkElement.classList.add('group-link', 'tab', 'active');
    groupLinkElement.setAttribute('data-tabs', `group-${groupNumber}`);
    document.getElementById('group-bar').appendChild(groupLinkElement);
    if (groupNumber !== selectedGroup) {
      const groupTabListener = function () {
        drawCardList(getGroupCardStateList(groupNumber, allCards, answeredCards = getAnsweredCards()), openedCardId)
        drawTabList(getAllGroupList(allCards), groupNumber, openedCardId)
      }
      groupLinkElement.classList.remove('active')
      groupLinkElement.addEventListener('click', groupTabListener);
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

  return logAnswer(cardId, optionId, answeredCards, allCards)
}


function drawNewPage(cardId, allCards, answeredCards = getAnsweredCards(), groupList = getAllGroupList()) {
  // if cardId null, draw emptystate "all question being answered"



  drawCard(cardContent = getContentForCard(cardId, allCards, answeredCards))
  const selectedGroup = getCardGroup(cardId, allCards)
  drawTabList(groupList, selectedGroup, cardId)
  const cardsStateList = getGroupCardStateList(selectedGroup, allCards, answeredCards)
  drawCardList(cardsStateList, openedCardId = cardId)
  saveState(cardId, 'currentCardAll')
}


