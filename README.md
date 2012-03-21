# 3dwebphysics
## Three Dimensional Physics into the world of web

Impressed by the [Intro to CSS 3D transforms](http://desandro.github.com/3dtransforms/)
article by [David DeSandro](http://desandro.com/), this project kicked-off to 
bring a generic solution for leveraging 3D Physics into web pages seamlessly.

## Carousel
Carousels are common web components used by many pages as an elegant way to represent
transitions between multiple items/panels/divs. Implementing this component in 3D 
resulted in **PicCarousel3D**

PicCarousel3D is a JQuery based plugin to create a 3D based picture carousel. It uses 
CSS3 3D transforms and basic geometry math to create the experience. The plugin uses 
inbuilt [mustache](http://mustache.github.com/) templates to build the 3D markup. Please 
refer to [carousel.php](https://github.com/senthilp/3dwebphysics/blob/master/carousel/carousel.php) 
to see a sample overall page markup.

PicCarousel3D depends on the [Modernizr](http://www.modernizr.com) API for feature 
detection and retrieving vendor prefixes.

**NOTE:** This plugin is not advised when there are only 2 items/pictures to be rotated, 
as they fail to deliver the real 3D effects and can also cause adverse behaviors.

The JavaScript for building the 3D carousel is pretty simple
	
	$('.container').PicCarousel3D({
		picUrls : ["http:\/\/i.img.one.JPG","http:\/\/i.img.two.JPG"],
		dimensions: {"height":300,"width":400,"offset":40},
		opacityVal : 0.9,							
		nodeSelectors: {
			fallback: '.fallback-message',
			controls: {
				keyboard: true,
				container: '.controls',
				left: '.controls .left',
				right: '.controls .right',
				spinner: '.controls .spin',
				cancelSpin: '.controls .cancel'
			},
			mask: '.controls .mask'
		}
	});

The various options associated with the 3D carousel (as seen in the above JS code) 
are listed below
###picUrls
**Mandatory**
<br/>
The list/array of picture URLs to float in 3D. Order is preserved.
###dimensions
**Mandatory**
<br/>
JSON encapsulating the height & width of the picture. Optional offset parameter to 
specify the distance between images. Default value is 40px.

