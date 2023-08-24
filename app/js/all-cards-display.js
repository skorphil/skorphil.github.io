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
  $('#question-id').html(`Г${group}, В${numberPerGroup}`);

  // Create img element
  $('#image-container').empty();
  if (img) {
    $('#image-container').html(
      `<img src="app/content/${cardContent.img}" alt="Question illustration">`
    );
  }

  // Create question element
  $('#question-text').html(question)

  // create options
  const { isAnswered,
    isfirstAnswerCorrect,
    correctAnswer,
    firstSelectedOption } = getCardAnswerHistory(cardId, allCards)

  if (isAnswered) {
    if (isfirstAnswerCorrect) {
      drawOptions({
        'options': options,
        'cardId': cardId,
        'correctId': correctAnswer - 1,
        'isButtonDisabled': false,
      })
    } else if (!isfirstAnswerCorrect) {
      drawOptions({
        'options': options,
        'cardId': cardId,
        'correctId': correctAnswer - 1,
        'wrongId': firstSelectedOption,
        'isButtonDisabled': false,
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

  const nextUnansweredButton = $('#next-unanswered-button');
  const optionsContainerElement = $('#options-container').empty();

  if (isButtonDisabled) {
    nextUnansweredButton.addClass('disabled')
  } else if (!isButtonDisabled) {
    nextUnansweredButton.bind('click', nextButtonListener);
    nextUnansweredButton.removeClass('disabled');
  };



  options.forEach((option, optionIndex) => {
    const optionElement = $('<div>')
      .text(option)
      .addClass('singleOption disable-hover')
      .attr('id', `option-${optionIndex}`);

    $(optionsContainerElement).append(optionElement);
    // const optionElement = document.createElement('div');
    // optionElement.textContent = option;
    // optionElement.classList.add('singleOption', 'disable-hover');
    // optionElement.id = `option-${optionIndex}`;
    // optionsContainerElement.append(optionElement);
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
  $('#group-bar').empty();

  for (let groupNumber of groupList) {
    const groupLinkElement = $('<div>')
      .text(groupNumber)
      .addClass('group-link tab active')
      .attr('data-tabs', `group-${groupNumber}`);
    $('#group-bar').append(groupLinkElement);

    if (groupNumber !== selectedGroup) {
      const groupTabListener = function () {
        drawCardList(getGroupCardStateList(groupNumber, allCards, answeredCards = getAnsweredCards()), openedCardId)
        drawTabList(getAllGroupList(allCards), groupNumber, openedCardId)
      }
      groupLinkElement.removeClass('active')
      groupLinkElement.bind('click', groupTabListener);
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


