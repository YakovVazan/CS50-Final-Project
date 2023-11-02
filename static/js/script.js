import "./themes.js";
import "./apps_icons.js";
import "./schedule_modal.js";
import "./posts_filter.js";
import "./edit_scheduled_posts.js";
import "./posts_backward.js";
import "./dynamic_chat.js";
import "./social_media_script.js";
import "./account_center.js";

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
