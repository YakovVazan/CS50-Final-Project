const timezoneOffset = new Date().getTimezoneOffset();

if (!document.getElementById("entrance_card")) {
  fetch("/set_timezone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezoneOffset }),
  });
}
