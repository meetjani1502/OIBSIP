import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5001/api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function Checkout({ cart, clearCart }) {
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Cash on Delivery
  const handleCOD = async (token, orderItems) => {
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        items: orderItems,
        deliveryAddress: address,
        paymentMethod: "cod",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    clearCart();
    alert(response.data.message);
    navigate("/my-orders");
  };

  // Handle Razorpay payment
  const handleRazorpay = async (token, orderItems) => {
    try {
      console.log("Loading Razorpay checkout script...");

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay. Check your internet connection.",
        );
      }

      console.log("Razorpay script loaded successfully.");
      console.log("Creating Razorpay order on backend...");

      let response;

      try {
        response = await axios.post(
          `${API_URL}/orders/razorpay/create-order`,
          {
            items: orderItems,
            deliveryAddress: address,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (apiError) {
        console.error("========== RAZORPAY CREATE ORDER ERROR ==========");
        console.error("HTTP Status:", apiError.response?.status);
        console.error("Backend Response:", apiError.response?.data);
        console.error("Error Message:", apiError.message);
        console.error("=================================================");

        throw new Error(
          apiError.response?.data?.message ||
            "Unable to create Razorpay order. Check backend terminal.",
        );
      }

      const paymentData = response.data;

      console.log("Razorpay order created successfully:", paymentData);

      if (
        !paymentData.key ||
        !paymentData.razorpayOrderId ||
        !paymentData.amount ||
        !paymentData.orderId
      ) {
        throw new Error(
          "Invalid Razorpay order response. Check backend response.",
        );
      }

      return new Promise((resolve, reject) => {
        let verificationStarted = false;
        let paymentFinished = false;

        const options = {
          key: paymentData.key,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "PizzaHub",
          description: "Pizza Order Payment",
          order_id: paymentData.razorpayOrderId,

          handler: async function (paymentResponse) {
            if (paymentFinished) return;

            verificationStarted = true;

            try {
              console.log("Razorpay payment successful. Verifying...");

              const verification = await axios.post(
                `${API_URL}/orders/razorpay/verify-payment`,
                {
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  orderId: paymentData.orderId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (!verification.data.success) {
                throw new Error(
                  verification.data.message || "Payment verification failed.",
                );
              }

              paymentFinished = true;

              clearCart();
              alert("Payment successful! Your order has been placed.");
              navigate("/my-orders");

              resolve(true);
            } catch (verifyError) {
              console.error(
                "Razorpay verification error:",
                verifyError.response?.data || verifyError,
              );

              paymentFinished = true;

              reject(
                new Error(
                  verifyError.response?.data?.message ||
                    verifyError.message ||
                    "Payment verification failed. Contact support with your payment ID.",
                ),
              );
            }
          },

          prefill: {
            name: address.fullName,
            contact: address.phone,
          },

          theme: {
            color: "#e63946",
          },

          modal: {
            ondismiss: () => {
              if (!verificationStarted && !paymentFinished) {
                paymentFinished = true;

                reject(
                  new Error("Payment cancelled. Your order is still unpaid."),
                );
              }
            },
          },
        };

        const razorpay = new window.Razorpay(options);

        razorpay.on("payment.failed", (paymentResponse) => {
          if (paymentFinished) return;

          paymentFinished = true;

          console.error("Razorpay payment failed:", paymentResponse.error);

          reject(
            new Error(
              paymentResponse.error?.description ||
                "Payment failed. Please try again.",
            ),
          );
        });

        razorpay.open();
      });
    } catch (err) {
      console.error("Razorpay Error:", err);
      throw err;
    }
  };

  // Main checkout handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const orderItems = cart.map((item) => ({
      pizzaId: item._id,
      quantity: item.quantity,
    }));

    try {
      setLoading(true);

      console.log("Selected payment method:", paymentMethod);

      if (paymentMethod === "razorpay") {
        console.log("Calling Razorpay create-order endpoint...");
        await handleRazorpay(token, orderItems);
      } else if (paymentMethod === "cod") {
        console.log("Calling Cash on Delivery endpoint...");
        await handleCOD(token, orderItems);
      } else {
        throw new Error("Please select a valid payment method.");
      }
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to place your order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty!</h2>
        <Link to="/" className="primary-button">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <p className="checkout-subtitle">
        Complete your delivery details and place your order.
      </p>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Delivery Information</h2>

          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={address.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={address.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            pattern="[0-9]{10}"
            title="Enter a valid 10-digit phone number"
            required
          />

          <label>Delivery Address</label>
          <textarea
            name="address"
            value={address.address}
            onChange={handleChange}
            placeholder="House number, street, area"
            required
          />

          <label>City</label>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={handleChange}
            placeholder="Enter your city"
            required
          />

          <label>PIN Code</label>
          <input
            type="text"
            name="pincode"
            value={address.pincode}
            onChange={handleChange}
            placeholder="6-digit PIN code"
            pattern="[0-9]{6}"
            title="Enter a valid 6-digit PIN code"
            required
          />

          <h2>Payment Method</h2>

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Cash on Delivery
          </label>

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Razorpay (Online Payment)
          </label>

          {error && <p className="checkout-error">{error}</p>}

          <button
            type="submit"
            className="place-order-button"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : paymentMethod === "razorpay"
                ? `Pay ₹${total}`
                : `Place Order • ₹${total}`}
          </button>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div className="summary-item" key={item._id}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <strong>₹{item.price * item.quantity}</strong>
            </div>
          ))}

          <hr />

          <div className="summary-item">
            <span>Subtotal</span>
            <strong>₹{subtotal}</strong>
          </div>

          <div className="summary-item">
            <span>Delivery Fee</span>
            <strong>₹{deliveryFee}</strong>
          </div>

          <hr />

          <div className="summary-item summary-total">
            <span>Total</span>
            <strong>₹{total}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
