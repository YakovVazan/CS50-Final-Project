document.addEventListener("DOMContentLoaded", function () {
  // Get the HTML tag
  let root = document.documentElement;
  // Set the entire page's theme the previous one
  root.setAttribute("data-bs-theme", localStorage.getItem("theme"));

  // Theme components
  let themeSvgIcon = document.querySelector("#theme-svg-icon");
  let themePath = document.querySelector("#theme-path");
  handleTheme();

  // Get a hold on the theme buttons
  let themeButtons = document.getElementsByClassName("theme_button");

  // Add an event listener to each of them
  Array.from(themeButtons).forEach(function (element) {
    element.addEventListener("click", function (event) {
      // Update the local storage
      localStorage.setItem("theme", event.target.textContent.toLowerCase());
      // Update the page's theme
      root.setAttribute("data-bs-theme", localStorage.getItem("theme"));

      handleTheme();
    });
  });

  // Clear local storage once logged out
  let logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.clear();
    });
  }

  // Collect all apps by name
  const elements = document.querySelectorAll(".app-name ");
  const innerTextArray = [];
  elements.forEach((element) => {
    const innerText = element.textContent.trim();
    innerTextArray.push(innerText);
  });

  // Collect user's input from search bar
  let searchField = document.querySelector("#search-field");
  if (searchField) {
    searchField.addEventListener("input", function (event) {
      let searchFieldValue = event.target.value.toLowerCase();

      // Control magnifier icon appearance
      let svgContainer = document.querySelector(".svg-container");
      if (searchFieldValue) {
        svgContainer.style.display = "none";
      } else {
        svgContainer.style.display = "";
      }

      let iconsList = document.querySelectorAll(".col-6.col-sm-4.col-md-3.col-lg-2");
      iconsList.forEach((item) => {
        if (!item.innerText.toLowerCase().includes(searchFieldValue)) {
          item.style.display = "none";
        } else {
          item.style.display = "";
        }
      });
    });
  }

  // Apply JS on Social Icons
  const socialButtons = document.querySelectorAll(".social-button");
  socialButtons.forEach((btn) => {
    // Add event listeners
    btn.addEventListener("mousedown", applyClickEffect);
    btn.addEventListener("mouseup", removeClickEffect);
    btn.addEventListener("touchstart", applyClickEffect);
    btn.addEventListener("touchend", removeClickEffect);
    btn.addEventListener("keydown", applyClickEffect);

    // Add class
    btn.classList.add("btn");

    // Add bootstrap properties
    btn.style.setProperty("--bs-btn-padding-x", "0");
    btn.style.setProperty("--bs-btn-padding-y", "0");
    btn.style.setProperty("--bs-btn-border-width", "0");
  });

  // Handle click and touch on icon
  function applyClickEffect(event) {
    const button = event.target;
    button.classList.add("clicked-button");
    searchField.value = "";
  }

  // Handle unclick and untouch on icon
  function removeClickEffect(event) {
    const button = event.target;
    button.classList.remove("clicked-button");
  }

  // Update theme icon
  function handleTheme() {
    if (localStorage.getItem("theme") == "dark") {
      themeSvgIcon.classList.remove("bi-moon");
      themeSvgIcon.classList.add("bi-brightness-high");
      themePath.setAttribute(
        "d",
        "M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"
      );
    } else {
      themeSvgIcon.classList.remove("bi-brightness-high");
      themeSvgIcon.classList.add("bi-moon");
      themePath.setAttribute(
        "d",
        "M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"
      );
    }
  }
});
