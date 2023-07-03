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
    return parseInt(NextUnansweredId)
  }
}


function logAnswer(cardId, optionId, answeredCards = getAnsweredCards(), allCards) {
  answeredCards[cardId] = [optionId, checkAnswer(cardId, optionId, allCards)]
  saveState(JSON.stringify(answeredCards), 'answeredCardsAll');
}


function checkAnswer(cardId, optionId, allCards) {
  return (parseInt(optionId) === parseInt(allCards[cardId]['answer']) - 1) ? true : false
}


function getNextErrorId() { }


function getGroupCardStateList(group, allCards, answeredCards = getAnsweredCards()) {
  const cardsInGroup = Object.keys(allCards)
    .filter(key => allCards[key].group === group)
    .reduce((result, key) => {
      result[key] = allCards[key];
      return result;
    }, {});
  const cardsStateList = {}
  for (let index in cardsInGroup) {
    if (answeredCards[index]) {
      cardsStateList[index] = { isCorrect: answeredCards[index][1] }
    } else { cardsStateList[index] = { isCorrect: null } }
    cardsStateList[index]['group'] = cardsInGroup[index]['group']
    cardsStateList[index]['numberPerGroup'] = cardsInGroup[index]['numberPerGroup']
  }
  return cardsStateList
}


// TODO return list of groups
function getAllGroupList(allCards) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}


// TODO return group of card
function getCardGroup(cardId, allCards) {
  return allCards[cardId]['group']
}


function saveState(data, localStorageVar) {
  localStorage.setItem(localStorageVar, data);
}


function startApp() {
  // if page index.html
  cardId = parseInt(localStorage.getItem('currentCardAll'));
  if (cardId == null) {
    cardId = getNextUnansweredId(allCards, getAnsweredCards());
  }
  fetch(cardsFile)
    .then(response => response.json())
    .then(jsonData => {
      // console.log(jsonData)
      allCards = jsonData;
      drawNewPage(cardId, allCards, answeredCards = getAnsweredCards(), groupList = getAllGroupList())
    })
    .catch(error => {
      console.error('Error fetching quiz data:', error);
    });
}

startApp()