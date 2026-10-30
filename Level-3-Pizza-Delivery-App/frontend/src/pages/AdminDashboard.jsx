import { useEffect, useState } from "react";
import axios from "axios";
import { Package, RefreshCw } from "lucide-react";

const API = "http://localhost:5001/api/admin";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statuses = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchOrders = async () => {
    try {
      setError("");
      const response = await axios.get(`${API}/orders`, {
        headers: getHeaders(),
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.patch(
        `${API}/orders/${orderId}/status`,
        { status },
        { headers: getHeaders() },
      );

      await fetchOrders();
      alert("Order status updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status.");
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString("en-IN");

  if (loading) {
    return <div className="admin-message">Loading dashboard...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage customer orders and delivery status.</p>
        </div>

        <button className="admin-refresh" onClick={fetchOrders}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-stats">
        <div className="admin-stat-card">
          <Package size={25} />
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="admin-stat-card">
          <span>Pending Orders</span>
          <h2>{orders.filter((o) => o.status === "pending").length}</h2>
        </div>

        <div className="admin-stat-card">
          <span>Delivered Orders</span>
          <h2>{orders.filter((o) => o.status === "delivered").length}</h2>
        </div>
      </div>

      <div className="admin-orders-section">
        <h2>Customer Orders</h2>

        {orders.length === 0 ? (
          <p className="admin-empty">No customer orders found.</p>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => (
              <div className="admin-order-card" key={order._id}>
                <div className="admin-order-top">
                  <div>
                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>

                  <strong className="admin-order-total">₹{order.total}</strong>
                </div>

                <div className="admin-customer-info">
                  <p>
                    <strong>Customer:</strong> {order.user?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.user?.email || "Unavailable"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.deliveryAddress.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {order.deliveryAddress.address},{" "}
                    {order.deliveryAddress.city} -{" "}
                    {order.deliveryAddress.pincode}
                  </p>
                </div>

                <div className="admin-pizza-items">
                  <strong>Items:</strong>
                  {order.items.map((item, index) => (
                    <p key={index}>
                      {item.name} × {item.quantity} — ₹
                      {item.price * item.quantity}
                    </p>
                  ))}
                </div>

                <div className="admin-order-bottom">
                  <div>
                    <span>Payment: </span>
                    <strong>
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Razorpay"}
                    </strong>
                  </div>

                  <label className="admin-status-control">
                    <span>Order Status</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
