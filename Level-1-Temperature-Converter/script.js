const temperature = document.getElementById("temperature");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const result = document.getElementById("result");

document.getElementById("convertBtn").addEventListener("click", () => {
  const value = parseFloat(temperature.value);

  if (temperature.value.trim() === "" || !Number.isFinite(value)) {
    result.textContent = "Please enter a valid temperature.";
    return;
  }

  let celsius;

  // Convert input to Celsius first
  if (fromUnit.value === "Celsius") {
    celsius = value;
  } else if (fromUnit.value === "Fahrenheit") {
    celsius = ((value - 32) * 5) / 9;
  } else {
    celsius = value - 273.15;
  }

  // Convert Celsius to the selected unit
  let converted;

  if (toUnit.value === "Celsius") {
    converted = celsius;
  } else if (toUnit.value === "Fahrenheit") {
    converted = (celsius * 9) / 5 + 32;
  } else {
    converted = celsius + 273.15;
  }

  const symbols = {
    Celsius: "°C",
    Fahrenheit: "°F",
    Kelvin: "K",
  };

  result.textContent = `${value} ${symbols[fromUnit.value]} = ${converted.toFixed(2)} ${symbols[toUnit.value]}`;
});

document.getElementById("resetBtn").addEventListener("click", () => {
  temperature.value = "";
  fromUnit.value = "Celsius";
  toUnit.value = "Fahrenheit";
  result.textContent = "Your result will appear here";
});
