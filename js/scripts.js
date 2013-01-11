/* Create slider for image thumbnails ========================================================== */


/* Change header styling on scroll ============================================================= */
$(window).scroll(function() {
  var scrollBoundary = 350, // offset in px at which change should occur
      scroll = $(window).scrollTop();
  if ( scroll <= scrollBoundary ) {
    $('header').removeClass('short');
  } else if ( scroll >= scrollBoundary ) {
    $('header').addClass('short');
  }
});

/* Add .scroll-on-click to an element to get animated scrolling ================================ */
$('.scroll-on-click').click(function() {
  var target = $(this).attr("href"),
      distance = $(target).offset().top;
  $('html, body').animate({ scrollTop: distance }, 250 );
  return false;
});