const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const { protect } = require("../middleware/auth.middleware");
const { admin } = require("../middleware/admin.middleware");

// All admin routes require login and admin role
router.use(protect, admin);

// GET all customer orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
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

// UPDATE order status
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    // Update order status
    order.status = status;
    await order.save();

    // Send real-time notification using Socket.IO
    const io = req.app.get("io");

    if (io) {
      io.to(order._id.toString()).emit("order-status-updated", {
        orderId: order._id.toString(),
        status: order.status,
        message: `Your order status is now ${order.status}`,
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      message: "Unable to update order status.",
    });
  }
});

module.exports = router;
