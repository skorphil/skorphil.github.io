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
  drawOptions({
    'options': options,
    'cardId': cardId
  })
};

function nextButtonListener() {
  const nextCardId = getNextUnansweredId(allCards, getAnsweredCards())
  if (nextCardId) {
    drawNewPage(nextCardId, allCards, answeredCards = getAnsweredCards())
  } else throw console.error(`Wrong card ID: ${nextCardId}`);
}


function optionListener(event) {
  if (event.target.className != 'singleOption') return
  else if (event.target.className == 'singleOption') {
    console.log('is singleOption')

    $('#options-container > .singleOption').addClass('disable-hover');
    $('#next-unanswered-button').removeClass('disabled');


    let { wrongId, correctId } = logAnswer(cardId = $(event.target).attr('data-cardId'), optionId = $(event.target).attr('data-optionId'), answeredCards = getAnsweredCards(), allCards)
    if (!wrongId) {
      $(event.target).addClass('correct')
    } else {
      $(event.target).addClass('error')
      $(`#options-container > .singleOption[data-optionId=${correctId}]`).addClass('correct')
    }
  }
}

function drawOptions({ cardId, options }) {
  const optionsContainerElement = $('#options-container').empty().bind('click', optionListener);

  $('#next-unanswered-button')
    .on('click', nextButtonListener)
    .addClass('disabled');


  options.forEach((option, optionIndex) => {
    const optionElement = $('<div>')
      .text(option)
      .addClass('singleOption')
      .attr('data-optionId', optionIndex)
      .attr('data-cardId', cardId)
      .attr('id', `option-${optionIndex}`);

    $(optionsContainerElement).append(optionElement);

  });
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
        drawCardList(getGroupCardStateList(groupNumber, allCards, answeredCards = getAnsweredCards()), openedCardId)
        drawTabList(getAllGroupList(allCards), groupNumber, openedCardId)
      }
      groupLinkElement.removeClass('active')
      groupLinkElement.bind('click', groupTabListener);
    }
  }
}
// jquery

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
      console.log(`currently selected card: ${cardId}`)
      cardLinkElement.addClass('current')
      cardLinkElement.removeClass('correct wrong')
    }
    $('#card-list-container').append(cardLinkElement);
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


