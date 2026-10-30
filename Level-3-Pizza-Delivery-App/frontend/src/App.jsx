import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";

import Cart from "./components/Cart";
import AdminRoute from "./components/AdminRoute";

import {
  ShoppingCart,
  Pizza,
  Menu,
  X,
  Plus,
  Star,
  Clock,
  Truck,
} from "lucide-react";

import "./App.css";

function App() {
  const [cart, setCart] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clearCart = () => {
    setCart([]);
  };

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    alert("Logged out successfully!");
  };

  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")) || null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("auth-change", syncUser);

    return () => {
      window.removeEventListener("auth-change", syncUser);
    };
  }, []);

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/pizzas");
        setPizzas(response.data);
      } catch (error) {
        console.error("Error fetching pizzas:", error);
        setError("Unable to load pizzas. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, []);

  const addToCart = (pizza) => {
    setCart((previousCart) => {
      const existing = previousCart.find((item) => item._id === pizza._id);

      if (existing) {
        return previousCart.map((item) =>
          item._id === pizza._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...previousCart, { ...pizza, quantity: 1 }];
    });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const updateQuantity = (id, change) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (id) => {
    setCart((previousCart) => previousCart.filter((item) => item._id !== id));
  };

  const Home = () => (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="logo">
          <Pizza size={30} />
          <span>
            Pizza<span className="logo-highlight">Hub</span>
          </span>
        </Link>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links active" : "nav-links"}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <a href="#menu" onClick={() => setMenuOpen(false)}>
            Menu
          </a>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>

          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>

          {/* Admin Dashboard Link */}
          {user?.role === "admin" && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Admin Dashboard
            </Link>
          )}

          {user ? (
            <>
              <span className="user-welcome">Welcome, {user.name}</span>

              <button
                onClick={handleLogout}
                className="logout-button mobile-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>

              <Link to="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {user && (
            <button
              onClick={handleLogout}
              className="logout-button desktop-logout"
            >
              Logout
            </button>
          )}

          <button className="cart-button" onClick={() => setCartOpen(true)}>
            <ShoppingCart size={19} />
            Cart ({cartCount})
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="hero-label">FRESH • HOT • DELICIOUS</span>

            <h1>
              Delicious Pizza,
              <span> Delivered Fresh!</span>
            </h1>

            <p>
              Enjoy your favourite pizzas made with fresh ingredients and
              delivered straight to your doorstep.
            </p>

            <a href="#menu" className="primary-button">
              Order Now <ShoppingCart size={18} />
            </a>

            <div className="hero-features">
              <div>
                <Clock size={20} />
                <span>30 Min Delivery</span>
              </div>

              <div>
                <Star size={20} />
                <span>Fresh Ingredients</span>
              </div>

              <div>
                <Truck size={20} />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900"
              alt="Freshly baked pizza"
            />
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <span>OUR SPECIAL MENU</span>
            <h2>Choose Your Favourite Pizza</h2>
            <p>Freshly prepared and full of flavour.</p>
          </div>

          <div className="pizza-grid">
            {loading ? (
              <p>Loading delicious pizzas...</p>
            ) : error ? (
              <p>{error}</p>
            ) : pizzas.length === 0 ? (
              <p>No pizzas available.</p>
            ) : (
              pizzas.map((pizza) => (
                <article className="pizza-card" key={pizza._id}>
                  <img src={pizza.image} alt={pizza.name} />

                  <div className="pizza-info">
                    <div className="pizza-title-row">
                      <h3>{pizza.name}</h3>

                      <span className="rating">
                        <Star size={15} fill="currentColor" />
                        {pizza.rating}
                      </span>
                    </div>

                    <p>{pizza.description}</p>

                    <div className="pizza-bottom">
                      <strong>₹{pizza.price}</strong>

                      <button onClick={() => addToCart(pizza)}>
                        <Plus size={17} /> Add
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="about-section" id="about">
          <h2>Why Choose PizzaHub?</h2>
          <p>
            We prepare every pizza with quality ingredients, delicious toppings
            and care. Your happiness is our priority!
          </p>
        </section>
      </main>

      <footer id="contact">
        <h2>PizzaHub</h2>
        <p>Fresh pizza. Great taste. Happy moments.</p>
        <p>© 2026 PizzaHub. All rights reserved.</p>
      </footer>

      {cartOpen && (
        <Cart
          cart={cart}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          closeCart={() => setCartOpen(false)}
        />
      )}
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/checkout"
        element={<Checkout cart={cart} clearCart={clearCart} />}
      />

      <Route path="/my-orders" element={<MyOrders />} />

      {/* Protected Admin Route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
