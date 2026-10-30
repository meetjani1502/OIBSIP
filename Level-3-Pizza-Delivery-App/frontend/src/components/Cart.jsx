import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Cart({ cart, updateQuantity, removeItem, closeCart }) {
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const deliveryFee = cart.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Please add a pizza to your cart first.");
      return;
    }

    closeCart();
    navigate("/checkout");
  };

  return (
    <div className="cart-overlay">
      <div className="cart-panel">
        <div className="cart-header">
          <h2>
            <ShoppingBag /> Your Cart
          </h2>

          <button className="close-cart" onClick={closeCart}>
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={55} />
            <h3>Your cart is empty</h3>
            <p>Add some delicious pizzas!</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <strong>₹{item.price}</strong>

                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item._id, -1)}>
                        <Minus size={14} />
                      </button>

                      <span>{item.quantity}</span>

                      <button onClick={() => updateQuantity(item._id, 1)}>
                        <Plus size={14} />
                      </button>

                      <button
                        className="remove-button"
                        onClick={() => removeItem(item._id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div>
                <span>Delivery Fee</span>
                <strong>₹{deliveryFee}</strong>
              </div>

              <div className="grand-total">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>

              <button className="checkout-button" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
