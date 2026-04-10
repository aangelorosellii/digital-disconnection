const totalResponses = document.querySelector("#totalResponses");
const dataSourceLabel = document.querySelector("#dataSourceLabel");
const screenTimeChartCanvas = document.querySelector("#screenTimeChart");
const comparisonChartCanvas = document.querySelector("#comparisonChart");
const topAppsChartCanvas = document.querySelector("#topAppsChart");
const screenTimePercent = document.querySelector("#screenTimePercent");
const screenTimeSentence = document.querySelector("#screenTimeSentence");
const highestPickupValue = document.querySelector("#highestPickupValue");
const lowestPickupValue = document.querySelector("#lowestPickupValue");
const highestNotificationValue = document.querySelector("#highestNotificationValue");
const lowestNotificationValue = document.querySelector("#lowestNotificationValue");
const pickupSentence = document.querySelector("#pickupSentence");
const notificationSentence = document.querySelector("#notificationSentence");
const topCategoryName = document.querySelector("#topCategoryName");
const categorySentence = document.querySelector("#categorySentence");

// Mock data keeps the dashboard presentation-ready even before live responses exist.
const mockResponses = [];

let screenTimeChart;
let comparisonChart;
let topAppsChart;

const appCategoryMap = new Map([
  ["instagram", "Social Media"],
  ["tiktok", "Social Media"],
  ["facebook", "Social Media"],
  ["facebook messenger", "Messaging"],
  ["messenger", "Messaging"],
  ["threads", "Social Media"],
  ["x", "Social Media"],
  ["reddit", "Social Media"],
  ["snapchat", "Social Media"],
  ["bereal", "Social Media"],
  ["pinterest", "Social Media"],
  ["linkedin", "Social Media"],
  ["whatsapp", "Messaging"],
  ["telegram", "Messaging"],
  ["messages", "Messaging"],
  ["signal", "Messaging"],
  ["line", "Messaging"],
  ["wechat", "Messaging"],
  ["discord", "Messaging"],
  ["gmail", "Communication"],
  ["mail", "Communication"],
  ["microsoft outlook", "Communication"],
  ["zoom", "Communication"],
  ["google meet", "Communication"],
  ["microsoft teams", "Communication"],
  ["slack", "Communication"],
  ["youtube", "Entertainment"],
  ["netflix", "Entertainment"],
  ["disney+", "Entertainment"],
  ["prime video", "Entertainment"],
  ["amazon prime video", "Entertainment"],
  ["max", "Entertainment"],
  ["hbo max", "Entertainment"],
  ["spotify", "Entertainment"],
  ["youtube music", "Entertainment"],
  ["soundcloud", "Entertainment"],
  ["twitch", "Entertainment"],
  ["apple music", "Entertainment"],
  ["apple podcasts", "Entertainment"],
  ["apple tv", "Entertainment"],
  ["dazn", "Entertainment"],
  ["sky go", "Entertainment"],
  ["now", "Entertainment"],
  ["safari", "Browsing"],
  ["chrome", "Browsing"],
  ["google", "Browsing"],
  ["google maps", "Navigation"],
  ["waze", "Navigation"],
  ["citymapper", "Navigation"],
  ["trainline", "Transport"],
  ["sbb", "Transport"],
  ["db navigator", "Transport"],
  ["uber", "Transport"],
  ["lyft", "Transport"],
  ["google drive", "Productivity"],
  ["google docs", "Productivity"],
  ["google sheets", "Productivity"],
  ["google calendar", "Productivity"],
  ["notion", "Productivity"],
  ["trello", "Productivity"],
  ["asana", "Productivity"],
  ["todoist", "Productivity"],
  ["dropbox", "Productivity"],
  ["onedrive", "Productivity"],
  ["word", "Productivity"],
  ["excel", "Productivity"],
  ["powerpoint", "Productivity"],
  ["adobe acrobat", "Productivity"],
  ["canva", "Creativity"],
  ["figma", "Creativity"],
  ["lightroom", "Creativity"],
  ["vsco", "Creativity"],
  ["capcut", "Creativity"],
  ["picsart", "Creativity"],
  ["github", "Productivity"],
  ["gitlab", "Productivity"],
  ["chatgpt", "AI Tools"],
  ["claude", "AI Tools"],
  ["perplexity", "AI Tools"],
  ["amazon", "Shopping"],
  ["zalando", "Shopping"],
  ["temu", "Shopping"],
  ["shein", "Shopping"],
  ["vinted", "Shopping"],
  ["wallapop", "Shopping"],
  ["ebay", "Shopping"],
  ["aliexpress", "Shopping"],
  ["etsy", "Shopping"],
  ["depop", "Shopping"],
  ["paypal", "Finance"],
  ["revolut", "Finance"],
  ["wise", "Finance"],
  ["twint", "Finance"],
  ["ubs", "Finance"],
  ["postfinance", "Finance"],
  ["credit suisse", "Finance"],
  ["swissquote", "Finance"],
  ["coinbase", "Finance"],
  ["binance", "Finance"],
  ["duolingo", "Education"],
  ["photomath", "Education"],
  ["kahoot!", "Education"],
  ["moodle", "Education"],
  ["blackboard", "Education"],
  ["canvas student", "Education"],
  ["kindle", "Reading"],
  ["goodreads", "Reading"],
  ["medium", "Reading"],
  ["substack", "Reading"],
  ["pocket", "Reading"],
  ["strava", "Health & Fitness"],
  ["nike run club", "Health & Fitness"],
  ["myfitnesspal", "Health & Fitness"],
  ["headspace", "Health & Fitness"],
  ["calm", "Health & Fitness"],
  ["flo", "Health & Fitness"],
  ["other", "Other"]
]);

// Bucket screen time values into presentation-friendly ranges.
function bucketScreenTime(responses) {
  const buckets = {
    "0-2h": 0,
    "2-4h": 0,
    "4-6h": 0,
    "6h+": 0
  };

  for (const response of responses) {
    const value = Number(response.screen_time);

    if (!Number.isFinite(value) || value < 0) {
      continue;
    }

    if (value < 2) {
      buckets["0-2h"] += 1;
    } else if (value < 4) {
      buckets["2-4h"] += 1;
    } else if (value < 6) {
      buckets["4-6h"] += 1;
    } else {
      buckets["6h+"] += 1;
    }
  }

  return buckets;
}

// Compute a simple average for any numeric field.
function computeAverage(responses, fieldName) {
  const values = responses
    .map((response) => Number(response[fieldName]))
    .filter((value) => Number.isFinite(value));

  if (!values.length) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

// Convert a daily average into an hourly average using 16 waking hours.
function computeAveragePerWakingHour(responses, fieldName, wakingHours = 16) {
  const average = computeAverage(responses, fieldName);
  return average / wakingHours;
}

function findExtremes(responses, fieldName) {
  const valid = responses.filter((response) => Number.isFinite(Number(response[fieldName])));

  if (!valid.length) {
    return {
      highest: null,
      lowest: null
    };
  }

  const sorted = [...valid].sort((a, b) => Number(a[fieldName]) - Number(b[fieldName]));

  return {
    lowest: sorted[0],
    highest: sorted[sorted.length - 1]
  };
}

function computeMinutesBetweenEvents(averagePerHour) {
  if (!Number.isFinite(averagePerHour) || averagePerHour <= 0) {
    return null;
  }

  return 60 / averagePerHour;
}

function formatAppName(name) {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function categorizeApp(name) {
  const normalized = name.toLowerCase();
  return appCategoryMap.get(normalized) || "Other";
}

// Parse the comma-separated top app field and count mentions across responses by category.
function parseAndCountAppCategories(responses) {
  const counts = new Map();

  for (const response of responses) {
    const rawValue = String(response.top_apps || "");
    const apps = rawValue
      .split(",")
      .map((app) => app.trim())
      .filter(Boolean);

    for (const app of apps) {
      const category = categorizeApp(app.trim().toLowerCase());
      const current = counts.get(category) || 0;
      counts.set(category, current + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Parse the comma-separated top app field and count mentions for the most-cited apps.
function parseAndCountApps(responses) {
  const counts = new Map();

  for (const response of responses) {
    const rawValue = String(response.top_apps || "");
    const apps = rawValue
      .split(",")
      .map((app) => app.trim())
      .filter(Boolean);

    for (const app of apps) {
      const normalized = app.toLowerCase();
      const current = counts.get(normalized) || 0;
      counts.set(normalized, current + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name: formatAppName(name),
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function normalizeLiveResponse(submission) {
  const hours = Number(submission.weeklyAverageHours);
  const minutes = Number(submission.weeklyAverageRemainderMinutes);
  const topApps = Array.isArray(submission.topApps) ? submission.topApps.join(", ") : "";
  const responseId = String(submission.id || "").slice(0, 6) || "entry";

  return {
    respondent: `Anonymous response ${responseId}`,
    screen_time: (hours * 60 + minutes) / 60,
    pickups: Number(submission.pickupsCount),
    notifications: Number(submission.notificationsCount),
    top_apps: topApps
  };
}

async function loadResponses() {
  const queryKey = new URLSearchParams(window.location.search).get("key") || "";

  if (!queryKey) {
    dataSourceLabel.textContent = "Using mock data";
    return mockResponses;
  }

  try {
    const response = await fetch(`/api/submissions?key=${encodeURIComponent(queryKey)}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to load submissions");
    }

    const liveResponses = (result.submissions || [])
      .filter((submission) => Array.isArray(submission.topApps))
      .map(normalizeLiveResponse)
      .filter((item) => Number.isFinite(item.screen_time));

    if (!liveResponses.length) {
      dataSourceLabel.textContent = "Using mock data";
      return mockResponses;
    }

    dataSourceLabel.textContent = "Using live survey data";
    return liveResponses;
  } catch (error) {
    console.error(error);
    dataSourceLabel.textContent = "Using mock data";
    return mockResponses;
  }
}

function createScreenTimeChart(responses) {
  const bucketed = bucketScreenTime(responses);

  if (screenTimeChart) {
    screenTimeChart.destroy();
  }

  screenTimeChart = new Chart(screenTimeChartCanvas, {
    type: "bar",
    data: {
      labels: Object.keys(bucketed),
      datasets: [
        {
          label: "Students",
          data: Object.values(bucketed),
          backgroundColor: "#5aa9ff",
          borderRadius: 16,
          maxBarThickness: 72
        }
      ]
    },
    options: baseChartOptions("Number of students")
  });
}

function createComparisonChart(responses) {
  const averagePickups = Math.round(computeAveragePerWakingHour(responses, "pickups"));
  const averageNotifications = Math.round(
    computeAveragePerWakingHour(responses, "notifications")
  );

  if (comparisonChart) {
    comparisonChart.destroy();
  }

  comparisonChart = new Chart(comparisonChartCanvas, {
    type: "bar",
    data: {
      labels: ["Average pickups", "Average notifications"],
      datasets: [
        {
          label: "Average per waking hour",
          data: [averagePickups, averageNotifications],
          backgroundColor: ["#22c55e", "#f59e0b"],
          borderRadius: 16,
          maxBarThickness: 96
        }
      ]
    },
    options: baseChartOptions("Average per waking hour")
  });
}

function createTopAppsChart(responses) {
  const topApps = parseAndCountApps(responses);

  if (topAppsChart) {
    topAppsChart.destroy();
  }

  topAppsChart = new Chart(topAppsChartCanvas, {
    type: "bar",
    data: {
      labels: topApps.map((item) => item.name),
      datasets: [
        {
          label: "Mentions",
          data: topApps.map((item) => item.count),
          backgroundColor: "#a78bfa",
          borderRadius: 16,
          maxBarThickness: 72
        }
      ]
    },
    options: baseChartOptions("Number of mentions")
  });
}

function baseChartOptions(axisLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#d5d9df",
          font: {
            size: 16,
            weight: "600"
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#d5d9df",
          font: {
            size: 15
          }
        },
        title: {
          display: true,
          text: axisLabel,
          color: "#8e97a3",
          font: {
            size: 15,
            weight: "600"
          }
        },
        grid: {
          color: "rgba(213, 217, 223, 0.12)"
        }
      }
    }
  };
}

async function renderDashboard() {
  const responses = await loadResponses();
  const pickupExtremes = findExtremes(responses, "pickups");
  const notificationExtremes = findExtremes(responses, "notifications");
  const topCategories = parseAndCountAppCategories(responses);
  const averageScreenTime = computeAverage(responses, "screen_time");
  const averagePickupsPerHour = Math.round(
    computeAveragePerWakingHour(responses, "pickups")
  );
  const averageNotificationsPerHour = Math.round(
    computeAveragePerWakingHour(responses, "notifications")
  );
  const wakingDayShare = averageScreenTime > 0 ? (averageScreenTime / 16) * 100 : null;
  const pickupMinutesGap = computeMinutesBetweenEvents(averagePickupsPerHour);
  const notificationMinutesGap = computeMinutesBetweenEvents(averageNotificationsPerHour);

  totalResponses.textContent = String(responses.length);
  createScreenTimeChart(responses);
  createComparisonChart(responses);
  createTopAppsChart(responses);

  if (wakingDayShare) {
    screenTimePercent.textContent = `${Math.round(wakingDayShare)}%`;
    screenTimeSentence.textContent = "of your waking day is spent on your phone, based on a 16-hour day.";
  } else {
    screenTimePercent.textContent = "--";
    screenTimeSentence.textContent = "Not enough data to estimate the share of the waking day spent on the phone.";
  }

  if (topCategories.length) {
    const leadingCategory = topCategories[0];
    topCategoryName.textContent = leadingCategory.name;
    categorySentence.textContent = `Most app mentions fall into ${leadingCategory.name.toLowerCase()}, which suggests that this category shapes everyday phone habits the most in our sample.`;
  } else {
    topCategoryName.textContent = "--";
    categorySentence.textContent = "Not enough data to identify a leading app category.";
  }

  pickupSentence.textContent = pickupMinutesGap
    ? `On average, every ${Math.round(pickupMinutesGap)} minutes we pick up our phone.`
    : "Not enough data to estimate pickup frequency.";

  notificationSentence.textContent = notificationMinutesGap
    ? `On average, every ${Math.round(notificationMinutesGap)} minutes we receive a notification.`
    : "Not enough data to estimate notification frequency.";

  if (pickupExtremes.highest) {
    highestPickupValue.textContent = String(pickupExtremes.highest.pickups);
  } else {
    highestPickupValue.textContent = "--";
  }

  if (pickupExtremes.lowest) {
    lowestPickupValue.textContent = String(pickupExtremes.lowest.pickups);
  } else {
    lowestPickupValue.textContent = "--";
  }

  if (notificationExtremes.highest) {
    highestNotificationValue.textContent = String(notificationExtremes.highest.notifications);
  } else {
    highestNotificationValue.textContent = "--";
  }

  if (notificationExtremes.lowest) {
    lowestNotificationValue.textContent = String(notificationExtremes.lowest.notifications);
  } else {
    lowestNotificationValue.textContent = "--";
  }
}

renderDashboard();
