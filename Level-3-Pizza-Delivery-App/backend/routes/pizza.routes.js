const express = require("express");
const Pizza = require("../models/Pizza");

const router = express.Router();

// Get all pizzas
router.get("/", async (req, res) => {
  try {
    const pizzas = await Pizza.find();
    res.status(200).json(pizzas);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pizzas",
      error: error.message,
    });
  }
});

// Add a pizza
router.post("/", async (req, res) => {
  try {
    const pizza = await Pizza.create(req.body);

    res.status(201).json({
      message: "Pizza added successfully",
      pizza,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add pizza",
      error: error.message,
    });
  }
});

module.exports = router;
