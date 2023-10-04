let editButtons = document.querySelectorAll(".edit-button");
if (editButtons) {
  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector("#edited-post-content").value =
        btn.parentElement.parentElement.children[0].children[0].innerHTML;
      document.querySelector("#edited-post-date").value =
        btn.parentElement.parentElement.children[1].innerHTML;

      repost(btn.parentElement.parentElement.getAttribute("post-id"));
    });
  });
}

function repost(postId) {
  let submitButton = document.querySelector("#edited-post-submit");
  if (submitButton) {
    let newValue = document.querySelector("#edited-post-content").value;
    let newDate = document.querySelector("#edited-post-date").value;

    console.log(postId, newValue, newDate);
  }
}
