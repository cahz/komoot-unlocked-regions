// get list of unlocked regions from komoot internal API
var regions = kmtBoot.getProps().packages.models.map((p) => {
	if (p.attributes.region === undefined) {return 9999;}
	return p.attributes.region.id
});

// load jQuery
var script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
document.getElementsByTagName('head')[0].appendChild(script);

// wait for jQuery to load
script.onload = () => {
	// load leaflet
	var script = document.createElement('script');
	script.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
	document.getElementsByTagName('head')[0].appendChild(script);
	var style = document.createElement('link');
	style.rel = "stylesheet";
	style.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
	document.getElementsByTagName('head')[0].appendChild(style);

	// wait for leaflet to load
	script.onload = () => {
		// create Map viewer
		jQuery('<div/>', {
			id: 'mapid',
			style: 'width: 100%; height: 100%; position: relative; left: 0; top: 105%; z-index: 100000;'
                }).appendTo( $( ".c-inline-map__container" ) );

		var map = L.map('mapid').setView([48, 0], 5);
		L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);

		// iterate over unlocked regions and draw the result
		regions.forEach(async (id) => {
			if (id == 9999) {return}
			// load region boundary and add as polygon
			jQuery.ajax({
				data: {'region': id},
				headers: {'onlyprops': 'true'},
				success: (json) => {
					json.regions[0].geometry.forEach((p) => {
						var region = [];
						p.forEach((i) => {
							region.push([i.lat, i.lng]);
						});
						L.polygon(region).addTo(map);
					});
				}
			});
		});
	};
};

console.log("You have %d free region(s) available!", kmtBoot.getProps().freeProducts.length);
