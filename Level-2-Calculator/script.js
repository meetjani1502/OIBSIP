const display = document.getElementById("display");
const previous = document.getElementById("previous");
const buttons = document.querySelector(".buttons");

let current = "0";
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let expression = "";

function updateDisplay() {
  display.value = current;
  previous.textContent = expression;
}

function inputNumber(number) {
  if (waitingForSecondOperand) {
    current = number;
    waitingForSecondOperand = false;
  } else {
    current = current === "0" ? number : current + number;
  }
  updateDisplay();
}

function inputDecimal() {
  if (waitingForSecondOperand) {
    current = "0.";
    waitingForSecondOperand = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  updateDisplay();
}

function calculate(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      if (b === 0) throw new Error("Cannot divide by zero");
      return a / b;
    default:
      return b;
  }
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(current);

  if (operator && !waitingForSecondOperand) {
    try {
      const result = calculate(firstOperand, inputValue, operator);
      current = String(Number(result.toPrecision(12)));
      firstOperand = result;
    } catch (error) {
      current = "Error";
      operator = null;
      firstOperand = null;
      waitingForSecondOperand = true;
      updateDisplay();
      return;
    }
  } else {
    firstOperand = inputValue;
  }

  operator = nextOperator;
  waitingForSecondOperand = true;
  expression = `${firstOperand} ${operator}`;
  updateDisplay();
}

function handleCalculate() {
  if (!operator || waitingForSecondOperand) return;

  const secondOperand = parseFloat(current);

  try {
    const result = calculate(firstOperand, secondOperand, operator);
    expression = `${firstOperand} ${operator} ${secondOperand} =`;
    current = String(Number(result.toPrecision(12)));
  } catch (error) {
    expression = "";
    current = "Error";
  }

  firstOperand = null;
  operator = null;
  waitingForSecondOperand = true;
  updateDisplay();
}

function clearCalculator() {
  current = "0";
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  expression = "";
  updateDisplay();
}

function deleteLast() {
  if (waitingForSecondOperand || current === "Error") {
    current = "0";
    waitingForSecondOperand = false;
  } else {
    current = current.length > 1 ? current.slice(0, -1) : "0";
  }
  updateDisplay();
}

function percentage() {
  const value = parseFloat(current);
  current = String(value / 100);
  updateDisplay();
}

function changeSign() {
  if (current === "0" || current === "Error") return;
  current = String(parseFloat(current) * -1);
  updateDisplay();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const value = button.dataset.value;

  if (action === "clear") clearCalculator();
  else if (action === "delete") deleteLast();
  else if (action === "percent") percentage();
  else if (action === "sign") changeSign();
  else if (action === "calculate") handleCalculate();
  else if (value >= "0" && value <= "9") inputNumber(value);
  else if (value === ".") inputDecimal();
  else if (["+", "-", "*", "/"].includes(value)) handleOperator(value);
});

document.addEventListener("keydown", (event) => {
  if (event.key >= "0" && event.key <= "9") inputNumber(event.key);
  else if (event.key === ".") inputDecimal();
  else if (["+", "-", "*", "/"].includes(event.key)) handleOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") handleCalculate();
  else if (event.key === "Backspace") deleteLast();
  else if (event.key === "Escape") clearCalculator();
});

updateDisplay();
