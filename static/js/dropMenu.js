// Set direction of app drop menu
function applyClassBasedOnScreenSize() {
  let dropDownElements = document.querySelectorAll("#set-drop-direction");
  dropDownElements.forEach((element) => {
    if (window.innerWidth <= 768) {
      element.classList.add("dropup");
      element.classList.remove("dropdown");
    } else {
      element.classList.remove("dropup");
      element.classList.add("dropdown");
    }
  });
}
applyClassBasedOnScreenSize();
window.addEventListener("resize", applyClassBasedOnScreenSize);
