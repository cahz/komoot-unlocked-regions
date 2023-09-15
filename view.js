// get list of unlocked regions from komoot internal API
var regions = kmtBoot.getProps().packages.models.map((p) => {
	if (p.attributes.region === undefined) {return 9999;}
	return p.attributes.region.id
});

function loadScripts(srcs, callback={}){
	if(srcs.length == 0){
		callback();
		return;
	}
	let script = document.createElement('script');
	script.src = srcs.shift();
	document.getElementsByTagName('head')[0].appendChild(script);
	script.onload = () => {loadScripts(srcs, callback)};
}

// Load Maplibre style
let style = document.createElement('link');
style.rel = "stylesheet";
style.href = "https://unpkg.com/maplibre-gl/dist/maplibre-gl.css";
document.getElementsByTagName('head')[0].appendChild(style);

// load scripts: Maplibre
loadScripts(["https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"], () => {
	let mapelem = document.createElement('div');
	mapelem.id = 'mapid';
	mapelem.style.height = document.getElementsByClassName("c-inline-map__container")[0].getBoundingClientRect().height + "px"
	document.getElementsByClassName("c-inline-map__container")[0].parentNode.parentNode.appendChild(mapelem);

	let map = new maplibregl.Map({
		container: 'mapid',
		style: 'https://tiles-api.maps.komoot.net/v1/style.json?optimize=true',
		attribution: 'Maplibre | &copy; <a href="">komoot</a> | Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	});
	map.addControl(new maplibregl.NavigationControl());

	map.once("load", () => {
		map.setLayoutProperty("komoot-region", 'visibility', 'visible'); // Enable the region layer
		let allbounds = new maplibregl.LngLatBounds()

		// iterate over unlocked regions and draw the result
		regions.forEach(async (id) => {
			if (id == 9999) {return}

			// load regions and add them as geojson features
			fetch("?region="+id, {headers: {'onlyprops': 'true'}})
				.then(res => res.json())
				.then(json => {
					let counter = 0;
					json.regions[0].geometry.forEach(p => {
						counter++;
						let region = [];
						p.forEach((i) => {
							region.push([i.lng, i.lat]);
							allbounds.extend([i.lng, i.lat])
						});

						map.getSource('komoot_region').updateData({
							add: [{
								type: 'Feature',
								id: id+"p"+counter,
								geometry: {type: 'LineString', coordinates: region},
								properties: {"region": json.regions[0].groupId==1,},
							}]
						});
					});
					map.fitBounds(allbounds, {
						padding: 20
					});
				});
		});
	});

	map.on('click', 'komoot-region', (e) => {
		const coordinates = e.features[0].geometry.coordinates;
		const bounds = coordinates.reduce((bounds, coord) => {
			return bounds.extend(coord);
		}, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

		map.fitBounds(bounds, {
			padding: 20
		});
	});

	// Change the cursor to a pointer when the mouse is over the states layer.
	map.on('mouseenter', 'komoot-region', () => { map.getCanvas().style.cursor = 'pointer'; });
	map.on('mouseleave', 'komoot-region', () => { map.getCanvas().style.cursor = ''; });

});


availableRegions = kmtBoot.getProps().freeProducts.length;
if(availableRegions>0){
	let elem = document.createElement('span');
	elem.innerHTML = "You have <b>"+availableRegions+"</b> free region"+(availableRegions!=1?"s":"")+" available!";
	document.getElementsByClassName("c-inline-map__container")[0].parentNode.parentNode.parentNode.appendChild(elem);
}

console.log("You have %d free region(s) available!", kmtBoot.getProps().freeProducts.length);
