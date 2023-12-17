export const socket = io.connect(
  window.location.protocol +
    "//" +
    window.location.hostname +
    ":" +
    location.port
);
