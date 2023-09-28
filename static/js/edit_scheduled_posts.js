function editMode(editable) {
  let originalPostContent = editable.innerHTML;

  // Change value
  editable.innerHTML = `
  <input
    id="edit-input" class="form-control" rows="1" style="resize: none;" placeholder="Edit your post">
  </input>
  `;
  document.getElementById("edit-input").value = originalPostContent;

  // Catch buttons
  let editButton =
    editable.parentElement.parentElement.children[3].firstElementChild;
  let cancelButton =
    editable.parentElement.parentElement.children[3].lastElementChild;

  // Change buttons layout
  editButton.remove();
  cancelButton.remove();
  editable.parentElement.parentElement.children[3].innerHTML = `
    <button id="repost" class="btn" style="background-color: purple;">Repost</button>
    <button id="cancelRepost" class="btn btn-danger">Cancel</button>
  `;

  // Repost
  document.querySelector("#repost").addEventListener("click", () => {
    console.log("repost");
  });

  // Cancel reposting
  document.querySelector("#cancelRepost").addEventListener("click", () => {
    console.log("cancelRepost");
  });
}

let editButtons = document.querySelectorAll(".edit-button");
if (editButtons) {
  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      editMode(
        btn.parentElement.parentElement.firstElementChild.firstElementChild
      );
    });
  });
}
