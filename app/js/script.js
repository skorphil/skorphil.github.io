const cardsFile = 'app/content/cards.json'
let allCards = {}


function getAnsweredCards() {
  if (localStorage.getItem('answeredCardsAll')) {
    return JSON.parse(localStorage.getItem('answeredCardsAll'))
  } else return null
}

/**
 * Get content from cards DB and adds answered option if question being answered before
 * @param {number} cardId 
 * @param {Object[]} allCards 
 * @param {(Object.<number, [boolean, number]>|null)} answeredCardsList
 * @returns {Object}
 */

function getContentForCard(cardId, allCards, answeredCardsList) {
  console.log(allCards)
  console.log(cardId)
  const cardData = allCards[cardId]
  cardData['id'] = cardId

  if (answeredCardsList.hasOwnProperty(cardId) === true) {
    cardData['chosenOption'] = answeredCardsList[cardId][0]
  }

  return cardData
}


/**
 * 
 * @param {Object.<number, {}>} allCards
 * @param {string} allCards{}.question // how to describe my obj structure?
 * @param {(Object.<number, [boolean, number]>|null) answeredCards} answeredCards 
 * @returns 
 */

function getNextUnansweredId(allCards, answeredCards) {
  if (answeredCards) {
    remainingCards = Object.keys(
      Object.fromEntries(
        Object.entries(allCards).filter(([key]) => !Object.keys(answeredCards).includes(key))
      )
    )
    const randomInx = Math.floor(Math.random() * remainingCards.length);
    const NextUnansweredId = parseInt(remainingCards[randomInx]);
    return NextUnansweredId
  } else { // Need testing with empty localStorage
    remainingCards = Object.keys(allCards)
    const randomInx = Math.floor(Math.random() * remainingCards.length);
    const NextUnansweredId = parseInt(remainingCards[randomInx]);
    return NextUnansweredId
  }
}


function logAnswer(cardId, optionId, answeredCards = getAnsweredCards(), allCards) {
  console.log(`answer - ${checkAnswer(cardId, optionId, allCards)}, chosenOption - ${optionId}`)
  answeredCards[cardId] = [optionId, checkAnswer(cardId, optionId, allCards)]
  localStorage.setItem('answeredCardsAll', JSON.stringify(answeredCards));
}


function checkAnswer(cardId, optionId, allCards) {
  return (parseInt(optionId) === parseInt(allCards[cardId]['answer']) - 1) ? true : false
}


function getNextErrorId() { }


function getAllCardStateList(allCards, answeredCards = getAnsweredCards()) {

  const cardsStateList = {}
  for (let index in allCards) {
    if (answeredCards[index]) {
      cardsStateList[index] = { isCorrect: answeredCards[index][1] }
    } else { cardsStateList[index] = { isCorrect: null } }
    cardsStateList[index]['group'] = allCards[index]['group']
    cardsStateList[index]['numberPerGroup'] = allCards[index]['numberPerGroup']
  }
  return cardsStateList

}



fetch(cardsFile)
  .then(response => response.json())
  .then(jsonData => {
    // console.log(jsonData)
    allCards = jsonData;
    drawCard(cardContent = getContentForCard(getNextUnansweredId(allCards, getAnsweredCards()), allCards, getAnsweredCards()))
  })
  .catch(error => {
    console.error('Error fetching quiz data:', error);
  });
