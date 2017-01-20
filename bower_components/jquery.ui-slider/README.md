#jQuery UI Slider#

###Intro###
Slider contol (like iOS) to configure a value in specified range


###How to install###
1. Add to `bower.json` of your project:
```javascript
{
	// ...
	"dependencies": {
		// ...
		"jquery.ui-slider": "git://github.com/DenisIzmaylov/jquery.ui-slider.git"
	}
}
```

2. Run `bower install`.
3. To any place at your HTML (just for example!):
```html
<link href="path/to/plugin/css/jquery.ui-slider.css" rel="stylesheet" />
<script src="path/to/plugin/js/jquery.ui-slider.js"></script>
<script src="javascript">
	
	$(document).ready(function () {
		
		$('#container').UISlider({
			
            min: 0,
            max: 99,
            value: 50,
            smooth: false
 			
		}).on('change', function (value) {
			
			console.log('Your value:', value);
			
		});
	
	});
	
</script>
```
4. You can also look example in `example.html`.


###Todo###
1. Fix destroy method
2. Add transition for onOwnerClick/onTrackClick