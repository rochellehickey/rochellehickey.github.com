/*jshint esversion: 6 */

// sticky header
const body = document.body;
const scrollUp = "scroll-up";
const scrollDown = "scroll-down";
let lastScroll = 0;
// filter button
const button = document.getElementsByTagName('BUTTON');
const resetFilter = document.getElementById('reset');
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

for (let i=0; i < button.length; i++) {
  button[i].addEventListener('click', function() {
    if (button[i] === resetFilter) {
      // find the all the projects with the class project
      let projects = document.querySelectorAll('.project');
      // loop through each project found
      for (let i = 0; i < projects.length; i++) {
        // remove hidden class to all projects
        // add show class to all projects
        projects[i].classList.remove('hidden');
        projects[i].classList.add('show');
        // go through each button and remove the button Selected class
        for (let i=0; i < button.length; i++) {
          button[i].classList.remove('buttonSelected');
        }
      }
    } else if (button[i] === cssFilter) {
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
          // go through each button and remove the buttonSelected class
          // add buttonSelected class to cssFilter
          for (let i=0; i < button.length; i++) {
            button[i].classList.remove('buttonSelected');
          }
          cssFilter.classList.add('buttonSelected');
        }
      }
    } else if (button[i] === jsFilter) {
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
          // go through each button and remove the buttonSelected class
          // add buttonSelected class to jsFilter
          for (let i=0; i < button.length; i++) {
            button[i].classList.remove('buttonSelected');
          }
          jsFilter.classList.add('buttonSelected');
        }
      }
    } else if (button[i] === reactFilter) {
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
          // go through each button and remove the buttonSelected class
          // add buttonSelected class to reactFilter
          for (let i=0; i < button.length; i++) {
            button[i].classList.remove('buttonSelected');
          }
          reactFilter.classList.add('buttonSelected');
        }
      }
    } else if (button[i] === reportsFilter) {
      // find the all the projects with the class project
      let projects = document.querySelectorAll('.project');
      // loop through each project found
      for (let i = 0; i < projects.length; i++) {
        // if the project does not have the data-filter attribute of reports
        if (projects[i].getAttribute('data-filter') !== "reports") {
          // remove show class
          // add hidden class
          projects[i].classList.remove('show');
          projects[i].classList.add('hidden');
        } else {
          // if the project does have the data-filter attribute of reports
          // remove hidden class
          // add show class
          projects[i].classList.remove('hidden');
          projects[i].classList.add('show');
          // go through each button and remove the buttonSelected class
          // add buttonSelected class to reportsFilter
          for (let i=0; i < button.length; i++) {
            button[i].classList.remove('buttonSelected');
          }
          reportsFilter.classList.add('buttonSelected');
        }
      }
    } else if (button[i] === multipleComponentsFilter) {
      // find the all the projects with the class project
      let projects = document.querySelectorAll('.project');
      // loop through each project found
      for (let i = 0; i < projects.length; i++) {
        // if the project does not have the data-filter attribute of multiple
        if (projects[i].getAttribute('data-filter') !== "multiple") {
          // remove show class
          // add hidden class
          projects[i].classList.remove('show');
          projects[i].classList.add('hidden');
        } else {
          // if the project does have the data-filter attribute of multiple
          // remove hidden class
          // add show class
          projects[i].classList.remove('hidden');
          projects[i].classList.add('show');
          // go through each button and remove the buttonSelected class
          // add buttonSelected class to multipleComponentsFilter
          for (let i=0; i < button.length; i++) {
            button[i].classList.remove('buttonSelected');
          }
          multipleComponentsFilter.classList.add('buttonSelected');
        }
      }
    } else if (button[i] === infographicsFilter) {
      // find the all the projects with the class project
      let projects = document.querySelectorAll('.project');
      // loop through each project found
      for (let i = 0; i < projects.length; i++) {
        // if the project does not have the data-filter attribute of infographics
        if (projects[i].getAttribute('data-filter') !== "infographics") {
          // remove show class
          // add hidden class
          projects[i].classList.remove('show');
          projects[i].classList.add('hidden');
        } else {
          // if the project does have the data-filter attribute of infographics
          // remove hidden class
          // add show class
          projects[i].classList.remove('hidden');
          projects[i].classList.add('show');
          // go through each button and remove the buttonSelected class
          // add buttonSelected class to infographicsFilter
          for (let i=0; i < button.length; i++) {
            button[i].classList.remove('buttonSelected');
          }
          infographicsFilter.classList.add('buttonSelected');
        }
      }
    }
  });
}


















