const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Order = require("../models/Order");
const Pizza = require("../models/Pizza");
const { protect } = require("../middleware/auth.middleware");

// Razorpay configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper: Validate and calculate order items
const prepareOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Please add at least one pizza to your order.");
  }

  for (const item of items) {
    if (
      !item.pizzaId ||
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1
    ) {
      throw new Error("Invalid pizza or quantity.");
    }
  }

  const pizzaIds = items.map((item) => item.pizzaId);
  const pizzas = await Pizza.find({
    _id: { $in: pizzaIds },
  });

  if (pizzas.length !== new Set(pizzaIds.map(String)).size) {
    throw new Error("One or more pizzas were not found.");
  }

  const orderItems = items.map((item) => {
    const pizza = pizzas.find((p) => p._id.toString() === item.pizzaId);

    return {
      pizzaId: pizza._id,
      name: pizza.name,
      price: pizza.price,
      quantity: Number(item.quantity),
    };
  });

  const subtotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const deliveryFee = 40;

  return {
    orderItems,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
};

// Helper: Validate delivery address
const validateAddress = (deliveryAddress) => {
  const requiredFields = ["fullName", "phone", "address", "city", "pincode"];

  const missingField = requiredFields.find(
    (field) => !deliveryAddress?.[field]?.toString().trim(),
  );

  if (missingField) {
    throw new Error(`Please provide ${missingField}.`);
  }
};

// POST: Create a Cash on Delivery order
router.post("/", protect, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    validateAddress(deliveryAddress);

    if (paymentMethod && paymentMethod !== "cod") {
      return res.status(400).json({
        message: "Use the Razorpay payment endpoint for online payments.",
      });
    }

    const { orderItems, subtotal, deliveryFee, total } =
      await prepareOrderItems(items);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: "cod",
      paymentStatus: "pending",
    });

    res.status(201).json({
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("Create COD order error:", error);

    res.status(400).json({
      message: error.message || "Unable to place order.",
    });
  }
});

// POST: Create Razorpay payment order
router.post("/razorpay/create-order", protect, async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    console.log("Razorpay create-order request received.");

    validateAddress(deliveryAddress);

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        message: "Razorpay credentials are not configured.",
      });
    }

    const { orderItems, subtotal, deliveryFee, total } =
      await prepareOrderItems(items);

    if (!Number.isFinite(total) || total <= 0) {
      throw new Error("Invalid order amount.");
    }

    // Create database order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
    });

    console.log("MongoDB order created:", order._id.toString());

    // Create Razorpay order (amount is in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    console.log("Razorpay order created:", razorpayOrder.id);

    // Save Razorpay order ID in MongoDB
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      message: "Razorpay order created successfully.",
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
    });
  } catch (error) {
    // Detailed Razorpay error reporting
    console.error("\n========== RAZORPAY CREATE ORDER ERROR ==========");
    console.error("Message:", error.message);
    console.error("Description:", error.error?.description);
    console.error("Code:", error.error?.code);
    console.error("Status:", error.statusCode);
    console.error("Full error details:", error.error || error);
    console.error("==================================================\n");

    res.status(400).json({
      message:
        error.error?.description ||
        error.message ||
        "Unable to create Razorpay order.",
      code: error.error?.code || "UNKNOWN_ERROR",
    });
  }
});

// POST: Verify Razorpay payment
router.post("/razorpay/verify-payment", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        message: "Missing payment verification details.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      order.paymentMethod !== "razorpay" ||
      order.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        message: "Payment order does not match.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.json({
        success: true,
        message: "Payment already verified.",
        order,
      });
    }

    // Verify signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signaturesMatch =
      generatedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature),
      );

    if (!signaturesMatch) {
      order.paymentStatus = "failed";
      await order.save();

      return res.status(400).json({
        message: "Payment signature verification failed.",
      });
    }

    // Confirm payment with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== Math.round(order.total * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        message: "Payment is not captured or payment details do not match.",
      });
    }

    order.paymentStatus = "paid";
    await order.save();

    res.json({
      success: true,
      message: "Payment verified successfully!",
      order,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);

    res.status(500).json({
      message:
        error.error?.description ||
        error.message ||
        "Unable to verify payment.",
    });
  }
});

// GET: Get logged-in user's orders
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    res.status(500).json({
      message: "Unable to fetch orders.",
    });
  }
});

// GET: Get one order by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(400).json({
      message: "Invalid order ID.",
    });
  }
});

module.exports = router;
