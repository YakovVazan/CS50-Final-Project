import { requestDeletion } from "./deletion.js";

// Control visuals of scheduled_posts page
export function handleSchedulingIconsAndPosts() {
  if (document.querySelector(".schedule_area")) {
    fetch("/get_scheduled_posts")
      .then((response) => response.json())
      .then((scheduled_posts) => {
        if (scheduled_posts.length > 0) {
          // Handle nav-bar icon's animation
          document.querySelector("#schedule_icon_pulse").style.display = "";
          document
            .querySelector("#schedule_icon")
            .classList.remove("animated-icon");

          // Handle scheduled-posts' list
          // Display scheduled posts' countdown
          let timeLeftElements = document.querySelectorAll(".time_left");
          for (let i = 0; i < timeLeftElements.length; i++) {
            // Calculate the countdown date for the current post
            const countdownDate = new Date(
              scheduled_posts[i]["execution_date"]
            ).getTime();

            // Initialize countdownInterval to null
            let countdownInterval = null;

            // Update the countdown for the current post
            function updateCountdown() {
              const now = new Date().getTime();
              const distance = countdownDate - now;

              // Calculate days, hours, minutes, and seconds
              const days = Math.floor(distance / (1000 * 60 * 60 * 24));
              const hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
              );
              const minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60)
              );
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);

              // If the countdown is not yet expired, display the countdown
              if (distance > 0) {
                timeLeftElements[
                  i
                ].innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
              } else {
                timeLeftElements[i].parentElement.remove();
                // Send a request to the server to delete the post from the data base
                requestDeletion(
                  timeLeftElements[i].parentElement.getAttribute("post-id"),
                  true,
                  ""
                );
                clearInterval(countdownInterval);
              }
            }

            // Initial update before starting the interval
            updateCountdown();

            // Update the countdown every 1 second (1000 milliseconds) for the current post
            countdownInterval = setInterval(updateCountdown, 1000);
          }
        } else {
          // Handle nav-bar icon's animation
          document.querySelector("#schedule_icon_pulse").style.display = "none";
          document
            .querySelector("#schedule_icon")
            .classList.add("animated-icon");

          // Handle scheduled-posts' list
          if (document.querySelector("#scheduleds-page")) {
            let noScheduledPostsMessage = document.createElement("span");
            noScheduledPostsMessage.innerHTML = `<div class="container d-flex justify-content-center align-items-center h-100">
              <p class="bg-info m-3 p-3 rounded-5">Your scheduled posts will appear here once you schedule!</p>
                                                   </div>`;
            document.querySelector("table").remove();
            document
              .querySelector("#scheduleds-page")
              .appendChild(noScheduledPostsMessage);
          }
        }
      })
      .catch((error) => {
        console.log(error);
        createToast("An error occurred.");
      });
  }
}
handleSchedulingIconsAndPosts();
