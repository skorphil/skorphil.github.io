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
function getContentForCard(cardId, allCards, answeredCardsList, drawButton) {
  console.log(allCards)
  console.log(cardId)
  const cardData = allCards[cardId]
  cardData['id'] = cardId

  if (drawButton === true) {
    cardData['drawButton'] = true
  }

  if (answeredCardsList) {
    if (answeredCardsList.hasOwnProperty(cardId) === true) {
      cardData['chosenOption'] = answeredCardsList[cardId][0]
      cardData['isAnswered'] = answeredCardsList[cardId][2]
    }
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
    console.log(`rem cards - ${remainingCards}`)
    console.log(`type of entry in rem cards - ${typeof remainingCards[1]}`)
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


function getNextErrorId(answeredCards = getAnsweredCards()) {
  if (answeredCards) {
    const remainingCards = Object.keys(answeredCards)
      .filter(key => answeredCards[key][1] === false && answeredCards[key][2] != true)

    const randomInx = Math.floor(Math.random() * remainingCards.length);
    const nextUnansweredId = parseInt(remainingCards[randomInx]);
    console.log(`next unanswered ${nextUnansweredId}`)
    return nextUnansweredId
  } else {
    console.log('no next card')
    return -1
  }
}


function logAnswerError(cardId, optionId, answeredCards = getAnsweredCards(), allCards) {
  answeredCards[cardId][2] = checkAnswer(cardId, optionId, allCards);
  console.log(answeredCards[cardId]);
  console.log(checkAnswer(cardId, optionId, allCards));
  saveState(JSON.stringify(answeredCards), 'answeredCardsAll');
}


function logAnswer(cardId, optionId, answeredCards = getAnsweredCards(), allCards) {
  if (answeredCards) {
    console.log('logAnswer answeredcards exist')
    answeredCards[cardId] = [optionId, checkAnswer(cardId, optionId, allCards)]
  } else {
    answeredCards = {}
    console.log(`logAnswer answeredcards NOT exists we create it 1st time:`)
    console.log(answeredCards)
    answeredCards[cardId] = [optionId, checkAnswer(cardId, optionId, allCards)]
    console.log(answeredCards)
  }
  saveState(JSON.stringify(answeredCards), 'answeredCardsAll');
  return answeredCards
  // console.log('Get saved from LocalStorage')
  // console.log(JSON.parse(localStorage.getItem('answeredCardsAll')))
}


function checkAnswer(cardId, optionId, allCards) {
  return (parseInt(optionId) === parseInt(allCards[cardId]['answer']) - 1) ? true : false
}


function getGroupCardStateList(group, allCards, answeredCards = getAnsweredCards()) {
  const cardsInGroup = Object.keys(allCards)
    .filter(key => allCards[key].group === group)
    .reduce((result, key) => {
      result[key] = allCards[key];
      return result;
    }, {});
  const cardsStateList = {}
  for (let index in cardsInGroup) {
    if (answeredCards) {
      if (answeredCards[index] !== undefined) {
        cardsStateList[index] = { isCorrect: answeredCards[index][1] }
      } else {
        cardsStateList[index] = { isCorrect: null }
      }
    } else { cardsStateList[index] = { isCorrect: null } }
    cardsStateList[index]['group'] = cardsInGroup[index]['group']
    cardsStateList[index]['numberPerGroup'] = cardsInGroup[index]['numberPerGroup']

  }
  return cardsStateList
}


function getGroupErrorCards(group, allCards, answeredCards = getAnsweredCards()) {
  const unansweredCards = Object.keys(answeredCards)
    .filter(key => answeredCards[key][2] !== true && answeredCards[key][1] === false);
  const cards = Object.fromEntries(
    Object.entries(allCards).filter(([key]) => unansweredCards.includes(key))
  );
  console.log(cards)
  const cardsInGroup = Object.keys(cards)
    .filter(key => cards[key].group === group)
    .reduce((result, key) => {
      result[key] = cards[key];
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


function getErrorGroupList(allCards, answeredCards = getAnsweredCards()) {
  if (answeredCards) {
    const unansweredCards = Object.keys(answeredCards)
      .filter(key => answeredCards[key][2] !== true && answeredCards[key][1] !== true)
    const cards = Object.fromEntries(
      Object.entries(allCards).filter(([key]) => unansweredCards.includes(key))
    );
    const uniqueGroups = [...new Set(Object.values(cards).map(item => item.group))];

    return uniqueGroups
  } else { }
}


function getCardGroup(cardId, allCards) {
  return allCards[cardId]['group']
}


function saveState(data, localStorageVar) {
  localStorage.setItem(localStorageVar, data);
}


function startAppAll() {
  // if page index.html

  fetch(cardsFile)
    .then(response => response.json())
    .then(jsonData => {
      allCards = jsonData;
      cardId = parseInt(localStorage.getItem('currentCardAll'));
      if (!cardId) {
        cardId = getNextUnansweredId(allCards, getAnsweredCards());
      }


      drawNewPage(cardId, allCards, answeredCards = getAnsweredCards(),
        groupList = getAllGroupList())
    })
    .catch(error => {
      console.error('Error fetching quiz data:', error);
    });
}


function startAppError() {
  // if page index.html
  fetch(cardsFile)
    .then(response => response.json())
    .then(jsonData => {
      // console.log(jsonData)
      allCards = jsonData;
      cardId = parseInt(localStorage.getItem('currentCardError'));
      if (!cardId) {
        console.log('getting random unansweredId')
        cardId = getNextErrorId(getAnsweredCards());
        console.log(cardId) //add emptystate
      }

      drawNewPage(cardId, allCards, answeredCards = getAnsweredCards(),
        groupList = getErrorGroupList(allCards, answeredCards = getAnsweredCards()))
    })
    .catch(error => {
      console.error('Error fetching quiz data:', error);
    });
}


if (document.body.classList.contains('all-cards')) {
  startAppAll()
  console.log("allMode")
} else if (document.body.classList.contains('error-cards')) {
  startAppError()
  console.log("errorMode")
}