const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Login
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Dashboard: Check whether the user is logged in
    const userName = document.getElementById("userName");

    if (userName) {
      fetch("/api/me", {
        credentials: "same-origin",
      })
        .then(async (response) => {
          if (!response.ok) {
            window.location.href = "index.html";
            return null;
          }

          return response.json();
        })
        .then((data) => {
          if (data && data.user) {
            document.getElementById("userName").textContent = data.user.name;

            document.getElementById("userEmail").textContent = data.user.email;
          }
        })
        .catch(() => {
          window.location.href = "index.html";
        });
    }

    // Logout

    // Logout functionality
    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
      logoutButton.addEventListener("click", async function () {
        try {
          logoutButton.disabled = true;
          logoutButton.textContent = "Logging out...";

          const response = await fetch("/api/logout", {
            method: "POST",
            credentials: "same-origin",
          });

          const data = await response.json();

          if (response.ok) {
            alert("Logout successful!");
            window.location.replace("/");
          } else {
            alert(data.message || "Logout failed.");
            logoutButton.disabled = false;
            logoutButton.textContent = "Logout";
          }
        } catch (error) {
          console.error("Logout error:", error);
          alert("Something went wrong during logout.");

          logoutButton.disabled = false;
          logoutButton.textContent = "Logout";
        }
      });
    }

    const message = document.getElementById("message");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      message.textContent = data.message;
      message.style.color = response.ok ? "green" : "red";

      if (response.ok) {
        window.location.href = "dashboard.html";
      }
    } catch (error) {
      message.textContent = "Unable to connect to server.";
      message.style.color = "red";
    }
  });
}

// Registration
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      message.textContent = data.message;
      message.style.color = response.ok ? "green" : "red";

      if (response.ok) {
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1200);
      }
    } catch (error) {
      message.textContent = "Unable to connect to server.";
      message.style.color = "red";
    }
  });
}
