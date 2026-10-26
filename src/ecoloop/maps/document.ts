import { leafletCss, leafletScript } from "./leaflet-vendor";

// This document is shared by a browser frame and the native WebView.
// All point labels are inserted with textContent; external scripts are blocked.
export function createMapDocument() {
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https://tile.openstreetmap.org data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none';"><style>${leafletCss}
html,body,#map{height:100%;width:100%;margin:0;background:#eee7dc;font-family:system-ui,sans-serif}#map{isolation:isolate}.leaflet-control-attribution{font-size:10px!important;max-width:100%;background:#fffcf7e8!important}.leaflet-bar{border:1px solid #d4c4b4!important;border-radius:10px!important;overflow:hidden;box-shadow:0 3px 12px #30292016!important}.leaflet-bar a{background:#fffcf7!important;color:#793e4b!important;width:34px!important;height:34px!important;line-height:34px!important}.eco-marker{background:none;border:0}.eco-marker-face{width:36px;height:36px;display:grid;place-items:center;background:#fffcf7;color:var(--accent);border:2px solid var(--accent);border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 3px 10px #30292035;transition:background .2s,scale .2s}.eco-marker-face svg{transform:rotate(45deg)}.eco-marker.electronics .eco-marker-face{border-radius:10px;transform:none}.eco-marker.electronics svg{transform:none}.eco-marker.selected .eco-marker-face{background:var(--accent);color:white;scale:1.15}.leaflet-tooltip{background:#fffcf7;border:1px solid #d4c4b4;border-radius:8px;padding:7px 10px;color:#302920;white-space:normal;min-width:130px;max-width:210px;box-shadow:0 3px 12px #30292018}.eco-tooltip-category{font-size:10px;display:block;color:#7c6e62;margin-top:3px}.leaflet-container a{color:#793e4b}.leaflet-control-scale-line{border-color:#7c6e62;background:#fffcf7bd}.leaflet-control-zoom{margin-bottom:28px!important}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style></head><body><div id="map" role="region" aria-label="Interaktywna mapa OpenStreetMap"></div><script>${leafletScript.replace(/<\/script/gi, "<\\/script")}</script><script>
(function(){
var channel='ecoloop-map-v1';
function send(type,id){var message={channel:channel,type:type};if(id)message.id=id;if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(message));else window.parent.postMessage(message,'*');}
var map=L.map('map',{zoomControl:false,scrollWheelZoom:false,attributionControl:true}).setView([50.8118,19.1203],14);
map.attributionControl.setPrefix(false);
L.control.zoom({position:'bottomleft',zoomInTitle:'Przybliż mapę',zoomOutTitle:'Oddal mapę'}).addTo(map);
L.control.scale({imperial:false,position:'bottomleft'}).addTo(map);
var loaded=0,errors=0;
var tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,minZoom:3,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',keepBuffer:1,updateWhenIdle:true}).addTo(map);
tiles.on('tileload',function(){loaded++;send('tiles-loaded');});
tiles.on('tileerror',function(){errors++;if(!loaded)send('tiles-error');});
tiles.on('load',function(){if(errors&&!loaded)send('tiles-error');});
var group=L.layerGroup().addTo(map),oldIds=null,oldSelected=null,oldFocus=null,userMarker=null;
window.ecoMapUpdate=function(config){
 if(!config||!Array.isArray(config.points))return;
 var points=config.points.filter(function(p){return p&&typeof p.id==='string'&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=85&&Math.abs(p.longitude)<=180;});
 var ids=points.map(function(p){return p.id;}).sort().join(',');
 group.clearLayers();
 points.forEach(function(p){
  var isElectro=p.category==='electronics';
  var iconPath=isElectro?'M8 2v6m8-6v6M5 8h14v5a7 7 0 0 1-14 0zm7 12v3':p.type==='Ręczny'?'M5 13l4 5h8l4-8-3-2-2 4V4h-3v8-9h-3v10-7H7v9':'M8 2h5v4l2 3v12H6V9l2-3zm-2 10h9m3-6h4v15h-4z';
  var icon=L.divIcon({className:'eco-marker '+(isElectro?'electronics ':'')+(config.selected===p.id?'selected':''),iconSize:[40,40],iconAnchor:[20,35],html:'<div class="eco-marker-face" style="--accent:'+(isElectro?'#326f68':'#793e4b')+'"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="'+iconPath+'"/></svg></div>'});
  var marker=L.marker([p.latitude,p.longitude],{icon:icon,title:p.name,alt:(isElectro?'Punkt elektroniki: ':'Zwrot opakowań: ')+p.name,keyboard:true,riseOnHover:true,zIndexOffset:config.selected===p.id?500:0}).addTo(group);
  var label=document.createElement('div');label.textContent=p.name;var sub=document.createElement('span');sub.className='eco-tooltip-category';sub.textContent=(isElectro?'Elektronika · uprawniony odbiorca':'Butelki i puszki · '+p.type)+' · '+p.status;label.appendChild(sub);marker.bindTooltip(label,{direction:'top',offset:[0,-36]});
  marker.on('click',function(){marker.openTooltip();send('select',p.id);});
 });
 var right=Math.min(Number(config.rightInset)||0,window.innerWidth*.45);
 if(ids!==oldIds){if(points.length>1)map.fitBounds(points.map(function(p){return[p.latitude,p.longitude];}),{paddingTopLeft:[40,65],paddingBottomRight:[right+40,65],maxZoom:16,animate:false});else if(points.length)map.setView([points[0].latitude,points[0].longitude],15,{animate:false});}
 if(config.selected!==oldSelected){var chosen=points.find(function(p){return p.id===config.selected;});if(chosen)map.panInside([chosen.latitude,chosen.longitude],{paddingTopLeft:[45,75],paddingBottomRight:[right+45,65],animate:!window.matchMedia('(prefers-reduced-motion: reduce)').matches});}
 if(config.focus&&config.focus.key!==oldFocus&&Number.isFinite(config.focus.latitude)&&Number.isFinite(config.focus.longitude)){
  var ll=[config.focus.latitude,config.focus.longitude];if(userMarker)map.removeLayer(userMarker);userMarker=L.circleMarker(ll,{radius:8,color:'#fff',weight:3,fillColor:'#376b9c',fillOpacity:1}).addTo(map).bindTooltip('Twoja lokalizacja');map.setView(ll,15);oldFocus=config.focus.key;
 }
 oldIds=ids;oldSelected=config.selected;
};
window.addEventListener('message',function(event){if(event.source===window.parent&&event.data&&event.data.channel===channel&&event.data.type==='update')window.ecoMapUpdate(event.data.config);});
if(typeof ResizeObserver!=='undefined')new ResizeObserver(function(){map.invalidateSize({pan:false});}).observe(document.getElementById('map'));
window.addEventListener('resize',function(){map.invalidateSize({pan:false});});
send('ready');
})();
</script></body></html>`;
}
