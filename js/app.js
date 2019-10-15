const body = document.body;
const scrollUp = "scroll-up";
const scrollDown = "scroll-down";
let lastScroll = 0;


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