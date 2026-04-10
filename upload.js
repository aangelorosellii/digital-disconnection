const uploadForm = document.querySelector("#uploadForm");
const weeklyHoursInput = document.querySelector("#weeklyHours");
const weeklyMinutesInput = document.querySelector("#weeklyMinutes");
const pickupsCountInput = document.querySelector("#pickupsCount");
const notificationsCountInput = document.querySelector("#notificationsCount");
const topAppInputs = [
  document.querySelector("#topApp1"),
  document.querySelector("#topApp2"),
  document.querySelector("#topApp3")
];
const appSuggestionLists = [
  document.querySelector("#topApp1Suggestions"),
  document.querySelector("#topApp2Suggestions"),
  document.querySelector("#topApp3Suggestions")
];
const statusText = document.querySelector("#statusText");
const honestyModal = document.querySelector("#honestyModal");
const confirmHonestyButton = document.querySelector("#confirmHonestyButton");
const editHonestyButton = document.querySelector("#editHonestyButton");
const appSuggestions = [
  "Instagram",
  "TikTok",
  "WhatsApp",
  "YouTube",
  "Spotify",
  "Telegram",
  "Netflix",
  "Safari",
  "Chrome",
  "Google",
  "Google Maps",
  "Google Drive",
  "Google Photos",
  "Google Calendar",
  "Google Meet",
  "Google Home",
  "Google Docs",
  "Google Sheets",
  "Google Translate",
  "Google Classroom",
  "Messages",
  "Phone",
  "FaceTime",
  "Mail",
  "Apple Music",
  "Apple Podcasts",
  "Apple TV",
  "Apple Maps",
  "App Store",
  "Camera",
  "Photos",
  "Clock",
  "Weather",
  "Notes",
  "Reminders",
  "Files",
  "Wallet",
  "Health",
  "Settings",
  "Calculator",
  "Calendar",
  "Snapchat",
  "X",
  "Threads",
  "Facebook",
  "Messenger",
  "Facebook Messenger",
  "Gmail",
  "Discord",
  "Reddit",
  "Pinterest",
  "Twitch",
  "LinkedIn",
  "BeReal",
  "Amazon",
  "Amazon Prime Video",
  "Disney+",
  "Prime Video",
  "HBO Max",
  "Max",
  "DAZN",
  "Sky Go",
  "NOW",
  "Paramount+",
  "Crunchyroll",
  "Pluto TV",
  "YouTube Music",
  "SoundCloud",
  "Shazam",
  "Airbnb",
  "Booking.com",
  "Uber",
  "Uber Eats",
  "Lyft",
  "Deliveroo",
  "DoorDash",
  "Glovo",
  "Just Eat",
  "Too Good To Go",
  "Trainline",
  "SBB",
  "DB Navigator",
  "Citymapper",
  "Waze",
  "PayPal",
  "Revolut",
  "Wise",
  "PostFinance",
  "TWINT",
  "UBS",
  "Credit Suisse",
  "Swissquote",
  "Yuh",
  "Binance",
  "Coinbase",
  "Microsoft Teams",
  "Slack",
  "Zoom",
  "Notion",
  "Trello",
  "Asana",
  "Todoist",
  "Dropbox",
  "OneDrive",
  "Microsoft Outlook",
  "Word",
  "Excel",
  "PowerPoint",
  "Adobe Acrobat",
  "Canva",
  "Figma",
  "GitHub",
  "GitLab",
  "ChatGPT",
  "Claude",
  "Perplexity",
  "Duolingo",
  "Headspace",
  "Calm",
  "Nike Run Club",
  "Strava",
  "MyFitnessPal",
  "Flo",
  "Kindle",
  "Goodreads",
  "Medium",
  "Substack",
  "Pocket",
  "Tripadvisor",
  "Zalando",
  "Temu",
  "Shein",
  "Vinted",
  "Wallapop",
  "eBay",
  "AliExpress",
  "Etsy",
  "Depop",
  "Tinder",
  "Bumble",
  "Hinge",
  "Grindr",
  "Skype",
  "Signal",
  "LINE",
  "WeChat",
  "QQ",
  "Weibo",
  "Bilibili",
  "CapCut",
  "VSCO",
  "Lightroom",
  "Picsart",
  "Photomath",
  "Kahoot!",
  "Moodle",
  "Blackboard",
  "Canvas Student",
  "Other"
];
const appAliases = new Map(
  appSuggestions.map((app) => [app.toLowerCase().replace(/[^a-z0-9]/g, ""), app])
);

appAliases.set("whatsapp", "WhatsApp");
appAliases.set("whatsup", "WhatsApp");
appAliases.set("whats app", "WhatsApp");
appAliases.set("tiktok", "TikTok");
appAliases.set("tiktok", "TikTok");
appAliases.set("tik tok", "TikTok");
appAliases.set("youtube", "YouTube");
appAliases.set("you tube", "YouTube");
appAliases.set("googlemaps", "Google Maps");
appAliases.set("google maps", "Google Maps");
appAliases.set("googlemap", "Google Maps");
appAliases.set("bereal", "BeReal");
appAliases.set("fb", "Facebook");
appAliases.set("insta", "Instagram");
appAliases.set("yt", "YouTube");
appAliases.set("g maps", "Google Maps");
appAliases.set("gmaps", "Google Maps");
appAliases.set("sbbmobile", "SBB");
appAliases.set("sbb mobile", "SBB");
appAliases.set("primevideo", "Prime Video");
appAliases.set("amazonprimevideo", "Amazon Prime Video");
appAliases.set("msteams", "Microsoft Teams");
appAliases.set("teams", "Microsoft Teams");
appAliases.set("ms teams", "Microsoft Teams");
appAliases.set("gmeet", "Google Meet");
appAliases.set("googlemeet", "Google Meet");
appAliases.set("chat gpt", "ChatGPT");
appAliases.set("chatgpt", "ChatGPT");

function normalizeAppName(rawValue) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return "";
  }

  const normalizedKey = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (appAliases.has(normalizedKey)) {
    return appAliases.get(normalizedKey);
  }

  const exactSuggestion = appSuggestions.find(
    (app) => app.toLowerCase() === trimmed.toLowerCase()
  );

  if (exactSuggestion) {
    return exactSuggestion;
  }

  return trimmed
    .split(/\s+/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
}

function setStatus(message) {
  statusText.textContent = message;
}

function closeSuggestionList(list) {
  list.innerHTML = "";
  list.classList.remove("is-visible");
}

function openHonestyModal() {
  honestyModal.classList.remove("is-hidden");
  honestyModal.setAttribute("aria-hidden", "false");
}

function closeHonestyModal() {
  honestyModal.classList.add("is-hidden");
  honestyModal.setAttribute("aria-hidden", "true");
}

function waitForHonestyConfirmation() {
  return new Promise((resolve) => {
    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleEdit = () => {
      cleanup();
      resolve(false);
    };

    const handleBackdrop = (event) => {
      if (event.target === honestyModal) {
        cleanup();
        resolve(false);
      }
    };

    const cleanup = () => {
      closeHonestyModal();
      confirmHonestyButton.removeEventListener("click", handleConfirm);
      editHonestyButton.removeEventListener("click", handleEdit);
      honestyModal.removeEventListener("click", handleBackdrop);
    };

    confirmHonestyButton.addEventListener("click", handleConfirm);
    editHonestyButton.addEventListener("click", handleEdit);
    honestyModal.addEventListener("click", handleBackdrop);
    openHonestyModal();
  });
}

function renderSuggestions(input, list) {
  const query = input.value.trim().toLowerCase();

  if (!query) {
    closeSuggestionList(list);
    return;
  }

  const matches = appSuggestions
    .filter((app) => app.toLowerCase().includes(query))
    .slice(0, 6);

  if (!matches.length) {
    closeSuggestionList(list);
    return;
  }

  list.innerHTML = "";

  for (const app of matches) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "autocomplete-item";
    button.textContent = app;
    button.addEventListener("click", () => {
      input.value = app;
      closeSuggestionList(list);
      input.focus();
    });
    list.appendChild(button);
  }

  list.classList.add("is-visible");
}

topAppInputs.forEach((input, index) => {
  const list = appSuggestionLists[index];

  input.addEventListener("input", () => {
    renderSuggestions(input, list);
  });

  input.addEventListener("focus", () => {
    renderSuggestions(input, list);
  });

  input.addEventListener("blur", () => {
    window.setTimeout(() => closeSuggestionList(list), 120);
  });
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!uploadForm.reportValidity()) {
    setStatus("Please complete all required fields.");
    return;
  }

  const weeklyHours = Number(weeklyHoursInput.value);
  const weeklyMinutes = Number(weeklyMinutesInput.value);
  const weeklyAverageMinutes = weeklyHours * 60 + weeklyMinutes;
  const pickupsCount = Number(pickupsCountInput.value);
  const notificationsCount = Number(notificationsCountInput.value);
  const topApps = topAppInputs
    .map((input) => {
      const normalizedValue = normalizeAppName(input.value);
      input.value = normalizedValue;
      return normalizedValue;
    })
    .filter(Boolean)
    .slice(0, 3);

  if (
    !Number.isFinite(weeklyHours) ||
    !Number.isFinite(weeklyMinutes) ||
    weeklyHours < 0 ||
    weeklyMinutes < 0 ||
    weeklyMinutes > 59 ||
    weeklyAverageMinutes <= 0
  ) {
    setStatus("Enter a valid weekly average using separate hours and minutes.");
    return;
  }

  if (topApps.length !== 3) {
    setStatus("Enter all three top apps.");
    return;
  }

  if (!Number.isFinite(pickupsCount) || pickupsCount < 0) {
    setStatus("Enter a valid pickups count.");
    return;
  }

  if (!Number.isFinite(notificationsCount) || notificationsCount < 0) {
    setStatus("Enter a valid notifications count.");
    return;
  }

  const confirmed = await waitForHonestyConfirmation();

  if (!confirmed) {
    setStatus("Please review your answers and enter the correct data.");
    return;
  }

  setStatus("Submitting...");

  try {
    const payload = {
      weeklyAverageMinutes,
      weeklyAverageHours: weeklyHours,
      weeklyAverageRemainderMinutes: weeklyMinutes,
      topApps,
      pickupsCount,
      notificationsCount
    };

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Submission failed");
    }

    uploadForm.reset();
    appSuggestionLists.forEach((list) => closeSuggestionList(list));
    setStatus("Data submitted successfully. Thank you.");
  } catch (error) {
    console.error(error);
    setStatus("I could not submit the data. Please try again.");
  }
});
