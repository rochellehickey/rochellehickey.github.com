// sticky header
const body = document.body;
const scrollUp = "scroll-up";
const scrollDown = "scroll-down";
let lastScroll = 0;
// filter button
const button = document.getElementsByTagName('BUTTON');
const resetWebFilter = document.getElementById('webReset');
const resetPrintFilter = document.getElementById('printReset');
const cssFilter = document.getElementById('cssFilter');
const jsFilter = document.getElementById('jsFilter');
const reactFilter = document.getElementById('reactFilter');
const reportsFilter = document.getElementById('reportsFilter');
const multipleComponentsFilter = document.getElementById('multipleComponentsFilter');
const infographicsFilter = document.getElementById('infographicsFilter');


// STICKY HEADER

// When the page scrolls
window.addEventListener("scroll", () => {
  // Save the current scroll position
  const currentScroll = window.pageYOffset;
  // If the current scroll is at the top, remove the scrollUp class
  if (currentScroll == 0) {
    body.classList.remove(scrollUp);
    return;
  }

  if (currentScroll > lastScroll && !body.classList.contains(scrollDown)) {
    // Check if the current scroll is higher than the lastScroll and check if the body does not have the class scrollDown
    // remove class scrollUp
    // add class scrollDown
    body.classList.remove(scrollUp);
    body.classList.add(scrollDown);
  } else if (currentScroll < lastScroll && body.classList.contains(scrollDown)) {
    // Check if the current scroll is less than the lastScroll and check if the body does have the class scrollDown
    // remove class scrollDown
    // add class scrollUp
    body.classList.remove(scrollDown);
    body.classList.add(scrollUp);
  }
  // update the lastScroll to equal the currentScroll
  lastScroll = currentScroll;
});


// FILTER BUTTONS

// Web reset button
resetWebFilter.addEventListener('click', function() {
  // find the all the projects with the class project
  let projects = document.querySelectorAll('.project');
  // loop through each project found
  for (let i = 0; i < projects.length; i++) {
    // remove hidden class to all projects
    // add show class to all projects
    projects[i].classList.remove('hidden');
    projects[i].classList.add('show');
  }
});

// When CSS/SASS button is clicked
cssFilter.addEventListener('click', function() {
  // find the all the projects with the class project
  let projects = document.querySelectorAll('.project');
  // loop through each project found
  for (let i = 0; i < projects.length; i++) {
    // if the project does not have the data-filter attribute of css
    if (projects[i].getAttribute('data-filter') !== "css") {
      // remove show class
      // add hidden class
      projects[i].classList.remove('show');
      projects[i].classList.add('hidden');
    } else {
      // if the project does have the data-filter attribute of css
      // remove hidden class
      // add show class
      projects[i].classList.remove('hidden');
      projects[i].classList.add('show');
    }
  }
});

// When JavaScript buton is clicked
jsFilter.addEventListener('click', function() {
  // find the all the projects with the class project
  let projects = document.querySelectorAll('.project');
  // loop through each project found
  for (let i = 0; i < projects.length; i++) {
    // if the project does not have the data-filter attribute of javascript
    if (projects[i].getAttribute('data-filter') !== "javascript") {
      // remove show class
      // add hidden class
      projects[i].classList.remove('show');
      projects[i].classList.add('hidden');
    } else {
      // if the project does have the data-filter attribute of javascript
      // remove hidden class
      // add show class
      projects[i].classList.remove('hidden');
      projects[i].classList.add('show');
    }
  }
});

// When React buton is clicked
reactFilter.addEventListener('click', function() {
  // find the all the projects with the class project
  let projects = document.querySelectorAll('.project');
  // loop through each project found
  for (let i = 0; i < projects.length; i++) {
    // if the project does not have the data-filter attribute of react
    if (projects[i].getAttribute('data-filter') !== "react") {
      // remove show class
      // add hidden class
      projects[i].classList.remove('show');
      projects[i].classList.add('hidden');
    } else {
      // if the project does have the data-filter attribute of react
      // remove hidden class
      // add show class
      projects[i].classList.remove('hidden');
      projects[i].classList.add('show');
    }
  }
});
















