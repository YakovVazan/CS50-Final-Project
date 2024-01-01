import { fetchDashboardData } from "./dashboardData.js";

export function displayUpToDateTable(args) {
  document.querySelector("tbody").innerHTML = ``;
  getDashboardData(args);
}

async function getDashboardData(args) {
  unfilter(document.querySelectorAll("tr"));

  let appOwnerArea = document.querySelector("#app-owner-area");

  if (appOwnerArea) {
    try {
      const data = await fetchDashboardData();

      let tableBody = document.querySelector("tbody");

      data["users"].forEach((user) => {
        let row = document.createElement("tr");

        // names
        let nameTd = document.createElement("td");
        nameTd.classList.add("username-td");
        nameTd.style.position = "relative";
        nameTd.innerHTML = user["username"];
        row.appendChild(nameTd);

        // bullets
        let bulletsContainer = document.createElement("span");
        bulletsContainer.innerHTML = `<ul class="bullets-ul">
        ${
          args
            ? Array.from(args)
                .map((arg) => {
                  if (arg["id"] === user["id"]) {
                    return `<li id="bullet" class="online-blt" title="Online">
                                <span class="bullet-span" style="background-color: #ffe207;"></span>
                            </li>`;
                  } else {
                    return "";
                  }
                })
                .join("")
            : ""
        }
        ${
          user["authenticated"] === 1
            ? `<li id="bullet" class="auth-blt" title="Authenticated">
                <span class="bullet-span" style="background-color: #67af8e;"></span>
               </li>`
            : ``
        }
        ${
          user["premium"] === 1
            ? `<li id="bullet" class="premium-blt" title="Premium">
                <span class="bullet-span" style="background-color: #dc3545;"></span>
               </li>`
            : ``
        }
         </ul>`;
        nameTd.appendChild(bulletsContainer);

        // emails
        let emailTd = document.createElement("td");
        emailTd.innerHTML = user["email_address"];
        row.appendChild(emailTd);

        // posts td
        let postsTd = document.createElement("td");
        postsTd.classList.add("dropdown-center");
        row.appendChild(postsTd);

        // posts button
        let postsButton = document.createElement("button");
        postsButton.classList.add("btn", "btn-outline-info", "dropdown-toggle");
        postsButton.setAttribute("data-bs-toggle", "dropdown");
        postsButton.setAttribute("aria-expanded", "false");
        postsButton.innerHTML = "all posts";
        postsTd.appendChild(postsButton);

        // posts ul
        let postsUl = document.createElement("ul");
        postsUl.classList.add("dropdown-menu");
        postsUl.style.maxHeight = "10em";
        postsUl.style.maxWidth = "20em";
        postsUl.style.overflow = "auto";
        postsTd.appendChild(postsUl);

        // Filter user-specific posts
        let currentUserPosts = data["posts"].filter((post) => {
          return post["user_id"] == user["id"];
        });

        // posts li
        if (currentUserPosts.length > 0) {
          currentUserPosts.forEach((post) => {
            let postsLi = document.createElement("li");
            postsLi.classList.add("dropdown-item");
            let span = document.createElement("span");
            span.textContent = post["content"];
            postsLi.appendChild(span);
            postsUl.appendChild(postsLi);
          });
        } else {
          let postsLi = document.createElement("li");
          postsLi.classList.add("dropdown-item");
          let span = document.createElement("span");
          span.textContent = "no posts";
          postsLi.appendChild(span);
          postsUl.appendChild(postsLi);
        }

        // scheduled posts td
        let scheduledPostsTd = document.createElement("td");
        scheduledPostsTd.classList.add("dropdown-center");
        row.appendChild(scheduledPostsTd);

        // scheduled posts button
        let scheduledPostsButton = document.createElement("button");
        scheduledPostsButton.classList.add(
          "btn",
          "btn-outline-info",
          "dropdown-toggle"
        );
        scheduledPostsButton.setAttribute("data-bs-toggle", "dropdown");
        scheduledPostsButton.setAttribute("aria-expanded", "false");
        scheduledPostsButton.innerHTML = "all scheduled posts";
        scheduledPostsTd.appendChild(scheduledPostsButton);

        // schedules posts ul
        let scheduledPostsUl = document.createElement("ul");
        scheduledPostsUl.classList.add("dropdown-menu");
        scheduledPostsUl.style.maxHeight = "10em";
        scheduledPostsUl.style.maxWidth = "20em";
        scheduledPostsUl.style.overflow = "auto";
        scheduledPostsTd.appendChild(scheduledPostsUl);

        // Filter user-specific posts
        let currentUserScheduledPosts = data["scheduled_posts"].filter(
          (scheduled_post) => {
            return scheduled_post["user_id"] == user["id"];
          }
        );

        // schedules posts li
        if (currentUserScheduledPosts.length > 0) {
          currentUserScheduledPosts.forEach((scheduled_post) => {
            let scheduledPostsLi = document.createElement("li");
            scheduledPostsLi.classList.add("dropdown-item");
            let span = document.createElement("span");
            span.textContent = scheduled_post["content"];
            scheduledPostsLi.appendChild(span);
            scheduledPostsUl.appendChild(scheduledPostsLi);
          });
        } else {
          let scheduledPostsLi = document.createElement("li");
          scheduledPostsLi.classList.add("dropdown-item");
          let span = document.createElement("span");
          span.textContent = "no scheduled posts";
          scheduledPostsLi.appendChild(span);
          scheduledPostsUl.appendChild(scheduledPostsLi);
        }

        // linked accounts td
        let linkedAccountsTd = document.createElement("td");
        linkedAccountsTd.classList.add("dropdown-center");
        row.appendChild(linkedAccountsTd);

        // scheduled posts button
        let linkedAccountsButton = document.createElement("button");
        linkedAccountsButton.classList.add(
          "btn",
          "btn-outline-info",
          "dropdown-toggle"
        );
        linkedAccountsButton.setAttribute("data-bs-toggle", "dropdown");
        linkedAccountsButton.setAttribute("aria-expanded", "false");
        linkedAccountsButton.innerHTML = "all linked accounts";
        linkedAccountsTd.appendChild(linkedAccountsButton);

        // schedules posts ul
        let linkedAccountsUl = document.createElement("ul");
        linkedAccountsUl.classList.add("dropdown-menu");
        linkedAccountsUl.style.maxHeight = "10em";
        linkedAccountsUl.style.maxWidth = "20em";
        linkedAccountsUl.style.overflow = "auto";
        linkedAccountsTd.appendChild(linkedAccountsUl);

        // Filter user-specific posts
        let currentUserlinkedAccounts = data["linked_accounts"].filter(
          (linked_account) => {
            return linked_account["user_id"] == user["id"];
          }
        );

        // schedules posts li
        if (currentUserlinkedAccounts.length > 0) {
          currentUserlinkedAccounts.forEach((linked_account) => {
            let linked_accountsLi = document.createElement("li");
            linked_accountsLi.classList.add("dropdown-item");
            let span = document.createElement("span");
            span.textContent = linked_account["name"];
            linked_accountsLi.appendChild(span);
            linkedAccountsUl.appendChild(linked_accountsLi);
          });
        } else {
          let linked_accountsLi = document.createElement("li");
          linked_accountsLi.classList.add("dropdown-item");
          let span = document.createElement("span");
          span.textContent = "no linked accounts";
          linked_accountsLi.appendChild(span);
          linkedAccountsUl.appendChild(linked_accountsLi);
        }

        // dm user td
        let dmUserTd = document.createElement("td");
        dmUserTd.classList.add("dropdown-center");
        row.appendChild(dmUserTd);

        // dm user button
        let dmUserButton = document.createElement("span");
        dmUserButton.classList.add("btn", "btn-outline-warning");
        dmUserButton.textContent = "DM";
        dmUserTd.appendChild(dmUserButton);

        // ban user td
        let banUserTd = document.createElement("td");
        banUserTd.classList.add("dropdown-center");
        row.appendChild(banUserTd);

        // dm user button
        let banUserButton = document.createElement("span");
        banUserButton.classList.add("btn", "btn-outline-danger");
        banUserButton.textContent = "BAN";
        banUserTd.appendChild(banUserButton);

        tableBody.appendChild(row);

        setUsersSearchBox();
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

if (window.location.pathname === "/dashboard") {
  getDashboardData();
}

function setUsersSearchBox() {
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

      // Filters users according to the value in the search box
      let usernames = document.querySelectorAll(".username-td");
      usernames.forEach((username) => {
        if (!username.innerText.toLowerCase().includes(searchFieldValue)) {
          username.parentElement.style.display = "none";
        } else {
          username.parentElement.style.display = "";
        }
      });
    });
  }
}

let filterOptions = document.querySelectorAll(".filter-option");

if (filterOptions) {
  filterOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      filterTable(opt.textContent.trim());
    });
  });
}

function filterTable(args) {
  let allUsersTrs = document.querySelectorAll("tr");

  unfilter(allUsersTrs);

  switch (args) {
    case "Online":
      toggleRowVisibility(allUsersTrs, ".online-blt");
      break;
    case "Authenticated":
      toggleRowVisibility(allUsersTrs, ".auth-blt");
      break;
    case "Premium":
      toggleRowVisibility(allUsersTrs, ".premium-blt");
      break;
  }
}

function unfilter(allUsersTrs) {
  allUsersTrs.forEach((userTr) => {
    userTr.style.display = "";
  });

  document.querySelector("#main-filter-button").innerHTML = `
  Filter
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
    class="bi bi-funnel" viewBox="0 0 16 16">
      <path
        d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
  </svg>
  `;
}

function toggleRowVisibility(users, className) {
  users.forEach((user, index) => {
    if (user.querySelector(className) === null && index != 0) {
      user.style.display = "none";
    }
  });
  document.querySelector("#main-filter-button").innerHTML = className
    .substring(1, className.indexOf("-", 1))
    .replace(/^[a-z]/, (match) => match.toUpperCase());
}
