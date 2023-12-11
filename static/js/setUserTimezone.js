const timezoneOffset = new Date().getTimezoneOffset();

fetch("/set_timezone", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ timezoneOffset }),
});
