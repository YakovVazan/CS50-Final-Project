let appOwnerArea = document.querySelector("#app-owner-area");

if (appOwnerArea) {
  fetch("/app_database")
    .then((response) => response.json())
    .then((data) => {
      let tableBody = document.querySelector("tbody");

      data["users"].forEach((user) => {
        let row = document.createElement("tr");
        // names
        let nameTd = document.createElement("td");
        nameTd.innerHTML = user["username"];
        row.appendChild(nameTd);

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
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
