// ==UserScript==
// @name         Render Unlocked Komoot Regions
// @namespace    http://tampermonkey.net/
// @version      0.1
// @include      /^https?://www.komoot\.(.*)/product/regions(.*)
// @grant        none
// ==/UserScript==


function addJS_Node (scriptAsText, scriptURL, functionToRun, onloadEventListener) {
    var d = document;
    var scriptNode = d.createElement ('script');
    if (onloadEventListener) {
        scriptNode.addEventListener ("load", onloadEventListener, false);
    }
    scriptNode.type = "text/javascript";
    if (scriptAsText) scriptNode.textContent = scriptAsText;
    if (scriptURL) scriptNode.src = scriptURL;
    if (functionToRun) scriptNode.textContent = '(' + functionToRun.toString() + ')()';

    var eHead = d.getElementsByTagName('head')[0] || d.body || d.documentElement;
    eHead.appendChild (scriptNode);
}


function GM_main () {
    window.onload = function () {

        // https://github.com/cahz/komoot-unlocked-regions
        function komootUnlockedRegions() {
            // get list of unlocked regions from komoot internal API
            var regions = kmtBoot.getProps().packages.models.map((p) => {
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
                        $.ajax({
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
        }

        // run komootUnlockedRegions after 1sec
        setTimeout(komootUnlockedRegions, 1000);
    }
}

addJS_Node (null, null, GM_main);
