import schedule from "node-schedule";

// PING API
schedule.scheduleJob("*/30 * * * *", async () => {
  const docRef = await fetch("https://juanitaapi.herokuapp.com");
});
