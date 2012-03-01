(function(threeDConfig) {
	var rotateX = threeDConfig.rotateX, 
		translateZ = "translateZ(-" + threeDConfig.translateZ + "px)",
		carouselId = threeDConfig.nodes.carouselId,
		panelCount = threeDConfig.panelCount,
		currentIndex = 0,
		transformStyle = "-webkit-transform",
		getTransform = function(index) {
			// TODO convert to mustache
			return transformStyle + ": " + translateZ + " rotateY(" + (index * rotateX) + "deg);"; 
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
			currentIndex = currentIndex + direction;
			resetCheck();
			$("#"+carouselId + " figure").css("opacity", "0.9");
			$("#"+carouselId).attr("style", getTransform(currentIndex));
			$($("#"+carouselId + " figure").get(currentIndex>0?panelCount-currentIndex:Math.abs(currentIndex))).css("opacity", "1");
		};
	
	$(document).keydown(function(event) {
		if(event.which === 37) {
			handleRotate(1);
		} else if(event.which === 39) {
			handleRotate(-1);
		}
	});
})($.threeDConfig);