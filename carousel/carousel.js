(function($, window) {	
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
		};
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];	
	// Adding an additional method to Modernizr for handling CSS prefixing
	_m.cssPrefixed = function(prop) {
		return _m.prefixed(prop).replace(/([A-Z])/g, function(str,m1){ 
					return '-' + m1.toLowerCase(); 
				}).replace(/^ms-/,'-ms-');
	};
	_m.eventEndPrefixed = function(prop) {
		return transEndEventNames[_m.prefixed(prop)];
	};
		
	$.PicCarousel3D = function(config) {
			// private variables
		var picUrls =  config.picUrls,
			container = config.nodeSelectors.container,
			fallback = config.nodeSelectors.fallback,	
			controls = config.nodeSelectors.controls,
			mask = config.nodeSelectors.mask,		
			oVal = config.opacityVal,
			width = config.dimensions.width,
			height = config.dimensions.height,
			offset = config.dimensions.offset,
			// Setting the static templates
			figureTmpl = $.PicCarousel3D.FIGURE_TMPL,
			carouselTmpl = $.PicCarousel3D.CAROUSEL_TMPL,
			transformStyle = $.PicCarousel3D.TRANSFORM_STYLE,
			// Calculated private closures
			cIndex = index++, // The carousel index, whose state is maintained in the closure variable index		
			carouselNode = '#carousel' + cIndex,
			panelCount = picUrls.length,
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
				$(carouselNode + " figure").css("opacity", oVal);
				$(carouselNode).get(0).style[transformProp] = getTransform(getCurrentAngle() + (direction * rotateY));
				$($(carouselNode + " figure").get(currentIndex>0?panelCount-currentIndex:Math.abs(currentIndex))).css("opacity", "1");
			},
			resetSpin = function(force) {
				// Extra caution to first check for spinning
				if(!spinning) {
					return;
				}
				// Reset transition to 1s
				$(carouselNode).get(0).style[transitionProp] = _m.cssPrefixed('transform') + ' 1s ease';
				// Change the spin direction
				spinDirection *= -1;
				// Set the spinning flag to 0
				spinning = 0;
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
				spinning = 1;
				$(mask).show();
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
					// Show the controls
					$(controls.container).show();
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
				
				// Transition end events
				$(carouselNode).bind(_m.eventEndPrefixed('transition'), function() {
					resetSpin(false);
				});
			};
	
		this.render = function() {
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
				panelStyle.background = 'url(\''+ picUrls[i] + '\') no-repeat 50% 50%';
				panelStyle[_m.cssPrefixed('transform')] = 'rotateY(' + (i * rotateY) + 'deg) translateZ(' + translateZ + 'px)';				
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
			$(container).html(carouselMarkup);
			// Call post render
			postRender();
		};	
		
		// Initialize the carousel
		init();
	};
	
	// Static properties
	$.PicCarousel3D.CAROUSEL_TMPL = '<section style="border:2px solid #CCC;border-radius:4px;position:relative;margin:0 auto;{{perspectiveProp}}:1000px;{{sectionStyle}}">'
									+ '<div id="{{carouselId}}" style="width:100%;height:100%;position:absolute;{{transformStyleProp}}:preserve-3d;{{transitionProp}}:{{transformProp}} 1s ease;{{carouselStyle}}">'
									+'{{figureTmpl}}</div></section>';
	
	$.PicCarousel3D.FIGURE_TMPL = '<figure style="position:absolute;margin:0;{{transitionProp}}:opacity 1s ease;{{style}}"></figure>';
	
	$.PicCarousel3D.TRANSFORM_STYLE = 'translateZ({{translateZ}}px)  rotateY({{rotateY}}deg)';
	
})($, window);

// TODO
// , 4. commenting on config