(function($) {	
	// Mandating ECMAScript 5 strict mode
	"use strict";
	
	// Retrieving the Modernizr
	var _m = Modernizr || {};
	// Adding an additional method to Modernizr for handling CSS prefixing
	_m.cssPrefixed = function(prop) {
		return _m.prefixed(prop).replace(/([A-Z])/g, function(str,m1){ 
					return '-' + m1.toLowerCase(); 
				}).replace(/^ms-/,'-ms-');
	};
		
	$.PicCarousel3D = function(config) {
			// private variables
		var picUrls =  config.picUrls,
			parentContainer = config.nodeSelectors.parentContainer,
			threeDContainer = config.nodeSelectors.threeDContainer,
			fallbackContainer = config.nodeSelectors.fallbackContainer,
			carousel = config.nodeSelectors.carousel,	
			controls = config.nodeSelectors.controls,
			mask = config.nodeSelectors.mask,		
			oVal = config.opacityVal,
			width = config.dimensions.width,
			height = config.dimensions.height,
			offset = config.dimensions.offset,
			// Setting the static templates
			figureTmpl = $.PicCarousel3D.FIGURE_TMPL,
			transformStyle = $.PicCarousel3D.TRANSFORM_STYLE,
			// Calculated private closures
			panelCount = picUrls.length,
			transformProp = _m.prefixed('transform'),
			transitionProp = _m.prefixed('transition'),
			rotateY = Math.round(360/panelCount), 
			translateZ = Math.round(Math.round((width + offset)/2) / Math.tan(Math.PI/panelCount)), 		
			currentIndex = 0,
			spinDirection = 1,		
			spinning = 0,
			timerObj,
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
			getTransform = function(angle, direction) {
				direction = direction || -1;
				return muParse(transformStyle, {rotateY: angle, translateZ: direction * translateZ});
			},
			getCurrentAngle = function() {
				var currentStyle = $(carousel).get(0).style[transformProp],
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
				$(carousel + " figure").css("opacity", oVal);
				$(carousel).get(0).style[transformProp] = getTransform(getCurrentAngle() + (direction * rotateY));
				$($(carousel + " figure").get(currentIndex>0?panelCount-currentIndex:Math.abs(currentIndex))).css("opacity", "1");
			},
			resetSpin = function(force) {
				// Clear the timer first
				timerObj && clearTimeout(timerObj);
				// Reset transition to 1s
				$(carousel).get(0).style[transitionProp] = '1s ease';
				// Change the spin direction
				spinDirection *= -1;
				// Set the spinning flag to 0
				spinning = 0;
				if(force){
					$(carousel).get(0).style[transformProp] = getTransform(getCurrentAngle() + (spinDirection * 360));
				}
				$(mask).hide();
			},
			handleSpin = function() {			 
				if(spinning) {
					return;
				}
				var timer = Math.round(panelCount * 1.5);				
				$(carousel).get(0).style[transitionProp] = timer + 's linear';
				$(carousel).get(0).style[transformProp] = getTransform(getCurrentAngle() + (spinDirection * 360));			
				spinning = 1;
				// TODO change to transition end event
				timerObj = setTimeout(function(){resetSpin();}, timer * 1000);		
				$(mask).show();
			},
			init = function() {
				// Hide all the containers
				$(parentContainer).hide();
				$(fallbackContainer).hide();
				
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
				}
				
				// Event binding for keyboard events
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
				
			};
	
		this.render = function() {
			// Check for browser compatability
			if(!_m.csstransforms3d) {
				// Show fallback and return immediately
				$(fallbackContainer).show();
				return;
			}
			var i, 
				oHeight = height + offset,
				oWidth = width + offset,
				xy = Math.round(offset/2), // Left & Top coordinates 
				panelStyle = [],
				elemStyle = [],
				panelNodes = [];
			
			// Set the styles for the 3D container
			$(threeDContainer).css({
				height: oHeight + 'px',
				width: oWidth + 'px'
			});
			
			// Set the carousel section transformation
			$(carousel).get(0).style[transformProp] = getTransform(0);
			
			// Populate common styles to the panel element
			panelStyle.push('height:' + height + 'px');
			panelStyle.push('width:' + width + 'px');
			panelStyle.push('top:' + xy + 'px');
			panelStyle.push('left:' + xy + 'px');			
			
			for(i=0; i < panelCount; i++) {
				elemStyle = panelStyle;	// Resetting the elemStyle to panel style		
				elemStyle.push('background:' + 'url(\''+ picUrls[i] + '\') no-repeat 50% 50%');
				elemStyle.push(_m.cssPrefixed('transform') + ':' + 'rotateY(' + (i * rotateY) + 'deg) translateZ(' + translateZ + 'px)');				
				if(i) {
					elemStyle.push('opacity:' + oVal);
				}				
				panelNodes.push(muParse(figureTmpl, {style: elemStyle.join(';')}));
			}
			// Append the panel elements
			$(carousel).append(panelNodes.join(''));
			
			// Show the parent container and do the reflow
			$(parentContainer).show();
		};	
		
		// Initialize the carousel
		init();
	};
	
	// Static properties
	$.PicCarousel3D.FIGURE_TMPL = '<figure style="{{style}}"></figure>';
	
	$.PicCarousel3D.TRANSFORM_STYLE = 'translateZ({{translateZ}}px)  rotateY({{rotateY}}deg)';
	
})($);

// TODO
// 3. Static methods