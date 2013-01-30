Portfolio website: rochellehickeydesign.com
===========================================

Adding images to the page
-------------------------

Each content section (design, photography and fine art) has an unordered list with the class "slides" on it:
`<ul class="slides">`

New projects are added inside a list item:
`<li></li>`

The first element inside a new list item should be the image used in the slider to display it:
`<li>`
`  <img src="img/portfolio/new-project-small.jpg" />`
`</li>`

The slider image should be stored in the img/portfolio directory with the naming convention shown above, the project name appended with -small.jpg and all slider images should be 780px wide by 300px tall.

Captions are then added, which are the links that launch the lightbox. The first caption should be added in this manner:
`<li>`
`  <img src="img/portfolio/new-project-small.jpg" />`
`  <a href="img/portfolio/new-project-large-01.jpg" class="launch-lightbox fresco"`
`     data-fresco-caption="Caption for new project image 01"`
`     data-fresco-group="new-project"> <span class="caption">New Project</span></a>`
`</li>`

The href="" contains the path to the first image that will be displayed when the lightbox is launched. It should be named with the convention shown above, the project name appended with -large-01.jpg

The class="launch-lightbox fresco" tells the lightbox plugin to use this link to launch a lightbox.

The data-fresco-caption="Caption for new project image 01" creates a caption unique to that image.

The data-fresco-group="new-project" associates all the images to be launched in a lightbox with each other.

The `<span class="caption">New Project</span>` is the caption that will be used on the slider as the link that launches the lightbox.

Adding subsequent images follows this pattern:
`<li>`
`  <img src="img/portfolio/new-project-small.jpg" />`
`  <a href="img/portfolio/new-project-large-01.jpg" class="launch-lightbox fresco"`
`     data-fresco-caption="Caption for new project image 01"`
`     data-fresco-group="new-project"> <span class="caption">New Project</span></a>`
`  <a href="img/portfolio/new-project-large-02.jpg" class="hide-for-lightbox-lightbox fresco"`
`     data-fresco-caption="Caption for new project image 02"`
`     data-fresco-group="new-project"> <span class="caption">New Project</span></a>`
`</li>`

Further images require the addition of a new language, but by changing the launch-lightbox class to hide-for-lightbox you can hide the extra links in the browser. Only the first link should have the class of launch-lightbox.

As many images as are required can be used in a lightbox group. They should not be larger than 1000px wide by 600px tall, and they don't all have to be the same size.