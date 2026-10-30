import OrderTracking from "../components/OrderTracking";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { Package, Clock, ShoppingBag, Radio } from "lucide-react";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveConnected, setLiveConnected] = useState(false);

  useEffect(() => {
    let socket;

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your orders.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5001/api/orders/my-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const customerOrders = response.data.orders || [];
        setOrders(customerOrders);

        // Connect to Socket.IO
        socket = io("http://localhost:5001");

        socket.on("connect", () => {
          setLiveConnected(true);

          // Join individual order rooms
          customerOrders.forEach((order) => {
            socket.emit("join-order", order._id.toString());
          });
        });

        socket.on("disconnect", () => {
          setLiveConnected(false);
        });

        // Listen for live order status updates
        socket.on("order-status-updated", (data) => {
          setOrders((previousOrders) =>
            previousOrders.map((order) =>
              order._id === data.orderId
                ? { ...order, status: data.status }
                : order,
            ),
          );
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return <div className="orders-message">Loading your orders...</div>;
  }

  if (error) {
    return (
      <div className="orders-message">
        <p>{error}</p>
        <Link to="/login" className="orders-button">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <div className="orders-header">
        <div>
          <h1>My Orders</h1>
          <p>Track and manage your pizza orders.</p>
        </div>
        <Package size={38} />
      </div>

      <div className="live-status">
        <Radio size={17} />
        <span>
          {liveConnected
            ? "Live tracking connected"
            : "Connecting to live tracking..."}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <ShoppingBag size={55} />
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="orders-button">
            Order Pizza
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card-header">
                <div>
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <span
                  className={`order-status ${order.status
                    .toLowerCase()
                    .replaceAll("_", "-")}`}
                >
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>
              <div className="order-tracking-section">
                <h4>Track Your Order</h4>
                <OrderTracking status={order.status} />
              </div>
              <div className="order-details">
                <div>
                  <span>Payment Method</span>
                  <strong>
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Razorpay"}
                  </strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>{order.paymentStatus}</strong>
                </div>

                <div>
                  <span>Delivery Address</span>
                  <strong>
                    {order.deliveryAddress.city},{" "}
                    {order.deliveryAddress.pincode}
                  </strong>
                </div>
              </div>

              <div className="order-total">
                <span>Order Total</span>
                <strong>₹{order.total}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="orders-footer">
        <Clock size={17} />
        <span>Order status updates will appear here automatically.</span>
      </div>
    </div>
  );
}

export default MyOrders;
