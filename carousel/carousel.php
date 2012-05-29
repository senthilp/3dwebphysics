<?php
	$imageConfig = '{
				    "name": "2010 Bugatti Veyron",
					"urls": ["http://i.ebayimg.com/00/s/NjAwWDgwMA==/$%28KGrHqEOKkME5UYVTN!yBOd-BlQ5F!~~60_8.JPG",
							"http://i.ebayimg.com/00/s/NjAwWDgwMA==/$(KGrHqUOKi8E5!KRByQEBOd-BlQwq!~~60_8.JPG",
							"http://i.ebayimg.com/00/s/NTM0WDgwMA==/$(KGrHqYOKj!E5W9!lpC!BOd-BlL)Yg~~60_8.JPG",							
							"http://i.ebayimg.com/00/s/NjAwWDgwMA==/$(KGrHqMOKpQE5U-snNn7BOd-BlRcbg~~60_8.JPG",
							"http://i.ebayimg.com/00/s/NTM0WDgwMA==/$(KGrHqIOKjYE5qmUm627BOd-Bptrlg~~60_8.JPG",							
							"http://i.ebayimg.com/00/s/NjAwWDgwMA==/$(KGrHqYOKioE5ezELRDtBOd-Bmg-6!~~60_8.JPG",
							"http://i.ebayimg.com/00/s/NjAwWDgwMA==/$(KGrHqYOKkQE5VFdmcQjBOd-BnYzU!~~60_8.JPG",
							"http://i.ebayimg.com/00/s/NjAwWDgwMA==/$(KGrHqEOKnIE5t!Gmc1hBOd-BnJeug~~60_8.JPG",
							"http://i.ebayimg.com/00/s/NjAwWDgwMA==/$(KGrHqIOKo8E5VLzPRQYBOd-BoN80Q~~60_8.JPG"],
					"dimensions": {"height": 300, "width": 400, "offset": 40}
	}';
?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Garage 360 - A 3D Experience</title>
	<link type="text/css" href="carousel/css/carousel.css" rel="stylesheet"/>
    <!--[if IE]>
    <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->	
</head>
<body id="jqt">
	<header>
		<h1>Garage 360</h1>
		<div class="info">A <span class="threeD">3D</span> Experience</div>
	</header>
	<div class="content">
 		<div class="fallback-message">
        	<p>Your browser <b>doesn't support the features required</b> for this experience</p>
        	<p>To experience <b>3D</b> please use the latest <b>Chrome</b> or <b>Safari</b> or <b>Firefox</b> browsers. IE 10 (to be released soon) will also handle it.</p>
    	</div>  	
		<?php 
			// Extracting the image config object
			$imageConfigObj = json_decode($imageConfig, true);
			$vehicleName = $imageConfigObj["name"]; 
			$imageUrls = $imageConfigObj["urls"];				
			$dimensions = $imageConfigObj["dimensions"];
			$height = $dimensions["height"];
			$width = $dimensions["width"];
			$offset = $dimensions["offset"];
		?>	
		<div class="title"><?php echo $vehicleName; ?></div>
		<div class="container" style="height: <?php echo $height + $offset?>px;">
			<div class="throbber"></div>
		</div>
		<div class="controls hide" style="width: <?php echo $width + $offset?>px;">
			<div class="mask">Press esc to cancel</div>
			<div class="left"><</div>
			<div class="spin" style="left: <?php echo (($width + $offset)/2) - 22?>px;"></div>
			<div class="right">></div>
		</div>					
	</div>
	<footer>	
	</footer>	
	<script src="carousel/js/lib/jquery.min.js"></script>
	<script src="carousel/js/lib/jquery.touchSwipe.js"></script>
	<script src="carousel/js/lib/modernizr.js"></script>
	<script src="carousel/js/jquery.carousel3d.js"></script>
	<script>
		(function() {
			// Trigerring the 3D carousel
			$('.container').imageCarousel3D({
				imageUrls : <?php echo json_encode($imageUrls);?>,
				dimensions: <?php echo json_encode($dimensions); ?>,
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
		})();
	</script>
</body>
</html>
