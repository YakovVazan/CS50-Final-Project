export const socket = io.connect(
  window.location.protocol +
    "//" +
    window.location.hostname +
    ":" +
    location.port
);

// page reload for just banned users
socket.on("reload_page", () => {
  window.location.href = "/register";
});
