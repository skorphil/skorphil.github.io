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
function drawCard({ group, numberPerGroup, img, question, options, cardId }) {

  // Create meta-element
  $('#question-id').html(`Г${group}, В${numberPerGroup}`)

  // Create img element
  $('#image-container').empty();
  if (img) {
    $('#image-container').html(`<img src="app/content/${cardContent.img}" alt="Question illustration">`)
  }

  // Create question element
  $('#question-text').html(question)

  // Draw options
  drawOptions({
    'options': options,
    'cardId': cardId,
  })
};


function drawOptions({ cardId, options, correctId = null, wrongId = null, isButtonDisabled = true }) {

  const nextUnansweredButton = $('#next-error-button');
  const optionsContainerElement = $('#options-container').empty();

  if (isButtonDisabled) {
    nextUnansweredButton.addClass('disabled')
  } else if (!isButtonDisabled) {
    nextUnansweredButton.bind('click', nextButtonListener)
      .removeClass('disabled');
  };

  options.forEach((option, optionIndex) => {
    const optionElement = $('<div>')
      .text(option)
      .addClass('singleOption disable-hover')
      .attr('id', `option-${optionIndex}`);

    $(optionsContainerElement).append(optionElement);

    if (correctId === null) {
      optionElement.removeClass('disable-hover');
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
      optionElement.bind('click', optionListener);

    }
  });

  if (correctId !== null) {
    $(`#option-${correctId}`).addClass('correct');
  };

  if (wrongId !== null) {
    $(`#option-${wrongId}`).addClass('error');
  };
}


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
  $('#group-bar').empty();

  for (let groupNumber of groupList) {
    const groupLinkElement = $('<li>')
      .text(groupNumber)
      .addClass('group-link tab active')
      .attr('data-tabs', `group-${groupNumber}`);
    $('#group-bar').append(groupLinkElement);

    if (groupNumber !== selectedGroup) {
      const groupTabListener = function () {
        drawCardList(getGroupErrorCards(groupNumber, allCards, answeredCards = getAnsweredCards()), openedCardId)
        drawTabList(getErrorGroupList(allCards), groupNumber, openedCardId)
      }
      groupLinkElement.removeClass('active');
      groupLinkElement.bind('click', groupTabListener);
    }
  }
}


// 203 : {isCorrect: false, group: 2, numberPerGroup: 72}
function drawCardList(cardsStateList, openedCardId) {
  $('#card-list-container').empty();

  for (let cardId in cardsStateList) {
    cardId = parseInt(cardId)
    const cardLinkElement = $('<div>')
      .text(cardsStateList[cardId]['numberPerGroup'])
      .addClass(`card-link card-${cardId}`)
      .bind('click', function () {
        drawNewPage(cardId, allCards, answeredCards = getAnsweredCards())
      });

    if (cardsStateList[cardId]['isCorrect'] === true) { cardLinkElement.addClass('correct') }
    else if (cardsStateList[cardId]['isCorrect'] === false) { cardLinkElement.addClass('wrong') }
    console.log(`cardId: ${typeof (cardId)} openedCardId: ${typeof (openedCardId)}`)
    if (openedCardId === cardId) {
      console.log(`currently selected card: ${cardId}`);
      cardLinkElement.addClass('current');
      cardLinkElement.removeClass('correct wrong');
    }
    $('#card-list-container').append(cardLinkElement);
  }
}


function answerCard(cardId, optionId, answeredCards = getAnsweredCards(), allCards) {
  return logAnswer(cardId, optionId, answeredCards, allCards)
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


