(function(threeDConfig) {
	var rotateX = threeDConfig.rotateX, 
		carousel = threeDConfig.nodeSelectors.carousel,
		leftArrow = threeDConfig.nodeSelectors.leftArrow,
		rightArrow = threeDConfig.nodeSelectors.rightArrow,
		spinner = threeDConfig.nodeSelectors.spinner,
		panelCount = threeDConfig.panelCount,		
		oVal = threeDConfig.opacityVal,
		transformProp = Modernizr.prefixed('transform'),
		transitionProp = Modernizr.prefixed('transition'),
		currentIndex = 0,
		rotateIndex = 0,
		spinDirection = 1,
		spinning = 0,
		timerObj,
		transformStyle = "translateZ(-" + threeDConfig.translateZ + "px)  rotateY({{}}deg)",
		getTransform = function(angle) {
			return transformStyle.replace(/{{}}/, angle);
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
			rotateIndex = rotateIndex + direction;
			$(carousel + " figure").css("opacity", oVal);
			$(carousel).get(0).style[transformProp] = getTransform(getCurrentAngle() + (direction * rotateX));
			$($(carousel + " figure").get(currentIndex>0?panelCount-currentIndex:Math.abs(currentIndex))).css("opacity", "1");
		},
		resetSpin = function() {
			timerObj && clearTimeout(timerObj);
			$(carousel).get(0).style[transitionProp] = '1s ease';
			spinning = 0;			
		},
		handleSpin = function() {			 
			if(spinning) {
				return;
			}
			var timer = Math.round(panelCount * 1.5);
			$(carousel).get(0).style[transitionProp] = timer + 's linear';
			$(carousel).get(0).style[transformProp] = getTransform(getCurrentAngle() + (spinDirection * 360));
			spinDirection *= -1;
			spinning = 1;
			timerObj = setTimeout(resetSpin, timer * 1000);			
		};
	
	$(leftArrow).click(function() {
		handleRotate(1);
	});
	
	$(rightArrow).click(function() {
		handleRotate(-1);
	});	

	$(spinner).click(function() {
		handleSpin();
	});		
	
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
				resetSpin();
				break;			
		}
	});
})($.threeDConfig);