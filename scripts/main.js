document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const nav = document.querySelector(".nav");

  mobileMenuBtn.addEventListener("click", function () {
    nav.classList.toggle("active");
    this.querySelector("i").classList.toggle("fa-times");
    this.querySelector("i").classList.toggle("fa-bars");
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        // Close mobile menu if open
        if (nav.classList.contains("active")) {
          nav.classList.remove("active");
          mobileMenuBtn.querySelector("i").classList.remove("fa-times");
          mobileMenuBtn.querySelector("i").classList.add("fa-bars");
        }
      }
    });
  });

  // Header scroll effect
  const header = document.querySelector(".header");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Publication filtering
  const filterBtns = document.querySelectorAll(".filter-btn");
  const publicationItems = document.querySelectorAll(".publication-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");

      publicationItems.forEach((item) => {
        if (filter === "all" || item.getAttribute("data-category") === filter) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Animate skill bars on scroll
  const skillBars = document.querySelectorAll(".bar");

  function animateSkillBars() {
    skillBars.forEach((bar) => {
      const width = bar.style.width;
      bar.style.width = "0";

      setTimeout(() => {
        bar.style.width = width;
      }, 100);
    });
  }

  // Intersection Observer for skill bars
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateSkillBars();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const skillsSection = document.querySelector(".about");
  if (skillsSection) {
    observer.observe(skillsSection);
  }

  // // Load more publications
  // const loadMoreBtn = document.getElementById("load-more-pubs");
  // if (loadMoreBtn) {
  //   loadMoreBtn.addEventListener("click", function () {
  //     // In a real implementation, this would fetch more publications from an API
  //     // For demo purposes, we'll just show an alert
  //     alert(
  //       "In a real implementation, this would load more publications dynamically."
  //     );
  //   });
  // }

  // // Form submission
  // const contactForm = document.querySelector(".contact-form");
  // if (contactForm) {
  //   contactForm.addEventListener("submit", function (e) {
  //     e.preventDefault();

  //     // In a real implementation, this would send the form data to a server
  //     alert(
  //       "Thank you for your message! In a real implementation, this would be sent to a server."
  //     );
  //     this.reset();
  //   });
  // }
});

document.addEventListener("DOMContentLoaded", function () {
  const publications = document.querySelectorAll(".publication-item");
  const loadMoreButton = document.getElementById("load-more-pubs");
  const maxVisible = 4;

  // Initially hide publications beyond the first 4
  if (publications.length > maxVisible) {
    publications.forEach((pub, index) => {
      if (index >= maxVisible) {
        pub.style.display = "none";
      }
    });
    loadMoreButton.style.display = "block"; // Show the "Load More" button
  }

  // Add click event to load more publications
  loadMoreButton.addEventListener("click", function () {
    publications.forEach((pub) => {
      pub.style.display = "block"; // Show all publications
    });
    loadMoreButton.style.display = "none"; // Hide the button after loading
  });
});
