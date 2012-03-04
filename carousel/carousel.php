<?php
	$picConfig = '{
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
	<link type="text/css" href="carousel.css" rel="stylesheet"/>
    <!--[if IE]>
    <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->	
	<?php 
		//include '../../playground/live.inc'; 
	?>
</head>
<body>
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
			// Extracting the picture config object
			$picConfigObj = json_decode($picConfig, true);
			$vehicleName = $picConfigObj["name"]; 
			$picURLs = $picConfigObj["urls"];				
			$panelCount = count($picURLs);
			$dimensions = $picConfigObj["dimensions"];
			$height = $dimensions["height"];
			$width = $dimensions["width"];
			$offset = $dimensions["offset"];
			$rotateY = round(360/$panelCount, 1);
			$translateZ = round(round(($width + $offset)/2) / tan(pi()/$panelCount));									
			// Populating panel styles
			$panelStyleCommon = array();
			$panelStyleCommon[] = 'height:'.$height.'px;';
			$panelStyleCommon[] = 'width:'.$width.'px;';
			$panelStyleCommon[] = 'top:'.round($offset/2).'px;';
			$panelStyleCommon[] = 'left:'.round($offset/2).'px;';
		?>	
		<div class="container">
			<div class="title"><?php echo $vehicleName; ?></div>
			<section class="container3D" style="height:<?php echo $height + $offset?>px; width: <?php echo $width + $offset?>px;">			
				<div id="carousel" style="<?php echo getPrefixedStyle('transform', 'translateZ(-'.$translateZ.'px) rotateY(0deg)');?>">
					<?php 						
						$figureMarkup = array();
						for($i = 0; $i < $panelCount; $i++) {
							$panelStyle = $panelStyleCommon;
							if($i) {
								$panelStyle[] = 'opacity: 0.9;';
							}
							$panelStyle[] = 'background: url(\''.$picURLs[$i].'\') no-repeat 50% 50%;';
							$panelStyle[] = getPrefixedStyle('transform', 'rotateY('.$i*$rotateY.'deg) translateZ('.$translateZ.'px)');
							$figureMarkup[] = '<figure style="'.implode(" ", $panelStyle).'"></figure>';
						}
						echo implode("\n", $figureMarkup);
					?>
			  	</div>
			</section>
			<div class="controls" style="width: <?php echo $width + $offset?>px;">
				<div class="mask"></div>
				<div class="left"><</div>
				<div class="spin" style="left: <?php echo (($width + $offset)/2) - 22?>px;"></div>
				<div class="right">></div>
			</div>	
		</div>		
	</div>
	<footer>	
	</footer>	
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script src="http://www.modernizr.com/downloads/modernizr.js"></script>
	<script src="carousel.js"></script>
	<script>
		(function() {
			if(!Modernizr.csstransforms3d) {
				$('.container').hide();
				$('.fallback-message').show();
				return;
			}
			var threeDConfig = {
					panelCount : <?php echo $panelCount;?>,
					nodeSelectors: {
								carousel: '#carousel',
								leftArrow: '.controls .left',
								rightArrow: '.controls .right',
								spinner: '.controls .spin',
								mask: '.controls .mask'
							},
					opacityVal : 0.9,
					rotateY: <?php echo $rotateY;?>,
					translateZ: <?php echo $translateZ;?>
				};
			$.init(threeDConfig);
		})();
	</script>
</body>
</html>
<?php 
	function getPrefixedStyle($property, $value) {
		$default = $property.":".$value.";";
		$preffix = array($default);
		$preffix[] = "-webkit-".$default;
		$preffix[] = "-moz-".$default;
		return implode(" ", $preffix);
	}
?>