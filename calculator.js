let currentValue = '';

let runningTotal = '';

let operatorWasLastPressed = false;

let currentOperator = null;

const rootElement = document.getElementById('app');

const rowsElement = document.createElement('div');

rowsElement.classList.add('rows');

const errorElement = document.createElement('div');

errorElement.classList.add('error');

const resultElement = document.createElement('textarea');

resultElement.rows = 1;

resultElement.readonly = 1;

const operatorsElement = document.createElement('div');

operatorsElement.classList.add('operators');

function refreshScreen() {
  resultElement.value = currentValue || runningTotal;
}

function hideError() {
  errorElement.style.display = 'none';
}

function showError(message) {
  errorElement.innerHTML = message;
  errorElement.style.display = '';
}

function createRowHtmlElement(item) {
  const isCreatingNumber = Number.isInteger(item.text);

  const element = isCreatingNumber ? createNumberButton(item.text) : createOperatorButton(item);

  const attributes = item.attributes || {};

  if (item.class) {
    element.classList.add(item.class);
  }

  return element;
}

function addRow(items) {
  const row = document.createElement('div');

  for (let item of items) {
    const button = createRowHtmlElement(item);

    button.type = 'button';

    row.appendChild(button);
  }

  row.classList.add('row');

  rowsElement.appendChild(row);
}

function computeResult() {
  if (!currentOperator || !runningTotal || !currentValue) {
    return;
  }
  // some operators like multiplication use a different expression * from what's showed to the user x
  const operator = currentOperator.expression || currentOperator.text;

  if (operator === '+') {
    currentValue = +runningTotal + +currentValue;
    return refreshScreen();
  }

  if (operator === '*') {
    currentValue = +runningTotal * +currentValue;
    return refreshScreen();
  }
  if (operator === '/') {
    // we should probably prevent dividing by 0, but for now we will stick to javascripts Infinity
    currentValue = +runningTotal / +currentValue;
    return refreshScreen();
  }
  if (operator === '-') {
    currentValue = +runningTotal - +currentValue;
    return refreshScreen();
  }
}

function handleNumberPressed(number) {
  if (currentOperator) {
    currentOperator.button.classList.remove('active');
  }
  // if an operator was recently pressed, we will simply swap the running total with the current value
  //  and reset the current value
  if (operatorWasLastPressed) {
    runningTotal = currentValue;
    currentValue = '';
  }

  operatorWasLastPressed = false;

  currentValue += String(number);

  refreshScreen();
}

function clearCurrentOperator() {
  if (currentOperator) {
    currentOperator.button.classList.remove('active');
  }
  currentOperator = null;
}
function clearScreen(value = 0) {
  currentValue = '';
  runningTotal = '';
  operatorWasLastPressed = false;
  clearCurrentOperator();
  resultElement.value = value;
}

function handleOperatorPressed(operator) {
  if (currentOperator) {
    currentOperator.button.classList.remove('active');
  }

  if (!['c', '='].includes(operator.text)) {
    operator.button.classList.add('active');
  }

  // if pressing the operator was the most recent operation eg pressing a * followed by a +
  //  we will swap them and stop right way
  if (operatorWasLastPressed) {
    currentOperator = operator;
    return;
  }

  if (operator.text === 'c') {
    return clearScreen();
  }

  computeResult();

  if (operator.text === '=') {
    runningTotal = '';
    currentOperator = null;
    return;
  }

  currentOperator = operator;
  runningTotal = currentOperator;
  operatorWasLastPressed = true;
}

function addScreenItem(i) {
  const currentItem = length > 0 ? screenItems[length - 1] : null;

  screenItems.push(i);

  refreshScreen(i);
}
function createNumberButton(value) {
  const number = document.createElement('button');
  number.innerHTML = value;
  number.classList.add('number');
  number.addEventListener('click', (e) => handleNumberPressed(value));
  return number;
}

function createOperatorButton(item) {
  item.isOperator = true;

  const button = document.createElement('button');

  button.addEventListener('click', () => handleOperatorPressed(item));

  button.innerHTML = item.text;

  button.classList.add('operator');
  // store button reference so that we can easily use it for updating the active state
  // without having to query it from the dom
  item.button = button;

  return button;
}

const rows = [
  [{ text: 7 }, { text: 8 }, { text: 9 }, { text: 'x', expression: '*' }],
  [{ text: 4 }, { text: 5 }, { text: 6 }, { text: '-' }],
  [{ text: 1 }, { text: 2 }, { text: 3 }, { text: '+' }],
  [
    { text: 'c', class: 'bg-error' },
    { text: 0 },
    { text: '=', class: 'bg-primary' },
    { text: '&#247;', expression: '/' },
  ],
];

rows.forEach(addRow);

const form = document.createElement('form');

form.classList.add('calculator');

const resultsWrapper = document.createElement('div');

resultsWrapper.appendChild(resultElement);
resultsWrapper.classList.add('results');

form.appendChild(errorElement);
form.appendChild(resultsWrapper);
form.appendChild(rowsElement);
rootElement.appendChild(form);
