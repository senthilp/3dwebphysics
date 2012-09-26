/**
 * 3dwebphysics 
 *
 * Copyright 2012, Senthil Padmanabhan
 * Released under the MIT License
 * http://www.opensource.org/licenses/MIT
 * 
 */
!function($, window) {	
	// Mandating ECMAScript 5 strict mode
	"use strict";
	
	var _m = window.Modernizr || {}, // Retrieving the Modernizr
		index = 0, // Maintaining an index to the carousel instances
		transEndEventNames = {
			'WebkitTransition' : 'webkitTransitionEnd',
			'MozTransition'    : 'transitionend',
			'OTransition'      : 'oTransitionEnd',
			'msTransition'     : 'MsTransitionEnd',
			'transition'       : 'transitionend'
		},
		// Static templates
		TEMPLATES = {
			carousel: '<section style="border:2px solid #CCC;border-radius:4px;position:relative;margin:0 auto;{{perspectiveProp}}:1000px;{{sectionStyle}}">'
				+ '<div id="{{carouselId}}" style="width:100%;height:100%;position:absolute;{{transformStyleProp}}:preserve-3d;{{transitionProp}}:{{transformProp}} 1s ease;{{carouselStyle}}">'
				+'{{figureTmpl}}</div></section>',		
			figure: '<div class="figure" style="position:absolute;margin:0;{{transitionProp}}:opacity 1s ease;{{style}}"></div>',		
			transform: 'translate3d(0, 0, {{translateZ}}px)  rotateY({{rotateY}}deg)'			
		};		
	
	// Adding additional methods to Modernizr for handling CSS prefixing and transition events
	_m.cssPrefixed = function(prop) {
		return _m.prefixed(prop).replace(/([A-Z])/g, function(str,m1){ 
					return '-' + m1.toLowerCase(); 
				}).replace(/^ms-/,'-ms-');
	};
	_m.eventEndPrefixed = function(prop) {
		return transEndEventNames[_m.prefixed(prop)];
	};

	$.fn.extend({
		/**
		 * imageCarousel3D is a JQuery based plugin to create a 3D based picture/image
		 * carousel. It uses CSS3 3D transforms and basic geometry math to 
		 * create the experience. 
		 * 
		 * The plugin uses inbuilt mustache templates to build the markup. Please
		 * refer to example.html https://github.com/senthilp/3dwebphysics/blob/master/carousel/example.html
		 * to see the overall page markup.
		 * 
		 * imageCarousel3D plugin depends on the Modernizr API http://www.modernizr.com
		 * for feature detection and retrieving vendor prefixes. 
		 * 
		 * If viewed in a touch enabled device, it can handle touch events swipe left & 
		 * swipe right using the JQuery Swipe plugin touchSwipe https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
		 * For handling more granular events please override the method handleTouch 
		 * and include the appropriate library.
		 * 
		 * NOTE: This plugin is not advised when there are only 2 items/images to 
		 * be rotated, as they fail to deliver the real 3D effects and can also 
		 * cause adverse behaviors.
		 * 
		 * The input JSON controls the input feed and the various configurations of
		 * the plugin.   
		 * 
		 *		{
		 *			imageUrls : ["http:\/\/i.img.one.JPG","http:\/\/i.img.two.JPG"], // Mandatory, the list of image URLs to float in 3D. Order is preserved
		 *			dimensions: {"height":300,"width":400,"offset":40}, // Mandatory, JSON encapsulating the height & width of the image. Optional offset parameter
		 *																   to specify the distance between images. Default value is 40px
		 *			opacityVal : 0.9, // Optional, The opacity (amount of transparency) value that should be used on the images. Default value is 0.9	
		 *		    keyboardEvents: true, // Optional, A flag to enable keyboard controls. Default value is false	
		 *									   Left Arrow => Move left
		 *									   Right Arrow => Move right
		 *									   Enter => Start spin
		 *									   esc => Stop spinning					
		 *			nodeSelectors: { // Optional, A JSON object representing various DOM nodes involved with the 3D carousel
		 * 				fallback: '.fallback-message', // Optional, The DOM selector for the fallback message container 
		 *				controls: { // Optional, A JSON object representing the DOM nodes of the carousel navigation controllers 
		 *					container: '.controls', // Optional, The selector for the controls container
		 *					left: '.controls .left', // Optional, The selector for moving the carousel to left  
		 *					right: '.controls .right', // Optional, The selector for moving the carousel to right
		 *					spinner: '.controls .spin', // Optional, The selector for spining the carousel
		 *					cancelSpin: '.controls .cancel' // Optional, The selector for cancelling a spin
		 *				},
		 *				mask: '.controls .mask' // Optional, The selector for the mask layer if any to hide the controls when spinning
		 *			}
		 *		} 	
		 * 
		 */	
		imageCarousel3D: function(config) {
				// private local variables 
				// Retrieving config object and setting to local variables
			var imageUrls =  config.imageUrls || [],
				keyboardEvents = config.keyboardEvents,
				nodeSelectors = config.nodeSelectors,
				fallback = nodeSelectors && nodeSelectors.fallback,	
				controls = nodeSelectors && nodeSelectors.controls,
				mask = nodeSelectors && nodeSelectors.mask,		
				oVal = config.opacityVal || 0.9,
				width = config.dimensions.width || 0,
				height = config.dimensions.height || 0,
				offset = config.dimensions.offset || 40,		
				// Setting the static templates
				figureTmpl = TEMPLATES.figure,
				carouselTmpl = TEMPLATES.carousel,
				transformStyle = TEMPLATES.transform,
				// Calculated private closures
				cIndex = index++, // The carousel index, whose state is maintained in the closure variable index		
				carouselNode = '#carousel' + cIndex,
				panelCount = imageUrls.length,
				transformProp = _m.prefixed('transform'),
				transitionProp = _m.prefixed('transition'),
				rotateY = Math.round(360/panelCount), 
				translateZ = Math.round(Math.round((width + offset)/2) / Math.tan(Math.PI/panelCount)), 		
				currentIndex = 0,
				spinDirection = 1,		
				spinning = 0,
				// private functions
				/**
			     * A simple mustache parser which takes a template string and binds the
			     * data model to it. This does NOT support Lamdas & Partials  
			     * 
			     * @method muParse 
			     * @param {String} templateStr The mustache template string
			     * @param {Object} model The data model to be binded with the template  
			     * 
			     * @return data binded markup
			     * @private
			     */			
				muParse = function(templateStr, model) {
					return templateStr.replace(/{{([^{}]*)}}/g, function(origStr, token){
						return model[token];
					});
				},
				css = function(propObj) {
					var cssStr = [], prop;
					for(prop in propObj) {
						cssStr.push(prop);
						cssStr.push(':');
						cssStr.push(propObj[prop]);
						cssStr.push(';');
					}
					return cssStr.join('');
				},
				getTransform = function(angle, direction) {
					direction = direction || -1;
					return muParse(transformStyle, {rotateY: angle, translateZ: direction * translateZ});
				},
				getCurrentAngle = function() {
					var currentStyle = $(carouselNode).get(0).style[transformProp],
						currentRotation = /rotateY\((.?[0-9]+)deg\)/.exec(currentStyle)[1];
					return parseInt(currentRotation, 10);
						
				},
				resetCheck = function() {
					if(Math.abs(currentIndex) >= panelCount) {
						currentIndex = 0;
					}			
				},
				/**
			     * Handles rotation based on direction. Direction values are 1 => left -1 => right 
			     * 
			     * @method handleRotate 
			     * @param {int} direction The direction of rotation, 1 => left -1 => right  
			     * 
			     * @private
			     */			
				handleRotate = function(direction) {
					if(spinning) {
						return;
					}
					currentIndex = currentIndex + direction;
					resetCheck();
					$(carouselNode + " .figure").css("opacity", oVal);
					$(carouselNode).get(0).style[transformProp] = getTransform(getCurrentAngle() + (direction * rotateY));
					$($(carouselNode + " .figure").get(currentIndex>0?panelCount-currentIndex:Math.abs(currentIndex))).css("opacity", "1");
				},
				/**
			     * Handles touch events => swipe left & swipe right
			     * Uses the Jquery Swipe plugin touchSwipe https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
			     * Can be overriden to use any touch events plugin
			     * 
			     * @method handleTouch   
			     * 
			     * @override
			     * @private
			     */							
				handleTouch = function() {
					// Override the swipe handler if needed
					var swipeHandler = function(evt, direction){
						handleRotate(direction === 'left'? -1: 1);						
					};
					if($.fn.swipe) {
						// Attach swipe event to the below node
						$(carouselNode + ' .figure').swipe({
							swipe: swipeHandler,
							threshold: 0
						});											
					}
				},
				resetSpin = function(force) {
					// Double check to ensure spinning is on
					if(!spinning) {
						return;
					}
					// Set the spinning flag to 0
					spinning = 0;
					// Reset transition to 1s
					$(carouselNode).get(0).style[transitionProp] = _m.cssPrefixed('transform') + ' 1s ease';
					// Change the spin direction
					spinDirection *= -1;
					if(force){
						$(carouselNode).get(0).style[transformProp] = getTransform(getCurrentAngle() + (spinDirection * 360));
					}
					$(mask).hide();
				},
				handleSpin = function() {			 
					if(spinning) {
						return;
					}
					var timer = Math.round(panelCount * 1.5);				
					$(carouselNode).get(0).style[transitionProp] = _m.cssPrefixed('transform') + ' ' + timer + 's linear';
					$(carouselNode).get(0).style[transformProp] = getTransform(getCurrentAngle() + (spinDirection * 360));			
					$(mask).show();
					// Set the spinning flag
					spinning = 1;
				},
				init = function() {
					// Hide fallback container, in case it is shown previouly
					$(fallback).hide();		
					// Hide the controls if present
					controls && $(controls.container).hide();
				}, 
				postRender = function(){
					// Event binding for UI controls
					if(controls) { 
						$(controls.left).click(function() {
							handleRotate(1);
						});
						
						$(controls.right).click(function() {
							handleRotate(-1);
						});	
			
						$(controls.spinner).click(function() {
							handleSpin();
						});
						$(controls.cancelSpin).click(function() {
							resetSpin(true);
						});		
						// Show the controls
						$(controls.container).show();
					}
					
					// Event binding for keyboard events
					if(keyboardEvents) {
						$(document).keydown(function(event) {
							switch(event.which) {
								case 37:
									handleRotate(1);
									break;
								case 39:
									handleRotate(-1);
									break;			
								case 13:
									handleSpin();
									break;
								case 27:
									resetSpin(true);
									break;			
							}
						});	
					}
					
					// Touch events
					if(_m.touch) {
						handleTouch();
					}
					
					// Bind the transition end event
					$(carouselNode).bind(_m.eventEndPrefixed('transition'), function(event) {
						if(event.target === $(carouselNode).get(0)) {
							resetSpin(false);
						}
					});			
				},			
				render = function(node) {
				// Check for browser compatability
				if(!_m.csstransforms3d) {
					// Show fallback and return immediately
					$(fallback).show();
					return;
				}
				var i, 
					oHeight = height + offset,
					oWidth = width + offset,
					xy = Math.round(offset/2), // Left & Top coordinates 
					threeDSectionStyle,
					carouselStyle,			
					panelStyle,
					panelNodes = [],
					carouselMarkup;
				
				// Set the styles for the 3D container section
				threeDSectionStyle = {
					height: oHeight + 'px',
					width: oWidth + 'px'
				};
				
				// Set the styles for the Carousel Div
				carouselStyle = {};
				carouselStyle[_m.cssPrefixed('transform')] = getTransform(0); 
				
				// Set the common styles to the panel element
				panelStyle = {
					height: height + 'px',
					width: width + 'px',
					top: xy + 'px',
					left: xy + 'px'
				};
				
				for(i=0; i < panelCount; i++) {
					panelStyle.background = 'url(\''+ imageUrls[i] + '\') no-repeat 50% 50%';
					panelStyle[_m.cssPrefixed('transform')] = 'rotateY(' + (i * rotateY) + 'deg) translate3d(0, 0, ' + translateZ + 'px)';				
					if(i) {
						panelStyle.opacity = oVal;
					}				
					panelNodes.push(muParse(figureTmpl, {
						style: css(panelStyle),
						transitionProp: _m.cssPrefixed('transition')
					}));
				}
				
				// Generating the carousel markup
				carouselMarkup = muParse(carouselTmpl, {
					perspectiveProp: _m.cssPrefixed('perspective'),
					sectionStyle: css(threeDSectionStyle),
					carouselId: carouselNode.replace(/^#/, ''),
					transformStyleProp: _m.cssPrefixed('transformStyle'),
					transitionProp: _m.cssPrefixed('transition'),
					transformProp: _m.cssPrefixed('transform'),
					carouselStyle: css(carouselStyle),
					figureTmpl: panelNodes.join('')
				});
				
				// Add the markup to the container
				$(node).html(carouselMarkup);
				// Post render - Event binding
				postRender();
			};
			
			// Returning JQuery to maintain chainability
			return this.each(function() {
				// Initialize the carousel
				init();
				// Render the UI
				render(this);
			});
		}
	});
}(jQuery, window);