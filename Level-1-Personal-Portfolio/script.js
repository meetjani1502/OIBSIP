// Initialize Lucide icons
if (window.lucide) {
  lucide.createIcons();
}

// Mobile Navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navigationLinks = document.querySelectorAll(".nav-link");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", isOpen);
  menuToggle.innerHTML = isOpen
    ? '<i data-lucide="x"></i>'
    : '<i data-lucide="menu"></i>';

  if (window.lucide) {
    lucide.createIcons();
  }
});

// Close mobile menu after clicking a link
navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.innerHTML = '<i data-lucide="menu"></i>';

    if (window.lucide) {
      lucide.createIcons();
    }
  });
});

// Active Navigation Link
const sections = document.querySelectorAll("main section[id]");

function updateActiveLink() {
  let currentSection = "home";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 150;

    if (window.scrollY >= sectionTop) {
      currentSection = section.id;
    }
  });

  navigationLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${currentSection}`,
    );
  });
}

window.addEventListener("scroll", updateActiveLink);

// Back to Top Button
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 400);
});

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Dynamic Copyright Year
document.getElementById("year").textContent = new Date().getFullYear();

// Initial navigation state
updateActiveLink();

console.log("Meet Jani Portfolio loaded successfully!");
