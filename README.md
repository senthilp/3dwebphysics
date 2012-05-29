# 3dwebphysics
## Three Dimensional Physics into the world of web

Impressed by the [Intro to CSS 3D transforms](http://desandro.github.com/3dtransforms/)
article by [David DeSandro](http://desandro.com/), this project kicked-off to 
bring a generic solution for leveraging 3D Physics into web pages seamlessly.

## Carousel
Carousels are common web components used by many pages as an elegant way to represent
transitions between multiple items/panels/divs. Implementing this component in 3D 
resulted in **imageCarousel3D**

imageCarousel3D is a JQuery based plugin to create a 3D based image/picture carousel. It uses 
CSS3 3D transforms and basic geometry math to create the experience. The plugin uses 
inbuilt [mustache](http://mustache.github.com/) templates to build the 3D markup. Please 
refer to [example.html](https://github.com/senthilp/3dwebphysics/blob/master/carousel/example.html) 
to see a sample overall page markup.

imageCarousel3D depends on the [Modernizr](http://www.modernizr.com) API for feature 
detection and retrieving vendor prefixes.

If viewed in a **touch** enabled device, it can handle touch events swipe left & 
swipe right using the JQuery Swipe plugin [touchSwipe](https://github.com/mattbryson/TouchSwipe-Jquery-Plugin)
For handling more granular events please override the method **handleTouch** 
and include the appropriate library.

**NOTE:** This plugin is not advised when there are only 2 items/pictures to be rotated, 
as they fail to deliver the real 3D effects and can also cause adverse behaviors.

The JavaScript for building the 3D carousel is pretty simple
	
	$('.container').imageCarousel3D({
		imageUrls : ["http:\/\/i.img.one.JPG","http:\/\/i.img.two.JPG"],
		dimensions: {"height":300,"width":400,"offset":40},
		opacityVal : 0.9,
		keyboardEvents: true,		
		nodeSelectors: {
			fallback: '.fallback-message',
			controls: {
				container: '.controls',
				left: '.controls .left',
				right: '.controls .right',
				spinner: '.controls .spin',
				cancelSpin: '.controls .cancel'
			},
			mask: '.controls .mask'
		}
	});

You can also simply download this repo, and load the example.html in your browser to see this live in action.

The various options associated with the 3D carousel (as seen in the above JS code) 
are listed below
###imageUrls
**Mandatory**
<br/>
The list/array of image URLs to float in 3D. Order is preserved.
###dimensions
**Mandatory**
<br/>
JSON encapsulating the height & width of the image. Optional offset parameter to 
specify the distance between images. Default value is 40px.
###opacityVal
**Optional**
<br/>
The opacity (amount of transparency) value that should be used on the images. Default 
value is 0.9
###keyboardEvents
**Optional**
<br/>
A flag to enable keyboard controls. Default value is true <br/>
    Left Arrow => Move left <br/>
    Right Arrow => Move right <br/>
    Enter => Start spin <br/>
    esc => Stop spinning
###nodeSelectors
**Optional**
<br/>
A JSON object representing various DOM nodes involved with the 3D carousel.
###fallback
**Optional**
<br/>
The DOM selector for the fallback message container.
###controls
**Optional**
<br/>
A JSON object representing the DOM nodes of the carousel navigation controllers
###container
**Optional**
<br/>
The selector for the controls container
###left
**Optional**
<br/>
The selector for moving the carousel to left
###right
**Optional**
<br/>
The selector for moving the carousel to right
###spinner
**Optional**
<br/>
The selector for spining the carousel
###cancelSpin
**Optional**
<br/>
The selector for cancelling a spin
###mask
**Optional**
<br/>
The selector for the mask layer if any to hide the controls when spinning
