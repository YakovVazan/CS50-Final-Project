// Filter posts with range input
const rangeInput = document.getElementById("filter-posts");
if (rangeInput) {
  rangeInput.addEventListener("input", filterPosts);
}
function filterPosts() {
  const currentValue = Number(rangeInput.value);
  // Configure all type of info 'tooltip'
  const infoData = [
    { title: "All", top: "4.8em", right: "-7em" },
    { title: "Immediate", top: "8.2em", right: "-10.5em" },
    { title: "Scheduled", top: "11.7em", right: "-10.5em" },
  ];

  let currentInfo = document.getElementById("filter-info");
  currentInfo.style.display = "";
  currentInfo.innerText = infoData[currentValue]["title"];
  currentInfo.style.top = infoData[currentValue]["top"];
  currentInfo.style.right = infoData[currentValue]["right"];

  setTimeout(() => {
    currentInfo.style.display = "none";
  }, 1500);

  // 'lastElementChild' will have an id of "message-bubble-time" if not scheduled
  document.querySelectorAll("#message-bubble").forEach((x) => {
    x.classList.remove("animated-new-post");
    if (currentValue === 1) {
      if (x.lastElementChild.getAttribute("id") === "message-bubble-time") {
        x.style.display = "";
      } else {
        x.style.display = "none";
      }
    } else if (currentValue === 2) {
      if (x.lastElementChild.getAttribute("id") === "message-bubble-time") {
        x.style.display = "none";
      } else {
        x.style.display = "";
      }
    } else {
      x.style.display = "";
    }
    // Keep the screen scrolled all the way down
    document.getElementById("messages-area").scrollTop =
      document.getElementById("messages-area").scrollHeight;
  });
}
