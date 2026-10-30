require("dotenv").config();

const mongoose = require("mongoose");
const Pizza = require("./models/Pizza");

const pizzas = [
  {
    name: "Margherita Pizza",
    description: "Classic cheese, fresh tomatoes and basil.",
    price: 199,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
  },
  {
    name: "Farmhouse Pizza",
    description: "Onion, capsicum, tomato and delicious cheese.",
    price: 299,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600",
  },
  {
    name: "Pepperoni Pizza",
    description: "Loaded with pepperoni and mozzarella cheese.",
    price: 349,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
  },
  {
    name: "Veggie Supreme",
    description: "Fresh vegetables with special pizza sauce.",
    price: 279,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600",
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    await Pizza.deleteMany({});
    await Pizza.insertMany(pizzas);

    console.log("4 pizzas inserted successfully!");
  } catch (error) {
    console.error("Seeding Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  }
};

seedDatabase();
