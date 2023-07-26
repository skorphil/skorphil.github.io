const cardsFile = 'app/content/cards.json'
let allCards = {}


function getAnsweredCards() {
  const legacyVar = 'answeredCardsAll'
  const newVar = 'answeredCards'

  if (localStorage.getItem(legacyVar) &&
    !localStorage.getItem(newVar)) {

    const legacyProgress = JSON.parse(localStorage.getItem(legacyVar));
    const upgradedProgress = upgradeLocalStorageFormat(legacyProgress);
    saveState(upgradedProgress, newVar);

    return upgradedProgress;

  } else if (!localStorage.getItem(legacyVar) &&
    !localStorage.getItem(newVar)) {

    return null;

  } else if (localStorage.getItem(newVar)) {

    return JSON.parse(localStorage.getItem(newVar));
  }
}


function upgradeLocalStorageFormat(legacyProgressObj) {
  const upgradedObj = {};

  // used as fake dates for non-dated legacy answers
  const dateCurrent = Date.now();
  const dateYesterday = dateCurrent - 86400000;

  for (let key in legacyProgressObj) {
    upgradedObj[key] = {} // need to create key before adding nested object

    if (legacyProgressObj[key][2] === "true") { // check if question where answered correctly later
      upgradedObj[key][dateCurrent] = {
        selectedOptionId: legacyProgressObj[key][0],
        isCorrect: true
      }
    }
    upgradedObj[key][dateYesterday] = {
      answeredId: legacyProgressObj[key][0],
      isCorrect: legacyProgressObj[key][1]
    }
  }
  return upgradedObj
}


/**
 * Get content from cards DB and adds answered option if question being answered before
 * @param {number} cardId 
 * @param {Object[]} allCards 
 * @param {(Object.<number, [boolean, number]>|null)} answeredCardsList
 * @returns {Object}
 */
function getContentForCard(cardId, allCards, answeredCardsList, drawButton) {
  const cardData = {
    'group': allCards[cardId].group,
    'numberPerGroup': allCards[cardId].numberPerGroup,
    'img': allCards[cardId].img,
    'question': allCards[cardId].question,
    'options': allCards[cardId].options,
    'cardId': cardId
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
    let remainingCards = []

    for (let key in answeredCards) {
      datesWhenAnswered = Object.keys(answeredCards[key]).sort((a, b) => b - a)

      if (!(answeredCards[key][datesWhenAnswered[0]].isCorrect)) { // chek if the latest answer is correct
        remainingCards.push(key)
      }
    }

    if (remainingCards.length === 0) return null

    const randomInx = Math.floor(Math.random() * remainingCards.length);
    const nextUnansweredId = parseInt(remainingCards[randomInx]);

    return nextUnansweredId

  } else {

    return null
  }
}


function logAnswer(cardId, optionId, answeredCards = getAnsweredCards(), allCards) {
  const date = Date.now();

  if (!answeredCards) {
    answeredCards = {}
  };
  if (!answeredCards[cardId]) {
    answeredCards[cardId] = {}
  };
  const { correctId, isCorrect } = checkAnswer(cardId, optionId, allCards)
  answeredCards[cardId][date] = {
    "selectedOptionId": optionId,
    "isCorrect": isCorrect
  };

  saveState(answeredCards, 'answeredCards');

  return {
    'correctId': correctId,
    'wrongId': isCorrect ? null : optionId
  };
}


function checkAnswer(cardId, optionId, allCards) {
  return {
    'correctId': parseInt(allCards[cardId]['answer']) - 1,
    'isCorrect': (parseInt(optionId) === parseInt(allCards[cardId]['answer']) - 1) ? true : false
  }
}


function getCardAnswerHistory(cardId, allCards, answeredCards = getAnsweredCards()) {

  if (answeredCards[cardId]) {
    answersOldToNew = Object.keys(answeredCards[cardId]).sort((a, b) => a - b)

    return {
      isAnswered: true,
      'isfirstAnswerCorrect': answeredCards[cardId][answersOldToNew[0]].isCorrect,
      'firstselectedOption': answeredCards[cardId][answersOldToNew[0]].selectedOptionId,
      'correctAnswer': allCards[cardId]['answer'],
      'answers': answeredCards[cardId],
      'lastSelectedOption': answeredCards[cardId][answersOldToNew[answersOldToNew.length - 1]].selectedOptionId,
    }
  } else return { isAnswered: false }
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
      if (answeredCards[index]) {
        datesWhenAnswered = Object.keys(answeredCards[index]).sort((a, b) => a - b)

        cardsStateList[index] = { isCorrect: answeredCards[index][datesWhenAnswered[0]].isCorrect }
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
  let unansweredCards = [];

  if (answeredCards) {
    for (let key in answeredCards) {
      datesWhenAnswered = Object.keys(answeredCards[key]).sort((a, b) => b - a);

      if (!(answeredCards[key][datesWhenAnswered[0]].isCorrect)) { // chek if the latest answer is wrong
        unansweredCards.push(key)
      }
    }
  }

  if (unansweredCards.length === 0) return null

  const cards = Object.fromEntries(
    Object.entries(allCards).filter(([key]) => unansweredCards.includes(key))
  );

  const cardsInGroup = Object.keys(cards)
    .filter(key => cards[key].group === group)
    .reduce((result, key) => {
      result[key] = cards[key];
      return result;
    }, {});
  const cardsStateList = {}
  for (let index in cardsInGroup) {
    cardsStateList[index] = { isCorrect: false }
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

  let unansweredCards = [];

  if (answeredCards) {
    for (let key in answeredCards) {
      datesWhenAnswered = Object.keys(answeredCards[key]).sort((a, b) => b - a);

      if (!(answeredCards[key][datesWhenAnswered[0]].isCorrect)) { // chek if the latest answer is wrong
        unansweredCards.push(key)
      }
    }

    const cards = Object.fromEntries(
      Object.entries(allCards).filter(([key]) => unansweredCards.includes(key))
    );

    if (unansweredCards.length !== 0) {
      const uniqueGroups = [...new Set(Object.values(cards).map(item => item.group))];

      return uniqueGroups

    } else return {}

  } else return {}
}


function getCardGroup(cardId, allCards) {
  return allCards[cardId]['group']
}


function saveState(data, localStorageVar) {
  localStorage.setItem(localStorageVar, JSON.stringify(data));
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