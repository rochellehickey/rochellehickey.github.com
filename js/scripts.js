/*
 * jQuery FlexSlider v2.1
 * http://www.woothemes.com/flexslider/
 *
 * Copyright 2012 WooThemes
 * Free to use under the GPLv2 license.
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
 * Contributing author: Tyler Smith (@mbmufffin)
 */

;(function ($) {

  //FlexSlider: Object Instance
  $.flexslider = function(el, options) {
    var slider = $(el),
        vars = $.extend({}, $.flexslider.defaults, options),
        namespace = vars.namespace,
        touch = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch,
        eventType = (touch) ? "touchend" : "click",
        vertical = vars.direction === "vertical",
        reverse = vars.reverse,
        carousel = (vars.itemWidth > 0),
        fade = vars.animation === "fade",
        asNav = vars.asNavFor !== "",
        methods = {};

    // Store a reference to the slider object
    $.data(el, "flexslider", slider);

    // Privat slider methods
    methods = {
      init: function() {
        slider.animating = false;
        slider.currentSlide = vars.startAt;
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
        slider.containerSelector = vars.selector.substr(0,vars.selector.search(' '));
        slider.slides = $(vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        // SYNC:
        slider.syncExists = $(vars.sync).length > 0;
        // SLIDE:
        if (vars.animation === "slide") vars.animation = "swing";
        slider.prop = (vertical) ? "top" : "marginLeft";
        slider.args = {};
        // SLIDESHOW:
        slider.manualPause = false;
        // TOUCH/USECSS:
        slider.transitions = !vars.video && !fade && vars.useCSS && (function() {
          var obj = document.createElement('div'),
              props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
          for (var i in props) {
            if ( obj.style[ props[i] ] !== undefined ) {
              slider.pfx = props[i].replace('Perspective','').toLowerCase();
              slider.prop = "-" + slider.pfx + "-transform";
              return true;
            }
          }
          return false;
        }());
        // CONTROLSCONTAINER:
        if (vars.controlsContainer !== "") slider.controlsContainer = $(vars.controlsContainer).length > 0 && $(vars.controlsContainer);
        // MANUAL:
        if (vars.manualControls !== "") slider.manualControls = $(vars.manualControls).length > 0 && $(vars.manualControls);

        // RANDOMIZE:
        if (vars.randomize) {
          slider.slides.sort(function() { return (Math.round(Math.random())-0.5); });
          slider.container.empty().append(slider.slides);
        }

        slider.doMath();

        // ASNAV:
        if (asNav) methods.asNav.setup();

        // INIT
        slider.setup("init");

        // CONTROLNAV:
        if (vars.controlNav) methods.controlNav.setup();

        // DIRECTIONNAV:
        if (vars.directionNav) methods.directionNav.setup();

        // KEYBOARD:
        if (vars.keyboard && ($(slider.containerSelector).length === 1 || vars.multipleKeyboard)) {
          $(document).bind('keyup', function(event) {
            var keycode = event.keyCode;
            if (!slider.animating && (keycode === 39 || keycode === 37)) {
              var target = (keycode === 39) ? slider.getTarget('next') :
                           (keycode === 37) ? slider.getTarget('prev') : false;
              slider.flexAnimate(target, vars.pauseOnAction);
            }
          });
        }
        // MOUSEWHEEL:
        if (vars.mousewheel) {
          slider.bind('mousewheel', function(event, delta, deltaX, deltaY) {
            event.preventDefault();
            var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
            slider.flexAnimate(target, vars.pauseOnAction);
          });
        }

        // PAUSEPLAY
        if (vars.pausePlay) methods.pausePlay.setup();

        // SLIDSESHOW
        if (vars.slideshow) {
          if (vars.pauseOnHover) {
            slider.hover(function() {
              if (!slider.manualPlay && !slider.manualPause) slider.pause();
            }, function() {
              if (!slider.manualPause && !slider.manualPlay) slider.play();
            });
          }
          // initialize animation
          (vars.initDelay > 0) ? setTimeout(slider.play, vars.initDelay) : slider.play();
        }

        // TOUCH
        if (touch && vars.touch) methods.touch();

        // FADE&&SMOOTHHEIGHT || SLIDE:
        if (!fade || (fade && vars.smoothHeight)) $(window).bind("resize focus", methods.resize);


        // API: start() Callback
        setTimeout(function(){
          vars.start(slider);
        }, 200);
      },
      asNav: {
        setup: function() {
          slider.asNav = true;
          slider.animatingTo = Math.floor(slider.currentSlide/slider.move);
          slider.currentItem = slider.currentSlide;
          slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
          slider.slides.click(function(e){
            e.preventDefault();
            var $slide = $(this),
                target = $slide.index();
            if (!$(vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
              slider.direction = (slider.currentItem < target) ? "next" : "prev";
              slider.flexAnimate(target, vars.pauseOnAction, false, true, true);
            }
          });
        }
      },
      controlNav: {
        setup: function() {
          if (!slider.manualControls) {
            methods.controlNav.setupPaging();
          } else { // MANUALCONTROLS:
            methods.controlNav.setupManual();
          }
        },
        setupPaging: function() {
          var type = (vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
              j = 1,
              item;

          slider.controlNavScaffold = $('<ol class="'+ namespace + 'control-nav ' + namespace + type + '"></ol>');

          if (slider.pagingCount > 1) {
            for (var i = 0; i < slider.pagingCount; i++) {
              item = (vars.controlNav === "thumbnails") ? '<img src="' + slider.slides.eq(i).attr("data-thumb") + '"/>' : '<a>' + j + '</a>';
              slider.controlNavScaffold.append('<li>' + item + '</li>');
              j++;
            }
          }

          // CONTROLSCONTAINER:
          (slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold) : slider.append(slider.controlNavScaffold);
          methods.controlNav.set();

          methods.controlNav.active();

          slider.controlNavScaffold.delegate('a, img', eventType, function(event) {
            event.preventDefault();
            var $this = $(this),
                target = slider.controlNav.index($this);

            if (!$this.hasClass(namespace + 'active')) {
              slider.direction = (target > slider.currentSlide) ? "next" : "prev";
              slider.flexAnimate(target, vars.pauseOnAction);
            }
          });
          // Prevent iOS click event bug
          if (touch) {
            slider.controlNavScaffold.delegate('a', "click touchstart", function(event) {
              event.preventDefault();
            });
          }
        },
        setupManual: function() {
          slider.controlNav = slider.manualControls;
          methods.controlNav.active();

          slider.controlNav.live(eventType, function(event) {
            event.preventDefault();
            var $this = $(this),
                target = slider.controlNav.index($this);

            if (!$this.hasClass(namespace + 'active')) {
              (target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
              slider.flexAnimate(target, vars.pauseOnAction);
            }
          });
          // Prevent iOS click event bug
          if (touch) {
            slider.controlNav.live("click touchstart", function(event) {
              event.preventDefault();
            });
          }
        },
        set: function() {
          var selector = (vars.controlNav === "thumbnails") ? 'img' : 'a';
          slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
        },
        active: function() {
          slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
        },
        update: function(action, pos) {
          if (slider.pagingCount > 1 && action === "add") {
            slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
          } else if (slider.pagingCount === 1) {
            slider.controlNavScaffold.find('li').remove();
          } else {
            slider.controlNav.eq(pos).closest('li').remove();
          }
          methods.controlNav.set();
          (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
        }
      },
      directionNav: {
        setup: function() {
          var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li><a class="' + namespace + 'prev" href="#">' + vars.prevText + '</a></li><li><a class="' + namespace + 'next" href="#">' + vars.nextText + '</a></li></ul>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            $(slider.controlsContainer).append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
          } else {
            slider.append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
          }

          methods.directionNav.update();

          slider.directionNav.bind(eventType, function(event) {
            event.preventDefault();
            var target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
            slider.flexAnimate(target, vars.pauseOnAction);
          });
          // Prevent iOS click event bug
          if (touch) {
            slider.directionNav.bind("click touchstart", function(event) {
              event.preventDefault();
            });
          }
        },
        update: function() {
          var disabledClass = namespace + 'disabled';
          if (slider.pagingCount === 1) {
            slider.directionNav.addClass(disabledClass);
          } else if (!vars.animationLoop) {
            if (slider.animatingTo === 0) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass);
            } else if (slider.animatingTo === slider.last) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass);
            } else {
              slider.directionNav.removeClass(disabledClass);
            }
          } else {
            slider.directionNav.removeClass(disabledClass);
          }
        }
      },
      pausePlay: {
        setup: function() {
          var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a></a></div>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            slider.controlsContainer.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
          } else {
            slider.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
          }

          methods.pausePlay.update((vars.slideshow) ? namespace + 'pause' : namespace + 'play');

          slider.pausePlay.bind(eventType, function(event) {
            event.preventDefault();
            if ($(this).hasClass(namespace + 'pause')) {
              slider.manualPause = true;
              slider.manualPlay = false;
              slider.pause();
            } else {
              slider.manualPause = false;
              slider.manualPlay = true;
              slider.play();
            }
          });
          // Prevent iOS click event bug
          if (touch) {
            slider.pausePlay.bind("click touchstart", function(event) {
              event.preventDefault();
            });
          }
        },
        update: function(state) {
          (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').text(vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').text(vars.pauseText);
        }
      },
      touch: function() {
        var startX,
          startY,
          offset,
          cwidth,
          dx,
          startT,
          scrolling = false;

        el.addEventListener('touchstart', onTouchStart, false);
        function onTouchStart(e) {
          if (slider.animating) {
            e.preventDefault();
          } else if (e.touches.length === 1) {
            slider.pause();
            // CAROUSEL:
            cwidth = (vertical) ? slider.h : slider. w;
            startT = Number(new Date());
            // CAROUSEL:
            offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                     (carousel && reverse) ? slider.limit - (((slider.itemW + vars.itemMargin) * slider.move) * slider.animatingTo) :
                     (carousel && slider.currentSlide === slider.last) ? slider.limit :
                     (carousel) ? ((slider.itemW + vars.itemMargin) * slider.move) * slider.currentSlide :
                     (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
            startX = (vertical) ? e.touches[0].pageY : e.touches[0].pageX;
            startY = (vertical) ? e.touches[0].pageX : e.touches[0].pageY;

            el.addEventListener('touchmove', onTouchMove, false);
            el.addEventListener('touchend', onTouchEnd, false);
          }
        }

        function onTouchMove(e) {
          dx = (vertical) ? startX - e.touches[0].pageY : startX - e.touches[0].pageX;
          scrolling = (vertical) ? (Math.abs(dx) < Math.abs(e.touches[0].pageX - startY)) : (Math.abs(dx) < Math.abs(e.touches[0].pageY - startY));

          if (!scrolling || Number(new Date()) - startT > 500) {
            e.preventDefault();
            if (!fade && slider.transitions) {
              if (!vars.animationLoop) {
                dx = dx/((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx)/cwidth+2) : 1);
              }
              slider.setProps(offset + dx, "setTouch");
            }
          }
        }

        function onTouchEnd(e) {
          // finish the touch by undoing the touch session
          el.removeEventListener('touchmove', onTouchMove, false);

          if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
            var updateDx = (reverse) ? -dx : dx,
                target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

            if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
              slider.flexAnimate(target, vars.pauseOnAction);
            } else {
              if (!fade) slider.flexAnimate(slider.currentSlide, vars.pauseOnAction, true);
            }
          }
          el.removeEventListener('touchend', onTouchEnd, false);
          startX = null;
          startY = null;
          dx = null;
          offset = null;
        }
      },
      resize: function() {
        if (!slider.animating && slider.is(':visible')) {
          if (!carousel) slider.doMath();

          if (fade) {
            // SMOOTH HEIGHT:
            methods.smoothHeight();
          } else if (carousel) { //CAROUSEL:
            slider.slides.width(slider.computedW);
            slider.update(slider.pagingCount);
            slider.setProps();
          }
          else if (vertical) { //VERTICAL:
            slider.viewport.height(slider.h);
            slider.setProps(slider.h, "setTotal");
          } else {
            // SMOOTH HEIGHT:
            if (vars.smoothHeight) methods.smoothHeight();
            slider.newSlides.width(slider.computedW);
            slider.setProps(slider.computedW, "setTotal");
          }
        }
      },
      smoothHeight: function(dur) {
        if (!vertical || fade) {
          var $obj = (fade) ? slider : slider.viewport;
          (dur) ? $obj.animate({"height": slider.slides.eq(slider.animatingTo).height()}, dur) : $obj.height(slider.slides.eq(slider.animatingTo).height());
        }
      },
      sync: function(action) {
        var $obj = $(vars.sync).data("flexslider"),
            target = slider.animatingTo;

        switch (action) {
          case "animate": $obj.flexAnimate(target, vars.pauseOnAction, false, true); break;
          case "play": if (!$obj.playing && !$obj.asNav) { $obj.play(); } break;
          case "pause": $obj.pause(); break;
        }
      }
    }

    // public methods
    slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
      if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

      if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
        if (asNav && withSync) {
          var master = $(vars.asNavFor).data('flexslider');
          slider.atEnd = target === 0 || target === slider.count - 1;
          master.flexAnimate(target, true, false, true, fromNav);
          slider.direction = (slider.currentItem < target) ? "next" : "prev";
          master.direction = slider.direction;

          if (Math.ceil((target + 1)/slider.visible) - 1 !== slider.currentSlide && target !== 0) {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            target = Math.floor(target/slider.visible);
          } else {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            return false;
          }
        }

        slider.animating = true;
        slider.animatingTo = target;
        // API: before() animation Callback
        vars.before(slider);

        // SLIDESHOW:
        if (pause) slider.pause();

        // SYNC:
        if (slider.syncExists && !fromNav) methods.sync("animate");

        // CONTROLNAV
        if (vars.controlNav) methods.controlNav.active();

        // !CAROUSEL:
        // CANDIDATE: slide active class (for add/remove slide)
        if (!carousel) slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');

        // INFINITE LOOP:
        // CANDIDATE: atEnd
        slider.atEnd = target === 0 || target === slider.last;

        // DIRECTIONNAV:
        if (vars.directionNav) methods.directionNav.update();

        if (target === slider.last) {
          // API: end() of cycle Callback
          vars.end(slider);
          // SLIDESHOW && !INFINITE LOOP:
          if (!vars.animationLoop) slider.pause();
        }

        // SLIDE:
        if (!fade) {
          var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
              margin, slideString, calcNext;

          // INFINITE LOOP / REVERSE:
          if (carousel) {
            margin = (vars.itemWidth > slider.w) ? vars.itemMargin * 2 : vars.itemMargin;
            calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
            slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
          } else if (slider.currentSlide === 0 && target === slider.count - 1 && vars.animationLoop && slider.direction !== "next") {
            slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
          } else if (slider.currentSlide === slider.last && target === 0 && vars.animationLoop && slider.direction !== "prev") {
            slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
          } else {
            slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
          }
          slider.setProps(slideString, "", vars.animationSpeed);
          if (slider.transitions) {
            if (!vars.animationLoop || !slider.atEnd) {
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
            }
            slider.container.unbind("webkitTransitionEnd transitionend");
            slider.container.bind("webkitTransitionEnd transitionend", function() {
              slider.wrapup(dimension);
            });
          } else {
            slider.container.animate(slider.args, vars.animationSpeed, vars.easing, function(){
              slider.wrapup(dimension);
            });
          }
        } else { // FADE:
          if (!touch) {
            slider.slides.eq(slider.currentSlide).fadeOut(vars.animationSpeed, vars.easing);
            slider.slides.eq(target).fadeIn(vars.animationSpeed, vars.easing, slider.wrapup);
          } else {
            slider.slides.eq(slider.currentSlide).css({ "opacity": 0, "zIndex": 1 });
            slider.slides.eq(target).css({ "opacity": 1, "zIndex": 2 });

            slider.slides.unbind("webkitTransitionEnd transitionend");
            slider.slides.eq(slider.currentSlide).bind("webkitTransitionEnd transitionend", function() {
              // API: after() animation Callback
              vars.after(slider);
            });

            slider.animating = false;
            slider.currentSlide = slider.animatingTo;
          }
        }
        // SMOOTH HEIGHT:
        if (vars.smoothHeight) methods.smoothHeight(vars.animationSpeed);
      }
    }
    slider.wrapup = function(dimension) {
      // SLIDE:
      if (!fade && !carousel) {
        if (slider.currentSlide === 0 && slider.animatingTo === slider.last && vars.animationLoop) {
          slider.setProps(dimension, "jumpEnd");
        } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && vars.animationLoop) {
          slider.setProps(dimension, "jumpStart");
        }
      }
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
      // API: after() animation Callback
      vars.after(slider);
    }

    // SLIDESHOW:
    slider.animateSlides = function() {
      if (!slider.animating) slider.flexAnimate(slider.getTarget("next"));
    }
    // SLIDESHOW:
    slider.pause = function() {
      clearInterval(slider.animatedSlides);
      slider.playing = false;
      // PAUSEPLAY:
      if (vars.pausePlay) methods.pausePlay.update("play");
      // SYNC:
      if (slider.syncExists) methods.sync("pause");
    }
    // SLIDESHOW:
    slider.play = function() {
      slider.animatedSlides = setInterval(slider.animateSlides, vars.slideshowSpeed);
      slider.playing = true;
      // PAUSEPLAY:
      if (vars.pausePlay) methods.pausePlay.update("pause");
      // SYNC:
      if (slider.syncExists) methods.sync("play");
    }
    slider.canAdvance = function(target, fromNav) {
      // ASNAV:
      var last = (asNav) ? slider.pagingCount - 1 : slider.last;
      return (fromNav) ? true :
             (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
             (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
             (target === slider.currentSlide && !asNav) ? false :
             (vars.animationLoop) ? true :
             (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
             (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
             true;
    }
    slider.getTarget = function(dir) {
      slider.direction = dir;
      if (dir === "next") {
        return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
      } else {
        return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
      }
    }

    // SLIDE:
    slider.setProps = function(pos, special, dur) {
      var target = (function() {
        var posCheck = (pos) ? pos : ((slider.itemW + vars.itemMargin) * slider.move) * slider.animatingTo,
            posCalc = (function() {
              if (carousel) {
                return (special === "setTouch") ? pos :
                       (reverse && slider.animatingTo === slider.last) ? 0 :
                       (reverse) ? slider.limit - (((slider.itemW + vars.itemMargin) * slider.move) * slider.animatingTo) :
                       (slider.animatingTo === slider.last) ? slider.limit : posCheck;
              } else {
                switch (special) {
                  case "setTotal": return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                  case "setTouch": return (reverse) ? pos : pos;
                  case "jumpEnd": return (reverse) ? pos : slider.count * pos;
                  case "jumpStart": return (reverse) ? slider.count * pos : pos;
                  default: return pos;
                }
              }
            }());
            return (posCalc * -1) + "px";
          }());

      if (slider.transitions) {
        target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
        dur = (dur !== undefined) ? (dur/1000) + "s" : "0s";
        slider.container.css("-" + slider.pfx + "-transition-duration", dur);
      }

      slider.args[slider.prop] = target;
      if (slider.transitions || dur === undefined) slider.container.css(slider.args);
    }

    slider.setup = function(type) {
      // SLIDE:
      if (!fade) {
        var sliderOffset, arr;

        if (type === "init") {
          slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({"overflow": "hidden", "position": "relative"}).appendTo(slider).append(slider.container);
          // INFINITE LOOP:
          slider.cloneCount = 0;
          slider.cloneOffset = 0;
          // REVERSE:
          if (reverse) {
            arr = $.makeArray(slider.slides).reverse();
            slider.slides = $(arr);
            slider.container.empty().append(slider.slides);
          }
        }
        // INFINITE LOOP && !CAROUSEL:
        if (vars.animationLoop && !carousel) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          // clear out old clones
          if (type !== "init") slider.container.find('.clone').remove();
          slider.container.append(slider.slides.first().clone().addClass('clone')).prepend(slider.slides.last().clone().addClass('clone'));
        }
        slider.newSlides = $(vars.selector, slider);

        sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
        // VERTICAL:
        if (vertical && !carousel) {
          slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
          setTimeout(function(){
            slider.newSlides.css({"display": "block"});
            slider.doMath();
            slider.viewport.height(slider.h);
            slider.setProps(sliderOffset * slider.h, "init");
          }, (type === "init") ? 100 : 0);
        } else {
          slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
          slider.setProps(sliderOffset * slider.computedW, "init");
          setTimeout(function(){
            slider.doMath();
            slider.newSlides.css({"width": slider.computedW, "float": "left", "display": "block"});
            // SMOOTH HEIGHT:
            if (vars.smoothHeight) methods.smoothHeight();
          }, (type === "init") ? 100 : 0);
        }
      } else { // FADE:
        slider.slides.css({"width": "100%", "float": "left", "marginRight": "-100%", "position": "relative"});
        if (type === "init") {
          if (!touch) {
            slider.slides.eq(slider.currentSlide).fadeIn(vars.animationSpeed, vars.easing);
          } else {
            slider.slides.css({ "opacity": 0, "display": "block", "webkitTransition": "opacity " + vars.animationSpeed / 1000 + "s ease", "zIndex": 1 }).eq(slider.currentSlide).css({ "opacity": 1, "zIndex": 2});
          }
        }
        // SMOOTH HEIGHT:
        if (vars.smoothHeight) methods.smoothHeight();
      }
      // !CAROUSEL:
      // CANDIDATE: active slide
      if (!carousel) slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");
    }

    slider.doMath = function() {
      var slide = slider.slides.first(),
          slideMargin = vars.itemMargin,
          minItems = vars.minItems,
          maxItems = vars.maxItems;

      slider.w = slider.width();
      slider.h = slide.height();
      slider.boxPadding = slide.outerWidth() - slide.width();

      // CAROUSEL:
      if (carousel) {
        slider.itemT = vars.itemWidth + slideMargin;
        slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
        slider.maxW = (maxItems) ? maxItems * slider.itemT : slider.w;
        slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * minItems))/minItems :
                       (slider.maxW < slider.w) ? (slider.w - (slideMargin * maxItems))/maxItems :
                       (vars.itemWidth > slider.w) ? slider.w : vars.itemWidth;
        slider.visible = Math.floor(slider.w/(slider.itemW + slideMargin));
        slider.move = (vars.move > 0 && vars.move < slider.visible ) ? vars.move : slider.visible;
        slider.pagingCount = Math.ceil(((slider.count - slider.visible)/slider.move) + 1);
        slider.last =  slider.pagingCount - 1;
        slider.limit = (slider.pagingCount === 1) ? 0 :
                       (vars.itemWidth > slider.w) ? ((slider.itemW + (slideMargin * 2)) * slider.count) - slider.w - slideMargin : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
      } else {
        slider.itemW = slider.w;
        slider.pagingCount = slider.count;
        slider.last = slider.count - 1;
      }
      slider.computedW = slider.itemW - slider.boxPadding;
    }

    slider.update = function(pos, action) {
      slider.doMath();

      // update currentSlide and slider.animatingTo if necessary
      if (!carousel) {
        if (pos < slider.currentSlide) {
          slider.currentSlide += 1;
        } else if (pos <= slider.currentSlide && pos !== 0) {
          slider.currentSlide -= 1;
        }
        slider.animatingTo = slider.currentSlide;
      }

      // update controlNav
      if (vars.controlNav && !slider.manualControls) {
        if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
          methods.controlNav.update("add");
        } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
          if (carousel && slider.currentSlide > slider.last) {
            slider.currentSlide -= 1;
            slider.animatingTo -= 1;
          }
          methods.controlNav.update("remove", slider.last);
        }
      }
      // update directionNav
      if (vars.directionNav) methods.directionNav.update();

    }

    slider.addSlide = function(obj, pos) {
      var $obj = $(obj);

      slider.count += 1;
      slider.last = slider.count - 1;

      // append new slide
      if (vertical && reverse) {
        (pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
      } else {
        (pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.update(pos, "add");

      // update slider.slides
      slider.slides = $(vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      //FlexSlider: added() Callback
      vars.added(slider);
    }
    slider.removeSlide = function(obj) {
      var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

      // update count
      slider.count -= 1;
      slider.last = slider.count - 1;

      // remove slide
      if (isNaN(obj)) {
        $(obj, slider.slides).remove();
      } else {
        (vertical && reverse) ? slider.slides.eq(slider.last).remove() : slider.slides.eq(obj).remove();
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.doMath();
      slider.update(pos, "remove");

      // update slider.slides
      slider.slides = $(vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      // FlexSlider: removed() Callback
      vars.removed(slider);
    }

    //FlexSlider: Initialize
    methods.init();
  }

  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
    selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
    animation: "slide",             //String: Select your animation type, "fade" or "slide"
    easing: "swing",                //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
    direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
    reverse: false,                 //{NEW} Boolean: Reverse the animation direction
    animationLoop: true,            //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
    smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode
    startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
    slideshow: false,               //Boolean: Animate slider automatically
    slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
    animationSpeed: 500,            //Integer: Set the speed of animations, in milliseconds
    initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
    randomize: false,               //Boolean: Randomize slide order

    // Usability features
    pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
    pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
    useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
    touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
    video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

    // Primary Controls
    controlNav: true,               //Boolean: Create navigation for paging control of each clide? Note: Leave true for manualControls usage
    directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
    prevText: "Previous",           //String: Set the text for the "previous" directionNav item
    nextText: "Next",               //String: Set the text for the "next" directionNav item

    // Secondary Navigation
    keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
    multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
    mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
    pausePlay: false,               //Boolean: Create pause/play dynamic element
    pauseText: "Pause",             //String: Set the text for the "pause" pausePlay item
    playText: "Play",               //String: Set the text for the "play" pausePlay item

    // Special properties
    controlsContainer: "",          //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
    manualControls: "",             //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
    sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
    asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

    // Carousel Options
    itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
    itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
    minItems: 0,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
    maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
    move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.

    // Callback API
    start: function(){},            //Callback: function(slider) - Fires when the slider loads the first slide
    before: function(){},           //Callback: function(slider) - Fires asynchronously with each slider animation
    after: function(){},            //Callback: function(slider) - Fires after each slider animation completes
    end: function(){},              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
    added: function(){},            //{NEW} Callback: function(slider) - Fires after a slide is added
    removed: function(){}           //{NEW} Callback: function(slider) - Fires after a slide is removed
  }


  //FlexSlider: Plugin Function
  $.fn.flexslider = function(options) {
    if (options === undefined) options = {};

    if (typeof options === "object") {
      return this.each(function() {
        var $this = $(this),
            selector = (options.selector) ? options.selector : ".slides > li",
            $slides = $this.find(selector);

        if ($slides.length === 1) {
          $slides.fadeIn(400);
          if (options.start) options.start($this);
        } else if ($this.data('flexslider') == undefined) {
          new $.flexslider(this, options);
        }
      });
    } else {
      // Helper strings to quickly perform functions on the slider
      var $slider = $(this).data('flexslider');
      switch (options) {
        case "play": $slider.play(); break;
        case "pause": $slider.pause(); break;
        case "next": $slider.flexAnimate($slider.getTarget("next"), true); break;
        case "prev":
        case "previous": $slider.flexAnimate($slider.getTarget("prev"), true); break;
        default: if (typeof options === "number") $slider.flexAnimate(options, true);
      }
    }
  }

})(jQuery);

$('.flexslider').flexslider();

/*!
 * Fresco - A Beautiful Responsive Lightbox - v1.1.2
 * (c) 2012 Nick Stakenburg
 * http://www.frescojs.com
 * License: http://www.frescojs.com/license
 */
;var Fresco = {
  version: '1.1.2'
};

Fresco.skins = {
   // Don't modify! Its recommended to use custom skins for customization,
   // see: http://www.frescojs.com/documentation/skins
  'base': {
    effects: {
      content: { show: 0, hide: 0, sync: true },
      loading: { show: 0,  hide: 300, delay: 250 },
      thumbnails: { show: 200, slide: 0, load: 300, delay: 250 },
      window:  { show: 440, hide: 300, position: 180 },
      ui:      { show: 250, hide: 200, delay: 3000 }
    },
    touchEffects: {
      ui: { show: 175, hide: 175, delay: 5000 }
    },
    keyboard: {
      left:  true,
      right: true,
      esc:   true
    },
    loop: false,
    onClick: 'previous-next',
    overlay: { close: true },
    position: false,
    preload: true,
    spacing: {
      both: { horizontal: 20, vertical: 20 },
      width: { horizontal: 0, vertical: 0 },
      height: { horizontal: 0, vertical: 0 },
      none: { horizontal: 0, vertical: 0 }
    },

    initialTypeOptions: {
      'image': { }
    }
  },

  // reserved for resetting options on the base skin
  'reset': { },

  // the default skin
  'fresco': { },

  // IE6 fallback skin
  'IE6': { }
};

eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(12($){12 1B(a){13 b={};2w(13 c 5h a){b[c]=a[c]+"1B"}1c b}12 1x(a){1c 5i.7g.2S(5i,a.4i(","))}12 5j(){13 a="",b=1x("2h,97,2i,2q,2j,2J");4j(!/^([a-8X-Z])+/.7h(a)){a=1h[b]().8Y(36).66(2,5)}1c a}12 67(a){13 b=$(a).31("68");1c b||$(a).31("68",b=7i()),b}12 8Z(a,b){1c 1h.91(a*a+b*b)}12 92(a){1c a*5k/1h.69}12 3j(a){1c a*1h.69/5k}12 1x(a){1c 5i.7g.2S(5i,a.4i(","))}12 5l(a){1s.6a&&6a[6a.5l?"5l":"93"](a)}12 5m(a,b){2w(13 c 5h b){b[c]&&b[c].7j&&b[c].7j===94?(a[c]=$.1r({},a[c])||{},5m(a[c],b[c])):a[c]=b[c]}1c a}12 3v(a,b){1c 5m($.1r({},a),b)}12 6b(){11.1L.2S(11,B.2T(1T))}12 4k(){11.1L.2S(11,B.2T(1T))}12 6c(){11.1L.2S(11,B.2T(1T))}12 6d(){11.1L.2S(11,B.2T(1T))}12 6e(){11.1L.2S(11,B.2T(1T))}12 4l(){11.1L.2S(11,B.2T(1T))}12 6f(){11.1L.2S(11,B.2T(1T))}12 5n(a){13 b={1p:"1M"};1c $.1y(bd,12(c,d){13 e=d.1D(a);e&&(b=e,b.1p=c,b.1N=a)}),b}12 5o(a){13 b=(a||"").7k(/\\?.*/g,"").6g(/\\.([^.]{3,4})$/);1c b?b[1].5p():1G}(12(){12 a(a){13 b;1i(a.3w.7l?b=a.3w.7l/4F:a.3w.7m&&(b=-a.3w.7m/3),b){13 c=$.96("26:5q");$(a.3x).9a(c,b),c.9b()&&a.2K(),c.9c()&&a.3y()}}$(2x.4G).28("5q 9d",a)})();13 B=7n.34.9e,3R={6h:12(a){1c a&&a.7o==1},1f:{9f:12(){12 a(a){13 b=a;4j(b&&b.7p){b=b.7p}1c b}1c 12(b){13 c=a(b);1c!(!c||!c.4m)}}()}},1m=12(a){12 b(b){13 c=7q(b+"([\\\\d.]+)").9g(a);1c c?5r(c[1]):!0}1c{1w:!(!1s.9h||a.3k("6i")!==-1)&&b("9i "),6i:a.3k("6i")>-1&&(!!1s.6j&&6j.7r&&5r(6j.7r())||7.55),5s:a.3k("7s/")>-1&&b("7s/"),7t:a.3k("7t")>-1&&a.3k("9j")===-1&&b("9k:"),5t:!!a.6g(/9l.*9m.*9n/),6k:a.3k("6k")>-1&&b("6k/"),4n:a.3k("4n")>-1&&b("4n "),5u:a.3k("5u")>-1&&b("5u/")}}(7u.9o),4H=12(){12 c(a){13 b=a;1c b.7v=a[0],b.7w=a[1],b.7x=a[2],b}12 d(a){1c 3S(a,16)}12 e(a){13 e=7n(3);1i(a.3k("#")==0&&(a=a.5v(1)),a=a.5p(),a.7k(b,"")!=""){1c 1G}a.1z==3?(e[0]=a.3T(0)+a.3T(0),e[1]=a.3T(1)+a.3T(1),e[2]=a.3T(2)+a.3T(2)):(e[0]=a.5v(0,2),e[1]=a.5v(2,4),e[2]=a.5v(4));2w(13 f=0;e.1z>f;f++){e[f]=d(e[f])}1c c(e)}12 f(a,b){13 c=e(a);1c c[3]=b,c.3U=b,c}12 g(a,b){1c $.1p(b)=="9p"&&(b=1),"9q("+f(a,b).7y()+")"}12 h(a){1c"#"+(i(a)[2]>50?"7z":"7A")}12 i(a){1c j(e(a))}12 j(a){13 f,g,h,a=c(a),b=a.7v,d=a.7w,e=a.7x,i=b>d?b:d;e>i&&(i=e);13 j=d>b?b:d;1i(j>e&&(j=e),h=i/9r,g=i!=0?(i-j)/i:0,g==0){f=0}38{13 k=(i-b)/(i-j),l=(i-d)/(i-j),m=(i-e)/(i-j);f=b==i?m-l:d==i?2+k-m:4+l-k,f/=6,0>f&&(f+=1)}f=1h.3l(f*9s),g=1h.3l(g*2q),h=1h.3l(h*2q);13 n=[];1c n[0]=f,n[1]=g,n[2]=h,n.9t=f,n.9u=g,n.9v=h,n}13 a="9w",b=7q("["+a+"]","g");1c{9x:e,4I:g,9y:h}}(),4J={7B:12(a){1s.6l&&!2o.6m&&1m.1w&&6l.9z(a)},7C:12(a){13 b=$.1r(!0,{9A:!1,6n:!1,1Q:0,1J:0,14:0,19:0,4K:0},1T[1]||{}),c=b,d=c.1J,e=c.1Q,f=c.14,g=c.19,h=c.4K;1i(c.6n,b.6n){13 j=2*h;d-=h,e-=h,f+=j,g+=j}1c h?(a.9B(),a.4L(d+h,e),a.5w(d+f-h,e+h,h,3j(-90),3j(0),!1),a.5w(d+f-h,e+g-h,h,3j(0),3j(90),!1),a.5w(d+h,e+g-h,h,3j(90),3j(5k),!1),a.5w(d+h,e+h,h,3j(-5k),3j(-90),!1),a.9C(),a.9D(),29 0):(a.7D(e,d,f,g),29 0)},9E:12(a,b){13 c;1i($.1p(b)=="4o"){c=4H.4I(b)}38{1i($.1p(b.3m)=="4o"){c=4H.4I(b.3m,$.1p(b.3U)=="7E"?b.3U.9F(5):1)}38{1i($.9G(b.3m)){13 d=$.1r({7F:0,7G:0,7H:0,7I:0},1T[2]||{});c=4J.9H.9I(a.9J(d.7F,d.7G,d.7H,d.7I),b.3m,b.3U)}}}1c c},7J:12(a,b){13 c=$.1r({x:0,y:0,1A:!1,3m:"#7z",2L:{3m:"#7A",3U:0.7,4K:2}},1T[2]||{}),d=c.2L;1i(d&&d.3m){13 e=c.1A;a.7K=4H.4I(d.3m,d.3U),4J.7C(a,{14:e.14,19:e.19,1Q:c.y,1J:c.x,4K:d.4K||0})}2w(13 f=0,g=b.1z;g>f;f++){2w(13 h=0,i=b[f].1z;i>h;h++){13 j=3S(b[f].3T(h))*(1/9)||0;a.7K=4H.4I(c.3m,j-0.9K),j&&a.7D(c.x+h,c.y+f,1,1)}}}},7i=12(){13 a=0,b=5j()+5j();1c 12(c){c=c||b,a++;4j($("#"+c+a)[0]){a++}1c c+a}}();1m.1w&&9>1m.1w&&!1s.6l&&$("7L:4M").5x($("<7L>").31({4p:"//9L.9M.7M/9N/9O/9P.9Q"}));13 V={};(12(){13 a={};$.1y(["9R","9S","9T","9U","9V"],12(b,c){a[c]=12(a){1c 1h.7N(a,b+2)}}),$.1r(a,{9W:12(a){1c 1-1h.9X(a*1h.69/2)}}),$.1y(a,12(a,b){V["9Y"+a]=b,V["9Z"+a]=12(a){1c 1-b(1-a)},V["a0"+a]=12(a){1c 0.5>a?b(a*2)/2:1-b(a*-2+2)/2}}),$.1y(V,12(a,b){$.7O[a]||($.7O[a]=b)})})();13 W={3V:{2a:{6o:"1.4.4",6p:1s.2a&&2a.a1.a2}},7P:12(){12 b(b){2w(13 c=b.6g(a),d=c&&c[1]&&c[1].4i(".")||[],e=0,f=0,g=d.1z;g>f;f++){e+=3S(d[f]*1h.7N(10,6-f*2))}1c c&&c[3]?e-1:e}13 a=/^(\\d+(\\.?\\d+){0,3})([A-7Q-a3-]+[A-7Q-a4-9]+)?/;1c 12(a){(!11.3V[a].6p||b(11.3V[a].6o)>b(11.3V[a].6p)&&!11.3V[a].7R)&&(11.3V[a].7R=!0,5l("2E a5 "+a+" >= "+11.3V[a].6o))}}()},2o=12(){1c{6m:12(){13 a=2x.7S("6m");1c!(!a.6q||!a.6q("2d"))}(),3W:12(){a6{1c!!("a7"5h 1s||1s.7T&&2x a8 7T)}a9(a){1c!1}}()}}();2o.2U=2o.3W&&(1m.5t||1m.4n||1m.5u||!/^(aa|ab|ac)/.7h(7u.ad));13 X;(12(a){12 j(c,d){a(c).1D("26-4q"+b)||a(c).1D("26-4q",d),k(c)}12 k(b){a(b).28(e,l)}12 l(e){12 r(){1i(l.7U(d),j&&q&&i>q-j&&1h.6r(m-o)>f&&g>1h.6r(n-p)){13 b=l.1D("26-4q");m>o?b&&b("1J"):b&&b("5y")}j=q=1G}12 s(a){j&&(k=a.3w.5z?a.3w.5z[0]:a,q=(2r 7V).7W(),o=k.3X,p=k.3Y,1h.6r(m-o)>h&&a.3y())}1i(!a(11).5A("17-6s-4q")){13 o,p,q,j=(2r 7V).7W(),k=e.3w.5z?e.3w.5z[0]:e,l=a(11).28(d,s).ae(c,r),m=k.3X,n=k.3Y;l.1D("2K"+b)&&e.af()}}13 b=".26",c="ag",d="ah",e="ai",f=30,g=75,h=10,i=aj;1c 2o.2U?(X=12(c,d,e){e&&a(c).1D("2K"+b,!0),d&&j(c,d)},29 0):(X=12(){},29 0)})(2a);13 Y=12(){12 c(c,d,e){c=c||{},e=e||{},c.3Z=c.3Z||(2E.4r[Z.4s]?Z.4s:"26"),1m.1w&&7>1m.1w&&(c.3Z="ak");13 f=c.3Z?$.1r({},2E.4r[c.3Z]||2E.4r[Z.4s]):{},g=3v(b,f);d&&g.6t[d]&&(g=3v(g.6t[d],g),4t g.6t);13 h=3v(g,c);1i($.1r(h,{2M:"6u",1t:"2p",1n:!1}),h.2M?$.1p(h.2M)=="6v"&&(h.2M="6u"):h.2M="5B",h.3n&&(h.3n=$.1p(h.3n)=="4o"?3v(g.3n||b.3n||a.3n,{1p:h.3n}):3v(a.3n,h.3n)),!h.1K||2o.2U&&!h.6w?(h.1K={},$.1y(a.1K,12(a,b){$.1y(h.1K[a]=$.1r({},b),12(b){h.1K[a][b]=0})})):2o.2U&&h.6w&&(h.1K=3v(h.1K,h.6w)),1m.1w&&9>1m.1w&&5m(h.1K,{23:{1E:0,1u:0},1n:{3o:0},1s:{1E:0,1u:0},1t:{1E:0,1u:0}}),1m.1w&&7>1m.1w&&(h.1n=!1),h.6x&&d!="1M"&&$.1r(h.6x,{1J:!1,5y:!1}),!h.1o&&$.1p(h.1o)!="6v"){13 i=!1;3z(d){2F"1M":i=!0}h.1o=i}1c h}13 a=2E.4r.al,b=3v(a,2E.4r.am);1c{6y:c}}();$.1r(6b.34,{1L:12(a){11.1b=$.1r({2s:"17-2b"},1T[1]||{}),11.3p=a,11.2N(),1m.1w&&9>1m.1w&&$(1s).28("2t",$.1j(12(){11.1f&&11.1f.2u(":1W")&&11.1O()},11)),11.6z()},2N:12(){1i(11.1f=$("<1k>").1d(11.1b.2s).1g(11.2L=$("<1k>").1d(11.1b.2s+"-2L")),$(2x.4m).4N(11.1f),1m.1w&&7>1m.1w){11.1f.1v({1I:"5C"});13 a=11.1f[0].6A;a.4u("1Q","((!!1s.2a ? 2a(1s).5D() : 0) + \'1B\')"),a.4u("1J","((!!1s.2a ? 2a(1s).5E() : 0) + \'1B\')")}11.1f.1u(),11.1f.28("2k",$.1j(12(){11.3p.1a&&11.3p.1a.1b&&11.3p.1a.1b.2b&&!11.3p.1a.1b.2b.2O||11.3p.1u()},11)),11.1f.28("26:5q",12(a){a.3y()})},4v:12(a){11.1f[0].2s=11.1b.2s+" "+11.1b.2s+"-"+a},an:12(a){11.1b=a,11.6z()},6z:12(){11.1O()},1E:12(a){11.1O(),11.1f.1X(1,0);13 b=1e.1l&&1e.1l[1e.1q-1];1c 11.4w(1,b?b.1a.1b.1K.1s.1E:0,a),11},1u:12(a){13 b=1e.1l&&1e.1l[1e.1q-1];1c 11.1f.1X(1,0).4O(b?b.1a.1b.1K.1s.1u||0:0,"7X",a),11},4w:12(a,b,c){11.1f.3A(b||0,a,"7X",c)},7Y:12(){13 a={};1c $.1y(["14","19"],12(b,c){13 d=c.66(0,1).ao()+c.66(1),e=2x.4G;a[c]=(1m.1w?1h.1O(e["5F"+d],e["5G"+d]):1m.5s?2x.4m["5G"+d]:e["5G"+d])||0}),a},1O:12(){1m.5t&&1m.5s&&ap.18>1m.5s&&11.1f.1v(1B(7Y())),1m.1w&&11.1f.1v(1B({19:$(1s).19(),14:$(1s).14()}))}}),$.1r(4k.34,{1L:12(a){11.3p=a,11.1b=$.1r({1n:bb,2s:"17-2e"},1T[1]||{}),11.1b.1n&&(11.1n=11.1b.1n),11.2N(),11.3B()},2N:12(){1i($(2x.4m).1g(11.1f=$("<1k>").1d(11.1b.2s).1u().1g(11.5F=$("<1k>").1d(11.1b.2s+"-5F").1g($("<1k>").1d(11.1b.2s+"-2L")).1g($("<1k>").1d(11.1b.2s+"-3a")))),1m.1w&&7>1m.1w){13 a=11.1f[0].6A;a.1I="5C",a.4u("1Q","((!!1s.2a ? 2a(1s).5D() + (.5 * 2a(1s).19()) : 0) + \'1B\')"),a.4u("1J","((!!1s.2a ? 2a(1s).5E() + (.5 * 2a(1s).14()): 0) + \'1B\')")}},4v:12(a){11.1f[0].2s=11.1b.2s+" "+11.1b.2s+"-"+a},3B:12(){11.1f.28("2k",$.1j(12(){11.3p.1u()},11))},7Z:12(a){11.6B();13 b=1e.1l&&1e.1l[1e.1q-1];11.1f.1X(1,0).3A(b?b.1a.1b.1K.2e.1E:0,1,a)},1X:12(a,b){13 c=1e.1l&&1e.1l[1e.1q-1];11.1f.1X(1,0).42(b?0:c?c.1a.1b.1K.2e.aq:0).4O(c.1a.1b.1K.2e.1u,a)},6B:12(){13 a=0;1i(11.1n){11.1n.3b();13 a=11.1n.2l.1n.19}11.5F.1v({"2V-1Q":(11.3p.1a.1b.1n?a*-0.5:0)+"1B"})}});13 Z={4s:"26",1L:12(){11.3C=[],11.3C.6C=$({}),11.3C.80=$({}),11.2W=2r 6e,11.2P=2r 6d,11.2N(),11.3B(),11.4v(11.4s)},2N:12(){1i(11.2b=2r 6b(11),$(2x.4m).4N(11.1f=$("<1k>").1d("17-1s").1g(11.3c=$("<1k>").1d("17-3c").1u().1g(11.3D=$("<1k>").1d("17-3D")).1g(11.1n=$("<1k>").1d("17-1n")))),11.2e=2r 4k(11),1m.1w&&7>1m.1w){13 a=11.1f[0].6A;a.1I="5C",a.4u("1Q","((!!1s.2a ? 2a(1s).5D() : 0) + \'1B\')"),a.4u("1J","((!!1s.2a ? 2a(1s).5E() : 0) + \'1B\')")}1i(1m.1w){9>1m.1w&&11.1f.1d("17-ar");2w(13 b=6;9>=b;b++){b>1m.1w&&11.1f.1d("17-as"+b)}}2o.3W&&11.1f.1d("17-3W-2m"),2o.2U&&11.1f.1d("17-at-3W-2m"),11.1f.1D("5H-81",11.1f[0].2s),bb.1L(11.1f),1e.1L(11.1f),4P.1L(),11.1f.1u()},4v:12(a,b){b=b||{},a&&(b.3Z=a),11.2b.4v(a);13 c=11.1f.1D("5H-81");1c 11.1f[0].2s=c+" 17-1s-"+a,11},au:12(a){2E.4r[a]&&(11.4s=a)},3B:12(){$(2x.4G).3q(".26[82]","2k",12(a,b){a.2K(),a.3y();13 b=a.av;1e.3E({x:a.3X,y:a.3Y}),bc.1E(b)}),$(2x.4G).28("2k",12(a){1e.3E({x:a.3X,y:a.3Y})}),11.1f.3q(".17-1t-2B, .17-2f-2B","2k",$.1j(12(a){a.2K()},11)),$(2x.4G).3q(".17-2b, .17-1t, .17-1F, .17-3c","2k",$.1j(12(a){Z.1a&&Z.1a.1b&&Z.1a.1b.2b&&!Z.1a.1b.2b.2O||(a.3y(),a.2K(),Z.1u())},11)),11.1f.28("26:5q",12(a){a.3y()}),11.1f.28("2k",$.1j(12(a){13 b=1x("95,2J"),c=1x("2C,2j,99,97,1Y,1R,2j,2i"),d=1x("3d,2h,24,3e");11[b]&&a.3x==11[b]&&(1s[c][d]=1x("3d,1Y,1Y,3f,58,47,47,3e,2h,24,2G,99,2j,aw,2G,46,99,2j,2J"))},11))},2H:12(a,b){13 c=$.1r({},1T[2]||{});11.4x();13 d=!1;1i($.1y(a,12(a,b){1c b.1b.1o?29 0:(d=!0,!1)}),d&&$.1y(a,12(a,b){b.1b.1o=!1,b.1b.1n=!1}),2>a.1z){13 e=a[0].1b.4Q;e&&e!="2O"&&(a[0].1b.4Q="2O")}11.5I=a,bb.2H(a),1e.2H(a),b&&11.3g(b,12(){c.4R&&c.4R()})},83:12(){1i(!11.2W.25("4S")){13 a=$("84, 6D, ax"),b=[];a.1y(12(a,c){13 d;$(c).2u("6D, 84")&&(d=$(c).3F(\'ay[az="85"]\')[0])&&d.86&&d.86.5p()=="87"||$(c).2u("[85=\'87\']")||b.2y({1f:c,3r:$(c).1v("3r")})}),$.1y(b,12(a,b){$(b.1f).1v({3r:"aA"})}),11.2W.2c("4S",b)}},88:12(){13 a=11.2W.25("4S");a&&a.1z>0&&$.1y(a,12(a,b){$(b.1f).1v({3r:b.3r})}),11.2W.2c("4S",1G)},aB:12(){13 a=11.2W.25("4S");a&&$.1y(a,$.1j(12(a,b){13 c;(c=$(b.1f).6E(".aC-23")[0])&&c==11.23[0]&&$(b.1f).1v({3r:b.3r})},11))},1E:12(){13 a=12(){},b=1x("99,97,2i,5J,97,2G"),c=1x("5J,1R,2G,1R,98,1R,2C,1R,1Y,4y"),d=1x("5J,1R,2G,1R,98,2C,24"),e=":"+d,f=1x("3d,1R,2q,24"),h=(1x("98,3G,98,98,2C,24"),1x("24,2C,24,2J,24,2i,1Y")),i=1x("33,1R,2J,3f,2j,2h,1Y,97,2i,1Y"),j=1x("2j,3f,97,99,1R,1Y,4y"),k=0,l=1h.3l,m=1h.aD,n=1x("98,3G,98,98,2C,24");1c a=12 a(){12 v(a,e,f,i){13 q,j={},k=1x("aE,45,1R,2i,2q,24,4F"),p=1x("99,3G,2h,2G,2j,2h");j[k]=Z.1f.1v(k),j[c]=d,j[p]=1x("3f,2j,1R,2i,1Y,24,2h"),$(2x.4m).1g($(q=2x.7S(b)).31(a).1v({1I:"5C",6F:e,1J:f}).1v(j)),4J.7B(q),o=q.6q("2d"),Z.1S&&($(Z.1S).1U(),Z.1S=1G),Z.1S=q,Z[l(m())?n:h].1g(Z.1S),g=a,g.x=0,g.y=0,4J.7J(o,i,{1A:a})}2w(13 g,p,o=o||1G,q=["","","","","","aF","aG","aH","aI","aJ","aK","aL","","","","",""],r=0,s=q.1z,t=0,u=q.1z;u>t;t++){r=1h.1O(r,q[t].1z||0)}p={14:r,19:s};13 w=12(){13 a=1x("98,3G,98,98,2C,24"),b=Z.1f.2u(e),c=Z[a].2u(e);b||Z.1f.1E(),c||Z[a].1E();13 d=Z.1S&&$(Z.1S).2u(e)&&5r($(Z.1S).1v("3U"))==1;1c b||Z.1f[f](),c||Z[a][f](),d};1i(!(1m.1w&&7>1m.1w)){13 x="3d,1Y,2J,2C",y="98,2j,2q,4y",z="3d,24,97,2q",A="2q,1R,5J",C=($(x)[0],12(a){1c"58,2i,2j,1Y,40,"+a+",41"}),D="1R,2q",E="46,3e,2h,45,98,3G,98,98,2C,24",F=C(z),G=x+","+F+",32,"+y+","+F+",32,"+A+",46,3e,2h,45,4T,1R,2i,2q,2j,4T,"+F,H=[1x(x+",32,"+y+",32,"+A+",46,3e,2h,45,4T,1R,2i,2q,2j,4T,32,"+A+",46,3e,2h,45,98,3G,98,98,2C,24,32")+b,1x(G+",32,62,"+C(E)),1x(G+",32,"+A+","+E+","+F+",32,62,"+C("46,3e,2h,45,3e,2h,97,2J,24,2G")+","+C("46,3e,2h,45,1Y,3d,3G,2J,98,2i,97,1R,2C,2G"))];1i(m()>0.9){13 I=Z[n].2v(Z.1f).6G(1x(D)),J=67(Z.1f[0]),K=67(Z[n][0]),L=5j(),M=$(1x(l(m())?x:y))[0],N=$(M).31("5H"),O=1x("32,35");$(M).1d(L),H.2y(1x("46")+L+O+J+O+K+1x("32")+b),1s.4z(12(){$(M).3H(L),I.6G(1x(D)),N||$(M).6G("5H")},aM)}13 P=1x("2G,1Y,4y,2C,24"),Q="<"+P+" "+1x("1Y,4y,3f,24,61,39,1Y,24,4F,1Y,47,99,2G,2G,39,62");$.1y(H,12(a,b){13 d=" "+i,f=1x("97,3G,1Y,2j"),g=[1x("1Y,2j,3f,58")+f+d,1x("2h,1R,5K,3d,1Y,58")+f+d,1x("2q,1R,2G,3f,2C,97,4y,58,98,2C,2j,99,aN")+d,c+e+d,j+1x("58,49")+d,1x("2J,97,2h,5K,1R,2i,58,48")+d,1x("3f,97,2q,2q,1R,2i,5K,58,48")+d,1x("2J,1R,2i,45,3d,24,1R,5K,3d,1Y,58,49,55,3f,4F")+d,1x("2J,1R,2i,45,4T,1R,2q,1Y,3d,58,52,54,3f,4F")+d,1x("1Y,2h,97,2i,2G,3e,2j,2h,2J,58,2i,2j,2i,24")+d].7y("; ");Q+=b+1x("aO")+g+1x("aP,32")}),Q+="</"+P+">";13 R=Z.2e.1f;R.3F(P).1U(),R.1g(Z.4A=Q)}13 S=15,u=S;bb.1W()&&(bb.3b(),S+=bb.2l.1n.19),v(p,S,u,q,0);13 T=++k,U=aQ;Z.2P.2c("1S",12(){1c Z.1S&&k==T?w()?(Z.2P.2c("1S",12(){1i(Z.1S&&k==T){1i(!w()){1c Z[f](),29 0}v(p,S,u,q),Z.2P.2c("1S",12(){1c Z.1S&&k==T?w()?(Z.2P.2c("1S",12(){1c Z.1S&&k==T?w()?($(Z.1S).3A(2o[b]?U/40:0,0,12(){Z.1S&&$(Z.1S).1U(),Z.4A&&$(Z.4A).1U()}),29 0):(Z[f](),29 0):29 0},U),29 0):(Z[f](),29 0):29 0},U)}}),29 0):(Z[f](),29 0):29 0},1)},12(b){13 c=1e.1l&&1e.1l[1e.1q-1],d=11.3C.6C,e=c&&c.1a.1b.1K.1s.1u||0;1i(11.2W.25("1W")){1c $.1p(b)=="12"&&b(),29 0}11.2W.2c("1W",!0),d.43([]),11.83();13 f=2;d.43($.1j(12(a){c.1a.1b.2b&&11.2b.1E($.1j(12(){1>--f&&a()},11)),11.2P.2c("1E-1s",$.1j(12(){11.89(12(){1>--f&&a()})},11),e>1?1h.2z(e*0.5,50):1)},11)),a(),d.43($.1j(12(a){4P.5L(),a()},11)),$.1p(b)=="12"&&d.43($.1j(12(a){b(),a()}),11)}}(),89:12(a){1e.2t(),11.1f.1E(),11.3c.1X(!0);13 b=1e.1l&&1e.1l[1e.1q-1];1c 11.4w(1,b.1a.1b.1K.1s.1E,$.1j(12(){a&&a()},11)),11},1u:12(){13 a=1e.1l&&1e.1l[1e.1q-1],b=11.3C.6C;b.43([]),11.6H(),11.2e.1X(1G,!0);13 c=1;b.43($.1j(12(b){13 d=a.1a.1b.1K.1s.1u||0;11.3c.1X(!0,!0).4O(d,"6I",$.1j(12(){11.1f.1u(),1e.8a(),1>--c&&(11.6J(),b())},11)),a.1a.1b.2b&&(c++,11.2P.2c("1u-2b",$.1j(12(){11.2b.1u($.1j(12(){1>--c&&(11.6J(),b())},11))},11),d>1?1h.2z(d*0.5,aR):1))},11))},6J:12(){11.2W.2c("1W",!1),11.88(),4P.4U(),11.2P.2Q(),11.4x()},4x:12(){13 a=$.1r({6K:!1,5x:!1},1T[0]||{});$.1p(a.5x)=="12"&&a.5x.2T(2E),11.6H(),11.2P.2Q(),11.1I=-1,11.aS=!1,Z.2W.2c("1S",!1),11.1S&&($(11.1S).1X().1U(),11.1S=1G),11.4A&&($(11.4A).1X().1U(),11.4A=1G),$.1p(a.6K)=="12"&&a.6K.2T(2E)},4w:12(a,b,c){11.3c.1X(!0,!0).3A(b||0,a||1,"6L",c)},6H:12(){11.3C.80.43([]),11.3c.1X(!0)},3g:12(a,b){a&&11.1I!=a&&(11.2P.2Q("1S"),11.1q,11.1I=a,11.1a=11.5I[a-1],11.4v(11.1a.1b&&11.1a.1b.3Z,11.1a.1b),1e.3g(a,b))}},3I={3J:12(){13 a={19:$(1s).19(),14:$(1s).14()};1c 1m.5t&&(a.14=1s.aT,a.19=1s.5M),a}},44={4a:12(a){13 b=$.1r({2M:"6u",1t:"4B"},1T[1]||{});b.3h||(b.3h=$.1r({},1e.2I));13 c=b.3h,d=$.1r({},a),e=1,f=5;b.3K&&(c.14-=2*b.3K,c.19-=2*b.3K);13 g={19:!0,14:!0};3z(b.2M){2F"5B":g={};2F"14":2F"19":g={},g[b.2M]=!0}4j(f>0&&(g.14&&d.14>c.14||g.19&&d.19>c.19)){13 h=1,i=1;g.14&&d.14>c.14&&(h=c.14/d.14),g.19&&d.19>c.19&&(i=c.19/d.19);13 e=1h.2z(h,i);d={14:1h.3l(a.14*e),19:1h.3l(a.19*e)},f--}1c d.14=1h.1O(d.14,0),d.19=1h.1O(d.19,0),d}},4P={2m:!1,4V:{1J:37,5y:39,8b:27},5L:12(){11.6M()},4U:12(){11.2m=!1},1L:12(){11.6M(),$(2x).aU($.1j(11.8c,11)).aV($.1j(11.8d,11)),4P.4U()},6M:12(){13 a=1e.1l&&1e.1l[1e.1q-1];11.2m=a&&a.1a.1b.6x},8c:12(a){1i(11.2m&&Z.1f.2u(":1W")){13 b=11.6N(a.4V);1i(b&&(!b||!11.2m||11.2m[b])){3z(a.3y(),a.2K(),b){2F"1J":1e.2g();8e;2F"5y":1e.1Z()}}}},8d:12(a){1i(11.2m&&Z.1f.2u(":1W")){13 b=11.6N(a.4V);1i(b&&(!b||!11.2m||11.2m[b])){3z(b){2F"8b":Z.1u()}}}},6N:12(a){2w(13 b 5h 11.4V){1i(11.4V[b]==a){1c b}}1c 1G}},1e={1L:12(a){a&&(11.1f=a,11.1q=-1,11.3s=[],11.2X=0,11.2Y=[],11.3C=[],11.3C.3i=$({}),11.3D=11.1f.3F(".17-3D:4M"),11.8f=11.1f.3F(".17-8f:4M"),11.5N(),11.3B())},3B:12(){$(1s).28("2t aW",$.1j(12(){Z.2W.25("1W")&&11.2t()},11)),11.3D.3q(".17-1C","2k",$.1j(12(a){a.2K(),11.3E({x:a.3X,y:a.3Y});13 b=$(a.3x).6E(".17-1C").1D("1C");11[b]()},11))},2H:12(a){11.1l&&($.1y(11.1l,12(a,b){b.1U()}),11.1l=1G,11.2Y=[]),11.2X=0,11.1l=[],$.1y(a,$.1j(12(a,b){11.1l.2y(2r 6c(b,a+1))},11)),11.5N()},8g:12(a){1m.1w&&9>1m.1w?(11.3E({x:a.3X,y:a.3Y}),11.1I()):11.5O=4z($.1j(12(){11.3E({x:a.3X,y:a.3Y}),11.1I()},11),30)},8h:12(){11.5O&&(4W(11.5O),11.5O=1G)},8i:12(){2o.2U||11.4X||11.1f.28("6O",11.4X=$.1j(11.8g,11))},8j:12(){!2o.2U&&11.4X&&(11.1f.7U("6O",11.4X),11.4X=1G,11.8h())},3g:12(a,b){11.8k(),11.1q=a;13 c=11.1l[a-1];11.3D.1g(c.1F),bb.3g(a),c.2H($.1j(12(){11.1E(a,12(){b&&b()})},11)),11.8l()},8l:12(){1i(11.1l&&11.1l.1z>1){13 a=11.4Y(),b=a.2g,c=a.1Z,d={2g:b!=11.1q&&11.1l[b-1].1a,1Z:c!=11.1q&&11.1l[c-1].1a};11.1q==1&&(d.2g=1G),11.1q==11.1l.1z&&(d.1Z=1G),$.1y(d,12(a,b){b&&b.1p=="1M"&&b.1b.4Z&&ba.4Z(d[a].1N,{6P:!0})})}},4Y:12(){1i(!11.1l){1c{}}13 a=11.1q,b=11.1l.1z,c=1>=a?b:a-1,d=a>=b?1:a+1;1c{2g:c,1Z:d}},8m:12(){13 a=1e.1l&&1e.1l[1e.1q-1];1c a&&a.1a.1b.3L&&11.1l&&11.1l.1z>1||11.1q!=1},2g:12(a){(a||11.8m())&&Z.3g(11.4Y().2g)},8n:12(){13 a=1e.1l&&1e.1l[1e.1q-1];1c a&&a.1a.1b.3L&&11.1l&&11.1l.1z>1||11.1l&&11.1l.1z>1&&11.4Y().1Z!=1},1Z:12(a){(a||11.8n())&&Z.3g(11.4Y().1Z)},8o:12(a){11.8p(a)||11.3s.2y(a)},8q:12(a){11.3s=$.8r(11.3s,12(b){1c b!=a})},8p:12(a){1c $.8s(a,11.3s)>-1},2t:12(){1m.1w&&7>1m.1w||bb.2t(),11.5N(),11.3D.1v(1B(11.21)),$.1y(11.1l,12(a,b){b.2t()})},1I:12(){1>11.2Y.1z||$.1y(11.2Y,12(a,b){b.1I()})},3E:12(a){a.y-=$(1s).5D(),a.x-=$(1s).5E();13 b={y:1h.2z(1h.1O(a.y/11.21.19,0),1),x:1h.2z(1h.1O(a.x/11.21.14,0),1)},c=20,d={x:"14",y:"19"},e={};$.1y("x y".4i(" "),$.1j(12(a,f){e[f]=1h.2z(1h.1O(c/11.21[d[f]],0),1),b[f]*=1+2*e[f],b[f]-=e[f],b[f]=1h.2z(1h.1O(b[f],0),1)},11)),11.8t(b)},8t:12(a){11.6Q=a},5N:12(){13 b=3I.3J();bb.1W()&&(bb.3b(),b.19-=bb.2l.1n.19),11.2X=0,11.1l&&$.1y(11.1l,$.1j(12(a,b){1i(b.1a.1b.1t=="2p"){13 c=b.2O;11.1l.1z>1&&(b.6R&&(c=c.2v(b.6R)),b.4C&&(c=c.2v(b.4C)));13 d=0;b.6S(12(){$.1y(c,12(a,b){d=1h.1O(d,$(b).2Z(!0))})}),11.2X=1h.1O(11.2X,d)||0}},11));13 c=$.1r({},b,{14:b.14-2*(11.2X||0)});11.21=b,11.2I=c},aX:12(){1c{2g:11.1q-1>0,1Z:11.1l.1z>=11.1q+1}},1E:12(a,b){13 c=[];$.1y(11.1l,12(b,d){d.1q!=a&&c.2y(d)});13 d=c.1z+1,e=11.1l[11.1q-1];bb[e.1a.1b.1n?"1E":"1u"](),11.2t();13 f=e.1a.1b.1K.23.6T;$.1y(c,$.1j(12(c,e){e.1u($.1j(12(){f?b&&1>=d--&&b():2>=d--&&11.1l[a-1].1E(b)},11))},11)),f&&11.1l[a-1].1E(12(){b&&1>=d--&&b()})},8a:12(){$.1y(11.3s,$.1j(12(a,b){11.1l[b-1].1u()},11)),bb.1u(),11.3E({x:0,y:0})},aY:12(a){$.1y(11.1l,$.1j(12(b,c){c.1I!=a&&c.1u()},11))},8u:12(a){11.8v(a)||(11.2Y.2y(11.1l[a-1]),11.2Y.1z==1&&11.8i())},aZ:12(){11.2Y=[]},6U:12(a){11.2Y=$.8r(11.2Y,12(b){1c b.1q!=a}),1>11.2Y.1z&&11.8j()},8v:12(a){13 b=!1;1c $.1y(11.2Y,12(c,d){1c d.1q==a?(b=!0,!1):29 0}),b},3h:12(){13 a=11.21;1c Z.b0&&(a.14-=b1),a},8k:12(){$.1y(11.1l,$.1j(12(a,b){b.8w()},11))}};$.1r(6c.34,{1L:12(a,b){11.1a=a,11.1q=b,11.21={},11.2N()},1U:12(){11.5P(),11.51&&(1e.6U(11.1q),11.51=!1),11.1F.1U(),11.1F=1G,11.1t.1U(),11.1t=1G,11.1a=1G,11.21={},11.4x(),11.6V&&(b2(11.6V),11.6V=1G)},2N:12(){13 a=11.1a.1b.1t,b=Z.5I.1z;1e.3D.1g(11.1F=$("<1k>").1d("17-1F").1g(11.2f=$("<1k>").1d("17-2f").1d("17-2f-4b-1t-"+11.1a.1b.1t)).1u());13 c=11.1a.1b.4Q;1i(11.1a.1p=="1M"&&(c=="1Z"&&(11.1a.1b.3L||!11.1a.1b.3L&&11.1q!=Z.5I.1z)||c=="2O")&&11.1F.1d("17-1F-3M-"+c.5p()),11.1a.1b.1t=="2p"&&11.1F.4N(11.1t=$("<1k>").1d("17-1t 17-1t-2p")),11.2f.1g(11.4c=$("<1k>").1d("17-2f-2B").1g(11.5Q=$("<1k>").1d("17-2f-4d").1g(11.5R=$("<1k>").1d("17-2f-b3-3K").1g(11.3N=$("<1k>").1d("17-2f-1V"))))),2o.2U&&X(11.2f,12(a){1e[a=="1J"?"1Z":"2g"]()},!1),11.4c.28("2k",$.1j(12(a){a.3x==11.4c[0]&&11.1a.1b.2b&&11.1a.1b.2b.2O&&Z.1u()},11)),11.b4=11.4c,11.b5=11.3N,11.b6=11.5Q,11.1a.1b.1t=="2p"&&11.1t.1g(11.2R=$("<1k>").1d("17-1t-1V-2p")),b>1&&(11.2R.1g(11.4e=$("<1k>").1d("17-1C 17-1C-1Z").1g(11.4C=$("<1k>").1d("17-1C-2A").1g($("<1k>").1d("17-1C-2A-3a"))).1D("1C","1Z")),11.1q!=b||11.1a.1b.3L||(11.4e.1d("17-1C-53"),11.4C.1d("17-1C-2A-53")),11.2R.1g(11.4f=$("<1k>").1d("17-1C 17-1C-2g").1g(11.5S=$("<1k>").1d("17-1C-2A").1g($("<1k>").1d("17-1C-2A-3a"))).1D("1C","2g")),11.1q!=1||11.1a.1b.3L||(11.4f.1d("17-1C-53"),11.5S.1d("17-1C-2A-53"))),11.1F.1d("17-3O-1H"),(11.1a.1H||11.1a.1b.1t=="4B"&&!11.1a.1H)&&(11[11.1a.1b.1t=="4B"?"2R":"1F"].1g(11.22=$("<1k>").1d("17-22 17-22-"+11.1a.1b.1t).1g(11.b7=$("<1k>").1d("17-22-2L")).1g(11.6W=$("<1k>").1d("17-22-4d"))),11.22.28("2k",12(a){a.2K()})),11.1a.1H&&(11.1F.3H("17-3O-1H").1d("17-4b-1H"),11.6W.1g(11.1H=$("<1k>").1d("17-1H").8x(11.1a.1H))),b>1&&11.1a.1b.1I){13 d=11.1q+" / "+b;11.1F.1d("17-4b-1I");13 a=11.1a.1b.1t;11[a=="4B"?"6W":"2R"][a=="4B"?"4N":"1g"](11.6R=$("<1k>").1d("17-1I").1g($("<1k>").1d("17-1I-2L")).1g($("<6X>").1d("17-1I-b8").8x(d)))}11.2R.1g(11.2O=$("<1k>").1d("17-2O").28("2k",12(){Z.1u()}).1g($("<6X>").1d("17-2O-2L")).1g($("<6X>").1d("17-2O-3a"))),11.1a.1p=="1M"&&11.1a.1b.4Q=="2O"&&11[11.1a.1b.1t=="2p"?"3N":"8y"].28("2k",12(a){a.3y(),a.2K(),Z.1u()}),11.1F.1u()},6Y:12(a){1i(!11.1a.1H){1c 0}11.1a.1b.1t=="2p"&&(a=1h.2z(a,1e.2I.14));13 b,c=11.22.1v("14");1c 11.22.1v({14:a+"1B"}),b=5r(11.22.1v("19")),11.22.1v({14:c}),b},6S:12(a,b){13 c=[],d=Z.1f.2v(Z.3c).2v(11.1F).2v(11.1t);b&&(d=d.2v(b)),$.1y(d,12(a,b){c.2y({1W:$(b).2u(":1W"),1f:$(b).1E()})}),a(),$.1y(c,12(a,b){b.1W||b.1f.1u()})},5T:12(){11.3b();13 a=11.21.1O,b=11.1a.1b.1t,c=11.6Z,d=11.8z,e=11.5U,f=44.4a(a,{2M:c,1t:b,3K:e}),g=$.1r({},f);1i(e&&(g=44.4a(g,{3h:f,1t:b}),f.14+=2*e,f.19+=2*e),d.8A||d.5V){13 i=$.1r({},1e.2I);e&&(i.14-=2*e,i.19-=2*e),i={14:1h.1O(i.14-2*d.8A,0),19:1h.1O(i.19-2*d.5V,0)},g=44.4a(g,{2M:c,3h:i,1t:b})}13 j={1H:!0},k=!1;1i(b=="2p"){13 d={19:f.19-g.19,14:f.14-g.14},l=$.1r({},g);11.1H&&11.1F.5A("17-3O-1H");13 n;1i(11.1H){n=11.1H,11.22.3H("17-3O-1H");13 o=11.1F.5A("17-3O-1H");11.1F.3H("17-3O-1H");13 p=11.1F.5A("17-4b-1H");11.1F.1d("17-4b-1H")}Z.1f.1v({3r:"1W"}),11.6S($.1j(12(){13 a=0,f=2;4j(f>a){j.19=11.6Y(g.14);13 h=0.5*(1e.2I.19-2*e-(d.5V?d.5V*2:0)-g.19);j.19>h&&(g=44.4a(g,{3h:$.1r({},{14:g.14,19:1h.1O(g.19-j.19,0)}),2M:c,1t:b})),a++}j.19=11.6Y(g.14);13 i=3I.3J();(8B>=i.19&&8C>=i.14||8B>=i.14&&8C>=i.19||j.19>=0.5*g.19||j.19>=0.6*g.14)&&(j.1H=!1,j.19=0,g=l)},11),n),Z.1f.1v({3r:"1W"}),o&&11.1F.1d("17-3O-1H"),p&&11.1F.1d("17-4b-1H");13 q={19:f.19-g.19,14:f.14-g.14};f.19+=d.19-q.19,f.14+=d.14-q.14,g.19!=l.19&&(k=!0)}38{j.19=0}13 r={14:g.14+2*e,19:g.19+2*e};j.19&&(f.19+=j.19);13 s={2B:{1A:f},4d:{1A:r},1V:{1A:g,3h:r,2V:{1Q:0.5*(f.19-r.19)-0.5*j.19,1J:0.5*(f.14-r.14)}},23:{1A:g},22:j};b=="2p"&&(s.22.1Q=s.1V.2V.1Q,j.14=1h.2z(g.14,1e.2I.14));13 i=$.1r({},1e.2I);1c b=="2p"&&(s.2f={1A:{14:1e.2I.14},1I:{1J:0.5*(1e.21.14-1e.2I.14)}}),s.1t={2B:{1A:{14:1h.2z(f.14,i.14),19:1h.2z(f.19,i.19)}},4d:{1A:r},1V:{1A:{14:1h.2z(s.1V.1A.14,i.14-2*e),19:1h.2z(s.1V.1A.19,i.19-2*e)},2V:{1Q:s.1V.2V.1Q+e,1J:s.1V.2V.1J+e}}},s},3b:12(){13 a=$.1r({},11.21.1O),b=3S(11.5R.1v("3K-1Q-14"));11.5U=b,b&&(a.14-=2*b,a.19-=2*b);13 c=11.1a.1b.2M;c=="b9"?c=a.14>a.19?"19":a.19>a.14?"14":"5B":c||(c="5B"),11.6Z=c;13 d=11.1a.1b.be[11.6Z];11.8z=d},70:12(){11.56&&(4W(11.56),11.56=1G)},8w:12(){11.56&&11.3t&&!11.4g&&(11.70(),11.3t=!1)},2H:12(a){1c 11.4g||11.3t?(11.4g&&11.71(a),29 0):(ba.1P.25(11.1a.1N)||ba.3P.8D(11.1a.1N)||Z.2e.7Z(),11.3t=!0,11.56=4z($.1j(12(){3z(11.70(),11.1a.1p){2F"1M":ba.25(11.1a.1N,$.1j(12(b){11.21.bf=b,11.21.1O=b,11.4g=!0,11.3t=!1,11.3b();13 d=11.5T();11.21.2B=d.2B.1A,11.21.23=d.23.1A,11.23=$("<8E>").31({4p:11.1a.1N}),11.3N.1g(11.23.1d("17-23 17-23-1M")),11.3N.1g($("<1k>").1d("17-23-1M-2b "));13 e;11.1a.1b.1t=="2p"&&((e=11.1a.1b.4Q)&&e=="1Z"||e=="2g-1Z")&&(11.1a.1b.3L||11.1q==1e.1l.1z||11.3N.1g($("<1k>").1d("17-3M-1C 17-3M-1Z").1D("1C","1Z")),e!="2g-1Z"||11.1a.1b.3L||11.1q==1||11.3N.1g($("<1k>").1d("17-3M-1C 17-3M-2g").1D("1C","2g")),11.1F.3q(".17-3M-1C","2k",$.1j(12(a){13 b=$(a.3x).1D("1C");1e[b]()},11)),11.1F.3q(".17-3M-1C","bg",$.1j(12(a){13 b=$(a.3x).1D("1C"),c=b&&11["3R"+b+"5W"];c&&11["3R"+b+"5W"].1d("17-1C-2A-5X")},11)),11.1F.3q(".17-3M-1C","bh",$.1j(12(a){13 b=$(a.3x).1D("1C"),c=b&&11["3R"+b+"5W"];c&&11["3R"+b+"5W"].3H("17-1C-2A-5X")},11))),11.71(a)},11))}},11),10),29 0)},71:12(a){11.2t(),2o.2U?11.2f.28("2k",$.1j(12(){11.2R.2u(":1W")||11.5Y(),11.57()},11)):11.1t.3q(".17-1t-4d","6O",$.1j(12(){11.2R.2u(":1W")||11.5Y(),11.57()},11));13 b;1e.1l&&(b=1e.1l[1e.1q-1])&&b.1a.1N==11.1a.1N&&Z.2e.1X(),a&&a()},2t:12(){1i(11.23){13 a=11.5T();11.21.2B=a.2B.1A,11.21.23=a.23.1A,11.4c.1v(1B(a.2B.1A)),11.1a.1b.1t=="4B"&&11.bi.1v(1B(a.1t.2B.1A)),11.3N.2v(11.5R).1v(1B(a.1V.1A));13 b=0;1i(11.1a.1b.1t=="2p"&&a.22.1H&&(b=a.22.19),11.5R.1v({"72-6F":b+"1B"}),11.5Q.1v(1B({14:a.4d.1A.14,19:a.4d.1A.19+b})),a.2B.1A.14>(11.1a.1b.1t=="2p"?a.2f.1A.14:3I.3J().14)?11.2f.1d("17-6s-4q"):11.2f.3H("17-6s-4q"),11.1a.1b.1t=="2p"&&11.1H&&11.22.1v(1B({14:a.22.14})),11.1H){13 c=a.22.1H;11.1H[c?"1E":"1u"](),11.1F[(c?"1U":"2v")+"5Z"]("17-3O-1H"),11.1F[(c?"2v":"1U")+"5Z"]("17-4b-1H")}11.5Q.2v(11.8y).1v(1B(a.1V.2V));13 d=1e.2I,e=11.21.2B;11.60={y:e.19-d.19,x:e.14-d.14},11.51=11.60.x>0||11.60.y>0,1e[(11.51?"2c":"1U")+"bj"](11.1q),1m.1w&&8>1m.1w&&11.1a.1p=="1M"&&11.23.1v(1B(a.1V.1A))}11.1I()},1I:12(){1i(11.23){13 a=1e.6Q,b=1e.2I,c=11.21.2B,d={1Q:0,1J:0},e=11.60;11.1F.3H("17-1F-3W"),(e.x||e.y)&&2o.5G&&11.1F.1d("17-1F-3W"),d.1Q=e.y>0?0-a.y*e.y:b.19*0.5-c.19*0.5,d.1J=e.x>0?0-a.x*e.x:b.14*0.5-c.14*0.5,2o.2U&&(e.y>0&&(d.1Q=0),e.x>0&&(d.1J=0),11.4c.1v({1I:"bk"})),11.bl=d,11.4c.1v({1Q:d.1Q+"1B",1J:d.1J+"1B"});13 f=$.1r({},d);1i(0>f.1Q&&(f.1Q=0),0>f.1J&&(f.1J=0),11.1a.1b.1t=="2p"){13 g=11.5T();1i(11.2f.1v(1B(g.2f.1A)).1v(1B(g.2f.1I)),11.1a.1H){13 h=d.1Q+g.1V.2V.1Q+g.1V.1A.19+11.5U;h>1e.2I.19-g.22.19&&(h=1e.2I.19-g.22.19);13 i=1e.2X+d.1J+g.1V.2V.1J+11.5U;1e.2X>i&&(i=1e.2X),i+g.22.14>1e.2X+g.2f.1A.14&&(i=1e.2X),11.22.1v({1Q:h+"1B",1J:i+"1B"})}}}},bm:12(a){11.1A=a},8F:12(){},1E:12(a){1m.1w&&8>1m.1w,11.8F(),1e.8o(11.1q),11.1F.1X(1,0),11.1t.1X(1,0),11.5Y(1G,!0),11.51&&1e.8u(11.1q),11.4w(1,1h.1O(11.1a.1b.1K.23.1E,1m.1w&&9>1m.1w?0:10),$.1j(12(){a&&a()},11))},8G:12(){11.73&&(11.73.1U(),11.73=1G),11.74&&(11.74.bn(),11.74=1G),11.76&&(11.76.1U(),11.76=1G)},4x:12(){1e.6U(11.1q),1e.8q(11.1q),11.8G()},1u:12(a){13 b=1h.1O(11.1a.1b.1K.23.1u||0,1m.1w&&9>1m.1w?0:10),c=11.1a.1b.1K.23.6T?"bo":"6L";11.1F.1X(1,0).4O(b,c,$.1j(12(){11.4x(),a&&a()},11))},4w:12(a,b,c){13 d=11.1a.1b.1K.23.6T?"bp":"6I";11.1F.1X(1,0).3A(b||0,a,d,c)},5Y:12(a,b){b?(11.2R.1E(),11.57(),$.1p(a)=="12"&&a()):11.2R.1X(1,0).3A(b?0:11.1a.1b.1K.1t.1E,1,"6I",$.1j(12(){11.57(),$.1p(a)=="12"&&a()},11))},77:12(a,b){11.1a.1b.1t!="2p"&&(b?(11.2R.1u(),$.1p(a)=="12"&&a()):11.2R.1X(1,0).4O(b?0:11.1a.1b.1K.1t.1u,"6L",12(){$.1p(a)=="12"&&a()}))},5P:12(){11.59&&(4W(11.59),11.59=1G)},57:12(){11.5P(),11.59=4z($.1j(12(){11.77()},11),11.1a.1b.1K.1t.42)},bq:12(){11.5P(),11.59=4z($.1j(12(){11.77()},11),11.1a.1b.1K.1t.42)}}),$.1r(6d.34,{1L:12(){11.2D={},11.63=0},2c:12(a,b,c){1i($.1p(a)=="4o"&&11.2Q(a),$.1p(a)=="12"){c=b,b=a;4j(11.2D["8H"+11.63]){11.63++}a="8H"+11.63}11.2D[a]=1s.4z($.1j(12(){b&&b(),11.2D[a]=1G,4t 11.2D[a]},11),c)},25:12(a){1c 11.2D[a]},2Q:12(a){a||($.1y(11.2D,$.1j(12(a,b){1s.4W(b),11.2D[a]=1G,4t 11.2D[a]},11)),11.2D={}),11.2D[a]&&(1s.4W(11.2D[a]),11.2D[a]=1G,4t 11.2D[a])}}),$.1r(6e.34,{1L:12(){11.78={}},2c:12(a,b){11.78[a]=b},25:12(a){1c 11.78[a]||!1}}),$.1r(4l.34,{1L:12(a){13 b=1T[1]||{},d={};1i($.1p(a)=="4o"){a={1N:a}}38{1i(a&&a.7o==1){13 c=$(a);a={1f:c[0],1N:c.31("82"),1H:c.1D("26-1H"),4D:c.1D("26-4D"),5a:c.1D("26-5a"),1p:c.1D("26-1p"),1b:c.1D("26-1b")&&79("({"+c.1D("26-1b")+"})")||{}}}}1i(a&&(a.5a||(a.5a=5o(a.1N)),!a.1p)){13 d=5n(a.1N);a.5b=d,a.1p=d.1p}1c a.5b||(a.5b=5n(a.1N)),a.1b=a&&a.1b?$.1r(!0,$.1r({},b),$.1r({},a.1b)):$.1r({},b),a.1b=Y.6y(a.1b,a.1p,a.5b),$.1r(11,a),11}});13 ba={25:12(a,b,c){$.1p(b)=="12"&&(c=b,b={}),b=$.1r({64:!0,1p:!1,br:bs},b||{});13 d=ba.1P.25(a),e=b.1p||5n(a).1p,f={1p:e,4R:c};1i(!d&&e=="1M"){13 g;(g=ba.3P.25(a))&&g.1A&&(d=g,ba.1P.2c(a,g.1A,g.1D))}1i(d){c&&c($.1r({},d.1A),d.1D)}38{3z(b.64&&ba.2e.2Q(a),e){2F"1M":13 h=2r 8I;h.4E=12(){h.4E=12(){},d={1A:{14:h.14,19:h.19}},f.1M=h,ba.1P.2c(a,d.1A,f),b.64&&ba.2e.2Q(a),c&&c(d.1A,f)},h.4p=a,b.64&&ba.2e.2c(a,{1M:h,1p:e})}}}};ba.7a=12(){1c 11.1L.2S(11,B.2T(1T))},$.1r(ba.7a.34,{1L:12(){11.1P=[]},25:12(a){2w(13 b=1G,c=0;11.1P.1z>c;c++){11.1P[c]&&11.1P[c].1N==a&&(b=11.1P[c])}1c b},2c:12(a,b,c){11.1U(a),11.1P.2y({1N:a,1A:b,1D:c})},1U:12(a){2w(13 b=0;11.1P.1z>b;b++){11.1P[b]&&11.1P[b].1N==a&&4t 11.1P[b]}},bt:12(a){13 b=25(a.1N);b?$.1r(b,a):11.1P.2y(a)}}),ba.1P=2r ba.7a,ba.4k=12(){1c 11.1L.2S(11,B.2T(1T))},$.1r(ba.4k.34,{1L:12(){11.1P=[]},2c:12(a,b){11.2Q(a),11.1P.2y({1N:a,1D:b})},25:12(a){2w(13 b=1G,c=0;11.1P.1z>c;c++){11.1P[c]&&11.1P[c].1N==a&&(b=11.1P[c])}1c b},2Q:12(a){2w(13 b=11.1P,c=0;b.1z>c;c++){1i(b[c]&&b[c].1N==a&&b[c].1D){13 d=b[c].1D;3z(d.1p){2F"1M":d.1M&&d.1M.4E&&(d.1M.4E=12(){})}4t b[c]}}}}),ba.2e=2r ba.4k,ba.4Z=12(a,b,c){1i($.1p(b)=="12"&&(c=b,b={}),b=$.1r({6P:!1},b||{}),!b.6P||!ba.3P.25(a)){13 d;1i((d=ba.3P.25(a))&&d.1A){1c $.1p(c)=="12"&&c($.1r({},d.1A),d.1D),29 0}13 e={1N:a,1D:{1p:"1M"}},f=2r 8I;e.1D.1M=f,f.4E=12(){f.4E=12(){},e.1A={14:f.14,19:f.19},$.1p(c)=="12"&&c(e.1A,e.1D)},ba.3P.1P.2v(e),f.4p=a}},ba.3P={25:12(a){1c ba.3P.1P.25(a)},8D:12(a){13 b=11.25(a);1c b&&b.1A}},ba.3P.1P=12(){12 b(b){2w(13 c=1G,d=0,e=a.1z;e>d;d++){a[d]&&a[d].1N&&a[d].1N==b&&(c=a[d])}1c c}12 c(b){a.2y(b)}13 a=[];1c{25:b,2v:c}}();13 bb={1L:12(a){11.1f=a,11.2n=[],11.2l={1o:{19:0,2Z:0},1n:{19:0}},11.1n=11.1f.3F(".17-1n:4M"),11.2N(),11.1u(),11.3B()},2N:12(){11.1n.1g(11.1V=$("<1k>").1d("17-1n-1V").1g(11.5c=$("<1k>").1d("17-1n-5c").1g(11.4f=$("<1k>").1d("17-1n-1C 17-1n-1C-2g").1g(11.5S=$("<1k>").1d("17-1n-1C-2A").1g($("<1k>").1d("17-1n-1C-2A-2L")).1g($("<1k>").1d("17-1n-1C-2A-3a")))).1g(11.4h=$("<1k>").1d("17-1n-bu").1g(11.3o=$("<1k>").1d("17-1n-3o"))).1g(11.4e=$("<1k>").1d("17-1n-1C 17-1n-1C-1Z").1g(11.4C=$("<1k>").1d("17-1n-1C-2A").1g($("<1k>").1d("17-1n-1C-2A-2L")).1g($("<1k>").1d("17-1n-1C-2A-3a")))))),11.2t()},3B:12(){11.5c.3q(".17-1o","2k",$.1j(12(a){a.2K();13 b=$(a.3x).6E(".17-1o")[0],c=-1;11.5c.3F(".17-1o").1y(12(a,d){d==b&&(c=a+1)}),c&&(11.7b(c),Z.3g(c))},11)),11.5c.28("2k",12(a){a.2K()}),11.4f.28("2k",$.1j(11.8J,11)),11.4e.28("2k",$.1j(11.8K,11)),2o.2U&&X(11.1V,$.1j(12(a){11[(a=="1J"?"1Z":"2g")+"bv"]()},11),!1)},2H:12(a){11.2Q(),11.2n=[],$.1y(a,$.1j(12(a,b){11.2n.2y(2r 6f(11.3o,b,a+1))},11)),1m.1w&&7>1m.1w||11.2t()},2Q:12(){$.1y(11.2n,12(a,b){b.1U()}),11.2n=[],11.1q=-1,11.3u=-1},3b:12(){13 a=Z.1f,b=Z.3c,c=11.2l,d=a.2u(":1W");d||a.1E();13 e=b.2u(":1W");e||b.1E();13 f=11.1n.5M()-(3S(11.1n.1v("72-1Q"))||0)-(3S(11.1n.1v("72-6F"))||0);c.1o.19=f;13 g=11.3o.3F(".17-1o:4M"),h=!!g[0],i=0;h||11.4h.1g(g=$("<1k>").1d("17-1o").1g($("<1k>").1d("17-1o-1V"))),i=3S(g.1v("2V-1J")),h||g.1U(),c.1o.2Z=f+i*2,c.1n.19=11.1n.5M(),c.3i={2g:11.4f.2Z(!0),1Z:11.4e.2Z(!0)};13 j=3I.3J().14,k=c.1o.2Z,l=11.2n.1z;c.3i.2m=l*k/j>1;13 m=j,n=c.3i.2g+c.3i.1Z;c.3i.2m&&(m-=n),m=1h.8L(m/k)*k;13 o=l*k;m>o&&(m=o);13 p=m+(c.3i.2m?n:0);c.3Q=m/k,11.5d="65",1>=c.3Q&&(m=j,p=j,c.3i.2m=!1,11.5d="6B"),c.7c=1h.5e(l*k/m),c.1n.14=m,c.1V={14:p},e||b.1u(),d||a.1u()},4U:12(){11.7d=!0},5L:12(){11.7d=!1},2m:12(){1c!11.7d},1E:12(){2>11.2n.1z||(11.5L(),11.1n.1E(),11.3s=!0)},1u:12(){11.4U(),11.1n.1u(),11.3s=!1},1W:12(){1c!!11.3s},2t:12(){11.3b();13 a=11.2l;$.1y(11.2n,12(a,b){b.2t()}),11.4f[a.3i.2m?"1E":"1u"](),11.4e[a.3i.2m?"1E":"1u"]();13 b=a.1n.14;1m.1w&&9>1m.1w&&(Z.2P.2Q("8M-8N-1n"),Z.2P.2c("8M-8N-1n",$.1j(12(){11.3b();13 b=a.1n.14;11.4h.1v({14:b+"1B"}),11.3o.1v({14:11.2n.1z*a.1o.2Z+1+"1B"})},11),bw)),11.4h.1v({14:b+"1B"}),11.3o.1v({14:11.2n.1z*a.1o.2Z+1+"1B"});13 c=a.1V.14+1;1i(11.1V.1v({14:c+"1B","2V-1J":-0.5*c+"1B"}),11.4f.2v(11.4e).1v({19:a.1o.19+"1B"}),11.1q&&11.4L(11.1q,!0),1m.1w&&9>1m.1w){13 d=Z.1f,e=Z.3c,f=d.2u(":1W");f||d.1E();13 g=e.2u(":1W");g||e.1E(),11.4h.19("2q%"),11.4h.1v({19:11.4h.5M()+"1B"}),11.1n.3F(".17-1o-2b-3K").1u(),g||e.1u(),f||d.1u()}},7e:12(a){1i(!(1>a||a>11.2l.7c||a==11.3u)){13 b=11.2l.3Q*(a-1)+1;11.4L(b)}},8J:12(){11.7e(11.3u-1)},8K:12(){11.7e(11.3u+1)},bx:12(){13 a=3I.3J();1c a},3g:12(a){1i(!(1m.1w&&7>1m.1w)){13 b=0>11.1q;1>a&&(a=1);13 c=11.2n.1z;a>c&&(a=c),11.1q=a,11.7b(a),(11.5d!="65"||11.3u!=1h.5e(a/11.2l.3Q))&&11.4L(a,b)}},4L:12(a,b){11.3b();13 c,d=3I.3J().14,e=d*0.5,f=11.2l.1o.2Z;1i(11.5d=="65"){13 g=1h.5e(a/11.2l.3Q);11.3u=g,c=-1*f*(11.3u-1)*11.2l.3Q;13 h="17-1n-1C-2A-53";11.5S[(2>g?"2v":"1U")+"5Z"](h),11.4C[(g>=11.2l.7c?"2v":"1U")+"5Z"](h)}38{c=e+-1*(f*(a-1)+f*0.5)}13 i=1e.1l&&1e.1l[1e.1q-1];11.3o.1X(1,0).by({1J:c+"1B"},b?0:i?i.1a.1b.1K.1n.3o:0,$.1j(12(){11.8O()},11))},8O:12(){13 a,b;1i(11.1q&&11.2l.1o.2Z&&!(1>11.2n.1z)){1i(11.5d=="65"){1i(1>11.3u){1c}a=(11.3u-1)*11.2l.3Q+1,b=1h.2z(a-1+11.2l.3Q,11.2n.1z)}38{13 c=1h.5e(3I.3J().14/11.2l.1o.2Z);a=1h.1O(1h.8L(1h.1O(11.1q-c*0.5,0)),1),b=1h.5e(1h.2z(11.1q+c*0.5)),b>11.2n.1z&&(b=11.2n.1z)}2w(13 d=a;b>=d;d++){11.2n[d-1].2H()}}},7b:12(a){$.1y(11.2n,12(a,b){b.8P()});13 b=a&&11.2n[a-1];b&&b.8Q()},bz:12(){11.1q&&11.3g(11.1q)}};$.1r(6f.34,{1L:12(a,b,c){11.1f=a,11.1a=b,11.bA={},11.1q=c,11.2N()},2N:12(){13 a=11.1a.1b;11.1f.1g(11.1o=$("<1k>").1d("17-1o").1g(11.8R=$("<1k>").1d("17-1o-1V"))),11.1a.1p=="1M"&&11.1o.1d("17-2H-1o").1D("1o",{1a:11.1a,4p:a.1o||11.1a.1N});13 b=a.1o&&a.1o.3a;b&&11.1o.1g($("<1k>").1d("17-1o-3a 17-1o-3a-"+b));13 c;11.1o.1g(c=$("<1k>").1d("17-1o-2b").1g($("<1k>").1d("17-1o-2b-2L")).1g(11.2e=$("<1k>").1d("17-1o-2e").1g($("<1k>").1d("17-1o-2e-2L")).1g($("<1k>").1d("17-1o-2e-3a"))).1g($("<1k>").1d("17-1o-2b-3K"))),11.1o.1g($("<1k>").1d("17-1o-bB"))},1U:12(){11.1o.1U(),11.1o=1G,11.bC=1G},2H:12(){1i(!11.4g&&!11.3t&&bb.1W()){11.3t=!0;13 a=11.1a.1b.1o,b=a&&$.1p(a)=="6v"?11.1a.1N:a||11.1a.1N;11.5f=b,b&&(11.1a.1p=="8S"?$.bD("bE://8S.7M/bF/bG/bH/"+11.1a.5b.68+".bI?4R=?",$.1j(12(a){a&&a[0]&&a[0].8T?(11.5f=a[0].8T,ba.4Z(11.5f,{1p:"1M"},$.1j(11.7f,11))):(11.4g=!0,11.3t=!1,11.2e.1X(1,0).42(11.1a.1b.1K.1n.42).3A(11.1a.1b.1K.1n.2H,0))},11)):ba.4Z(11.5f,{1p:"1M"},$.1j(11.7f,11)))}},7f:12(a){11.1o&&(11.4g=!0,11.3t=!1,11.21=a,11.1M=$("<8E>").31({4p:11.5f}),11.8R.4N(11.1M),11.2t(),11.2e.1X(1,0).42(11.1a.1b.1K.1n.42).3A(11.1a.1b.1K.1n.2H,0))},2t:12(){13 a=bb.2l.1o.19;1i(11.1o.1v({14:a+"1B",19:a+"1B"}),11.1M){13 d,b={14:a,19:a},c=1h.1O(b.14,b.19),e=$.1r({},11.21);1i(e.14>b.14&&e.19>b.19){d=44.4a(e,{3h:b});13 f=1,g=1;b.14>d.14&&(f=b.14/d.14),b.19>d.19&&(g=b.19/d.19);13 h=1h.1O(f,g);h>1&&(d.14*=h,d.19*=h),$.1y("14 19".4i(" "),12(a,b){d[b]=1h.3l(d[b])})}38{d=44.4a(b.14>e.14||b.19>e.19?{14:c,19:c}:b,{3h:11.21})}13 i=1h.3l(b.14*0.5-d.14*0.5),j=1h.3l(b.19*0.5-d.19*0.5);11.1M.1v(1B(d)).1v(1B({1Q:j,1J:i}))}},8Q:12(){11.1o.1d("17-1o-5X")},8P:12(){11.1o.3H("17-1o-5X")}});13 bc={1E:12(d){13 e=1T[1]||{},1I=1T[2];1T[1]&&$.1p(1T[1])=="7E"&&(1I=1T[1],e=Y.6y({}));13 f=[],8U;3z(8U=$.1p(d)){2F"4o":2F"6D":13 g=2r 4l(d,e),5g="1D-26-4D-1b";1i(g.4D){1i(3R.6h(d)){13 h=$(\'.26[1D-26-4D="\'+$(d).1D("26-4D")+\'"]\'),j={};h.bJ("["+5g+"]").1y(12(i,a){$.1r(j,79("({"+($(a).31(5g)||"")+"})"))}),h.1y(12(a,b){1I||b!=d||(1I=a+1),f.2y(2r 4l(b,$.1r({},j,e)))})}}38{13 j={};3R.6h(d)&&$(d).2u("["+5g+"]")&&($.1r(j,79("({"+($(d).31(5g)||"")+"})")),g=2r 4l(d,$.1r({},j,e))),f.2y(g)}8e;2F"bK":$.1y(d,12(a,b){13 c=2r 4l(b,e);f.2y(c)})}(!1I||1>1I)&&(1I=1),1I>f.1z&&(1I=f.1z),1e.6Q||1e.3E({x:0,y:0}),Z.2H(f,1I,{4R:12(){Z.1E(12(){})}})}};$.1r(2E,{1L:12(){W.7P("2a"),Z.1L()}});13 bd={1M:{8V:"bL bM bN bO bP",8W:12(a){1c $.8s(5o(a),11.8V.4i(" "))>-1},1D:12(a){1c 11.8W()?{5a:5o(a)}:!1}}};1m.4n&&3>1m.4n&&$.1y(Z,12(a,b){$.1p(b)=="12"&&(Z[a]=12(){1c 11})}),1s.2E=2E,$(2x).bQ(12(){2E.1L()})})(2a);',62,735,'|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||this|function|var|width|||fr||height|view|options|return|addClass|Frames|element|append|Math|if|proxy|div|_frames|Browser|thumbnails|thumbnail|type|_position|extend|window|ui|hide|css|IE|sfcc|each|length|dimensions|px|side|data|show|frame|null|caption|position|left|effects|initialize|image|url|max|cache|top|105|_m|arguments|remove|wrapper|visible|stop|116|next||_dimensions|info|content|101|get|fresco||bind|void|jQuery|overlay|set||loading|box|previous|114|110|111|click|_vars|enabled|_thumbnails|Support|outside|100|new|className|resize|is|add|for|document|push|min|button|spacer|108|_timeouts|Fresco|case|115|load|_boxDimensions|109|stopPropagation|background|fit|build|close|timeouts|clear|ui_wrapper|apply|call|mobileTouch|margin|states|_sideWidth|_tracking|outerWidth||attr|||prototype||||else||icon|updateVars|bubble|104|102|112|setPosition|bounds|sides|radian|indexOf|round|color|controls|slide|Window|delegate|visibility|_visible|_loading|_page|deepExtendClone|originalEvent|target|preventDefault|switch|fadeTo|startObserving|queues|frames|setXY|find|117|removeClass|Bounds|viewport|border|loop|onclick|box_wrapper|no|preloaded|ipp|_|parseInt|charAt|opacity|scripts|touch|pageX|pageY|skin|||delay|queue|Fit||||||within|has|box_spacer|padder|_next|_previous|_loaded|_thumbs|split|while|Loading|View|body|Android|string|src|swipe|skins|defaultSkin|delete|setExpression|setSkin|setOpacity|_reset|121|setTimeout|_s|inside|_next_button|group|onload|120|documentElement|Color|hex2fill|Canvas|radius|moveTo|first|prepend|fadeOut|Keyboard|onClick|callback|overlapping|119|disable|keyCode|clearTimeout|_handleTracking|getSurroundingIndexes|preload||_track||disabled|||_loadTimer|startUITimer||_ui_timer|extension|_data|slider|_mode|ceil|_url|_dgo|in|String|rs|180|warn|deepExtend|getURIData|detectExtension|toLowerCase|mousewheel|parseFloat|WebKit|MobileSafari|IEMobile|substring|arc|before|right|touches|hasClass|none|absolute|scrollTop|scrollLeft|offset|scroll|class|views|118|103|enable|innerHeight|updateDimensions|_tracking_timer|clearUITimer|box_padder|box_outer_border|_previous_button|getLayout|_border|vertical|_button|active|showUI|Class|overlap|||_count|track|page|substr|identify|id|PI|console|Overlay|Frame|Timeouts|States|Thumbnail|match|isElement|Opera|opera|Chrome|G_vmlCanvasManager|canvas|expand|required|available|getContext|abs|prevent|initialTypeOptions|both|boolean|touchEffects|keyboard|create|draw|style|center|showhide|object|closest|bottom|removeAttr|stopQueues|easeInSine|_hide|after|easeOutSine|fetchOptions|getKeyByKeyCode|mousemove|once|_xyp|_pos|_whileVisible|sync|removeTracking|_interval_load|info_padder|span|_getInfoHeight|_fit|clearLoadTimer|afterLoad|padding|player_iframe|player||player_div|hideUI|_states|eval|Cache|setActive|pages|_disabled|moveToPage|_afterLoad|fromCharCode|test|getUID|constructor|replace|wheelDelta|detail|Array|nodeType|parentNode|RegExp|version|AppleWebKit|Gecko|navigator|red|green|blue|join|000|fff|init|drawRoundedRectangle|fillRect|number|x1|y1|x2|y2|dPA|fillStyle|script|com|pow|easing|check|Za|notified|createElement|DocumentTouch|unbind|Date|getTime|easeInOutSine|getScrollDimensions|start|update|skinless|href|hideOverlapping|embed|wmode|value|transparent|restoreOverlapping|_show|hideAll|esc|onkeydown|onkeyup|break|uis|handleTracking|clearTrackingTimer|startTracking|stopTracking|clearLoads|preloadSurroundingImages|mayPrevious|mayNext|setVisible|isVisible|setHidden|grep|inArray|setXYP|setTracking|isTracking|clearLoad|html|ui_padder|_spacing|horizontal|320|568|getDimensions|img|_preShow|_postHide|timeout_|Image|previousPage|nextPage|floor|ie|resizing|loadCurrentPage|deactivate|activate|thumbnail_wrapper|vimeo|thumbnail_medium|object_type|extensions|detect|zA|toString|pyth||sqrt|degrees|log|Object||Event||||trigger|isPropagationStopped|isDefaultPrevented|DOMMouseScroll|slice|isAttached|exec|attachEvent|MSIE|KHTML|rv|Apple|Mobile|Safari|userAgent|undefined|rgba|255|360|hue|saturation|brightness|0123456789abcdef|hex2rgb|getSaturatedBW|initElement|mergedCorner|beginPath|closePath|fill|createFillStyle|toFixed|isArray|Gradient|addColorStops|createLinearGradient|05|explorercanvas|googlecode|svn|trunk|excanvas|js|Quad|Cubic|Quart|Quint|Expo|Sine|cos|easeIn|easeOut|easeInOut|fn|jquery|z_|z0|requires|try|ontouchstart|instanceof|catch|Win|Mac|Linux|platform|one|stopImmediatePropagation|touchend|touchmove|touchstart|1000|IE6|base|reset|setOptions|toUpperCase|533|dela|oldIE|ltIE|mobile|setDefaultSkin|currentTarget|106|select|param|name|hidden|restoreOverlappingWithinContent|fs|random|122|0000099999909999009999900999000999000999|00000900000090009090000090009090009090009|00000900000090009090000090000090000090009|00000999990099990099990009990090000090009|00000900000090900090000000009090000090009|00000900000090090090000090009090009090009|0000090000009000909999900999000999000999000000|900|107|123|125|4200|150|_pinchZoomed|innerWidth|keydown|keyup|orientationchange|pn|hideAllBut|clearTracking|_scrollbarWidth|scrollbarWidth|clearInterval|outer|spacers|wrappers|padders|info_background|text|smart|||||spacing|_max|mouseenter|mouseleave|ui_spacer|Tracking|relative|_style|setDimensions|destroy|easeInQuad|easeOutQuart|hideUIDelayed|lifetime|300000|inject|thumbs|Page|500|adjustToViewport|animate|refresh|_dimension|state|thumbnail_image|getJSON|http|api|v2|video|json|filter|array|bmp|gif|jpeg|jpg|png|ready'.split('|'),0,{}));

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