const impactReport = document.getElementById('impact-report');
const buttonToProjectPage = document.createElement("button");

// SKILLS OVERLAY
impactReport.addEventListener ('click', function(event) {
  console.log('impact clicked');
  // on click, show overlay screen
  // event.stopImmediatePropagation();
  overlay.style.visibility = "visible";
  // overlay.innerHTML = "<div>
  //     <h2>Skills used for Impact Report</h2>
  //     <ul>
  //       <li>Organization</li>
  //       <li>InDesign</li>
  //       <li>Infographics</li>
  //       <li>Icon development</li>
  //       <li>On brand design</li>
  //     </ul>
  //   </div>";
  // add button to go to page
  buttonToProjectPage.innerHTML = "<a>Continue to Impact Report</a>";
  buttonToProjectPage.className = "btn__reset";
  overlay.appendChild(buttonToProjectPage);
});
