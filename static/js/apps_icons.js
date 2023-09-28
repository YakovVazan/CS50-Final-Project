document.addEventListener("DOMContentLoaded", function () {
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

      // Filters apps according to the value in the search box
      let iconsList = document.querySelectorAll(
        ".col-6.col-sm-4.col-md-3.col-lg-2"
      );
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
});
