const notificationBell = document.querySelector(".dropdown");
const navArrow = document.querySelector(".arrow-up");
const navDropDownContent = document.querySelector(".dropdown-content");
const iconDashboard = document.getElementById("iconDashboard");
const iconMembers = document.getElementById("iconMembers");
const iconVisits = document.getElementById("iconVisits");
const iconSettings = document.getElementById("iconSettings");
const closeButton = document.querySelector(".close-button");
const alertBox = document.querySelector(".alert-box");
const hidden = document.querySelector(".hidden");
const context = document.querySelector('#trafficData').getContext('2d');
const myDailyTrafficChart = document.getElementById("dailyTrafficData").getContext("2d");
const myMobileChart = document.getElementById("mobileUserData").getContext("2d");
const hourlyButton = document.querySelector(".hourly");
const dailyButton = document.querySelector(".daily");
const weeklyButton = document.querySelector(".weekly");
const monthlyButton = document.querySelector(".monthly");
const messageForm = document.getElementById('messageForm');
const recipientField = document.getElementById('search-for-user');
const messageField = document.getElementById('msg');
const submitButton = document.getElementById('submit-button');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const storableCheckboxes = document.querySelectorAll('.checkbox-store-me');
const sliderEmail = document.getElementById('checkbox-slider-email');
const sliderPublic = document.getElementById('checkbox-slider-public');
const zone = document.getElementById('zone');
const saveSettings = document.getElementById("save-settings");
const cancelSettings = document.getElementById("cancel-settings");



// NAVIGATION
// Open and close dropdown menu when notification bell icon has been clicked
notificationBell.addEventListener('click', function() {
  navArrow.classList.toggle('show');
  navDropDownContent.classList.toggle('show');
});

// Keep secondary nav button appearing active after button has been clicked
iconDashboard.addEventListener('click', function() {
  iconDashboard.className = "dashboard-active";
  iconMembers.className = "dashboard-inactive";
  iconVisits.className = "dashboard-inactive";
  iconSettings.className = "dashboard-inactive";
});

iconMembers.addEventListener('click', function() {
  iconDashboard.className = "dashboard-inactive";
  iconMembers.className = "dashboard-active";
  iconVisits.className = "dashboard-inactive";
  iconSettings.className = "dashboard-inactive";
});

iconVisits.addEventListener('click', function() {
  iconDashboard.className = "dashboard-inactive";
  iconMembers.className = "dashboard-inactive";
  iconVisits.className = "dashboard-active";
  iconSettings.className = "dashboard-inactive";
});

iconSettings.addEventListener('click', function() {
  iconDashboard.className = "dashboard-inactive";
  iconMembers.className = "dashboard-inactive";
  iconVisits.className = "dashboard-inactive";
  iconSettings.className = "dashboard-active";
});

// ALERT BOX
closeButton.addEventListener('click', function() {
  // adds/toggles class of hidden to alert-box which removes it from the DOM
  alertBox.classList.toggle('hidden');
});

// GLOBAL OPTIONS FOR CHARTS
Chart.defaults.global.defaultFontFamily = 'Open Sans';
Chart.defaults.global.defaultFontSize = 14;
Chart.defaults.global.defaultFontColor = '#707070';

// TRAFFIC CHARTS
const trafficChartHourly = new Chart(context, {
    type: 'line',
    data: {
      labels: ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'],
      datasets: [{
        data: [575, 1250, 1000, 1500, 2000, 1500, 1750, 1250, 1750, 2250, 1750, 2250, 2250, 1250, 1000, 1500, 2000, 1500, 1750, 1250, 1750, 2250, 1750, 1250],
        borderColor: '#7576BE',
        backgroundColor: "rgba(117,118,190,.3)",
        borderWidth: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
       scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    },
});

const trafficChartDaily = new Chart(context, {
    type: 'line',
    data: {
      labels: ['16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26'],
      datasets: [{
        data: [675, 1450, 1500, 2000, 2500, 2500, 2750, 2250, 2500, 2750, 2750, 2750],
        borderColor: '#4D4A77',
        backgroundColor: "rgba(77, 74, 119,.3)",
        borderWidth: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    },
});

const trafficChartWeekly = new Chart(context, {
    type: 'line',
    data: {
      labels: ['16-22', '23-29', '30-5', '6-12', '13-19', '20-26', '27-3', '4-10', '11-17', '18-24', '25-31'],
      datasets: [{
        data: [800, 1550, 2000, 2500, 3000, 2750, 3250, 3750, 3000, 3500, 3250, 3000],
        borderColor: '#84CD94',
        backgroundColor: "rgba( 132, 205, 148,.3)",
        borderWidth: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    },
});

const trafficChartMonthly = new Chart(context, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        data: [2000, 3550, 5200, 5500, 6200, 5750, 6250, 6750, 6000, 6500, 6250, 6250, 6750],
        borderColor: '#74B1BE',
        backgroundColor: "rgba( 116, 177, 190,.3)",
        borderWidth: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    },
});

// TRAFFIC CHART BUTTONS

hourlyButton.addEventListener('click', function() {
  // Keep button appearing active after button has been clicked
  hourlyButton.className = "traffic-button-active";
  dailyButton.className = "traffic-button-inactive";
  weeklyButton.className = "traffic-button-inactive";
  monthlyButton.className = "traffic-button-inactive";
  // Change chart to match button pressed
  trafficChartHourly.render({
    duration: 800,
    lazy: false,
    easing: 'easeOutBounce'
  });
});

dailyButton.addEventListener('click', function() {
  // Keep button appearing active after button has been clicked
  hourlyButton.className = "traffic-button-inactive";
  dailyButton.className = "traffic-button-active";
  weeklyButton.className = "traffic-button-inactive";
  monthlyButton.className = "traffic-button-inactive";
  // Change chart to match button pressed
  trafficChartDaily.render({
    duration: 800,
    lazy: false,
    easing: 'easeOutBounce'
  });
});

weeklyButton.addEventListener('click', function() {
  // Keep button appearing active after button has been clicked
  hourlyButton.className = "traffic-button-inactive";
  dailyButton.className = "traffic-button-inactive";
  weeklyButton.className = "traffic-button-active";
  monthlyButton.className = "traffic-button-inactive";
  // Change chart to match button pressed
  trafficChartWeekly.render({
    duration: 800,
    lazy: false,
    easing: 'easeOutBounce'
  });
});

monthlyButton.addEventListener('click', function() {
  // Keep button appearing active after button has been clicked
  hourlyButton.className = "traffic-button-inactive";
  dailyButton.className = "traffic-button-inactive";
  weeklyButton.className = "traffic-button-inactive";
  monthlyButton.className = "traffic-button-active";
  // Change chart to match button pressed
  trafficChartMonthly.render({
    duration: 800,
    lazy: false,
    easing: 'easeOutBounce'
  });
});


// DAILY TRAFFIC CHART
const dailyTrafficChart = new Chart(myDailyTrafficChart, {
    type: 'bar',
    data: {
      labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      datasets: [{
        data: [50, 100, 175, 125, 225, 200, 100],
        backgroundColor: "#7576BE",
        borderWidth: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
    },
});


// MOBILE USER CHART
const mobileUserChart = new Chart(myMobileChart, {
    type: 'doughnut',
    data: {
      labels: ['Desktop', 'Tablets', 'Phones'],
      datasets: [{
        data: [65, 20, 15],
        backgroundColor: ["#7576BE", "#84CD94", "#74B1BE"],
        borderWidth: 0
        }]
    },
    options: {
      legend: {
        position: 'right'
      }
    },
});

// MESSAGE FORM SUBMITION
submitButton.addEventListener('click', function (event) {
  successMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');
  isValidRecipient = recipientField.checkValidity();
  isValidMessage = messageField.checkValidity();
  if (isValidRecipient && isValidMessage) {
    event.preventDefault();
    successMessage.classList.remove('hidden');
    messageForm.parentNode.removeChild(messageForm);
  } else {
    errorMessage.classList.remove('hidden');
    return false;
  }
});

// LOCAL STORAGE
function save() {
  localStorage.setItem("checkbox-email", sliderEmail.checked);
  localStorage.setItem("checkbox-public", sliderPublic.checked);
  localStorage.setItem("select-zone", zone.value);
}

//for loading
let sliderEmailValue = JSON.parse(localStorage.getItem("checkbox-email"));
let sliderPublicValue = JSON.parse(localStorage.getItem("checkbox-public"));
let zoneValue = JSON.parse(localStorage.getItem("select-zone"));

if (sliderEmailValue) {
  sliderEmail.checked = sliderEmailValue;
}
if (sliderPublicValue) {
  sliderPublic.checked = sliderPublicValue;
}
if (zoneValue) {
  zone.value = zoneValue;
}

saveSettings.addEventListener('click', function(event) {
  event.preventDefault();
  save();
});

cancelSettings.addEventListener('click', function() {
  localStorage.clear();
  sliderEmail.checked = false;
  sliderPublic.checked = false;
});





