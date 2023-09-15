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

// Load Leaflet style
let style = document.createElement('link');
style.rel = "stylesheet";
style.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
document.getElementsByTagName('head')[0].appendChild(style);

// load scripts: Leaflet
loadScripts(["https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"], () => {
	// create Map viewer
	let mapelem = document.createElement('div');
	mapelem.id = 'mapid';
	mapelem.style = 'width: 100%; height: 100%; position: relative; left: 0; top: 105%; z-index: 100000;';
	document.getElementsByClassName("c-inline-map__container")[0].appendChild(mapelem);

	let map = L.map('mapid').setView([48, 0], 5);
	L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	// iterate over unlocked regions and draw the result
	regions.forEach(async (id) => {
		if (id == 9999) {return}
		// load region boundary and add as polygon
		fetch("?region="+id, {headers: {'onlyprops': 'true'}})
			.then(res => res.json())
			.then(json => {
				json.regions[0].geometry.forEach(p => {
					let region = [];
					p.forEach((i) => {
						region.push([i.lat, i.lng]);
					});
					L.polygon(region).addTo(map);
				});
			});
	});
});


console.log("You have %d free region(s) available!", kmtBoot.getProps().freeProducts.length);
