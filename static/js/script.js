document.addEventListener("DOMContentLoaded", function () {
  // Get the HTML tag
  let root = document.documentElement;
  // Set the entire page's theme the previous one
  root.setAttribute("data-bs-theme", localStorage.getItem("theme"));

  // Get a hold on the theme buttons
  let themeButtons = document.getElementsByClassName("theme_button");

  // Add an event listener to each of them
  Array.from(themeButtons).forEach(function (element) {
    element.addEventListener("click", function (event) {
      // Update the local storage
      localStorage.setItem("theme", event.target.textContent.toLowerCase());
      // Update the page's theme
      root.setAttribute("data-bs-theme", localStorage.getItem("theme"));
    });
  });
});
