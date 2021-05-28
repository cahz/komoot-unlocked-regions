// ==UserScript==
// @name         Render Unlocked Komoot Regions
// @namespace    http://tampermonkey.net/
// @version      0.2
// @include      /^https?://www\.komoot\.(.*)/product/regions(.*)
// @grant        none
// ==/UserScript==


function GM_main () {
    window.onload = function () {

        function loadScriptFromGithub() {
            const http = new XMLHttpRequest();
            http.open("GET", "https://raw.githubusercontent.com/andreasbrett/komoot-unlocked-regions/master/view.js", true);
            http.onreadystatechange = function() {
                console.log(http.status);
                if(http.readyState == 4 && http.status == 200) {
                    const d = document;
                    const scriptNode = d.createElement ('script');
                    scriptNode.type = "text/javascript";
                    scriptNode.textContent = http.responseText;

                    const eHead = d.getElementsByTagName('head')[0] || d.body || d.documentElement;
                    eHead.appendChild (scriptNode);
                }
            }
            http.send();
        }

        // run loadScriptFromGithub after 1sec
        setTimeout(loadScriptFromGithub, 1000);
    }
}

const d = document;
const scriptNode = d.createElement ('script');
scriptNode.type = "text/javascript";
scriptNode.textContent = '(' + GM_main.toString() + ')()';

const eHead = d.getElementsByTagName('head')[0] || d.body || d.documentElement;
eHead.appendChild (scriptNode);
