// Google Maps JavaScript API variant of the map document. It speaks the same
// ecoloop-map-v1 protocol as the Leaflet document and reports
// "provider-failed" when the key is rejected or the API cannot load, so the
// surface can fall back to OpenStreetMap.
export function createGoogleMapDocument(apiKey: string) {
  const key = encodeURIComponent(apiKey);
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.ggpht.com data: blob:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://*.gstatic.com; connect-src https://*.googleapis.com https://*.gstatic.com https://*.google.com data: blob:; worker-src blob:;"><style>
html,body,#map{height:100%;width:100%;margin:0;background:#eee7dc;font-family:system-ui,sans-serif}
.eco-marker{position:absolute;width:40px;height:40px;transform:translate(-50%,-88%);cursor:pointer;background:none;border:0;padding:0}
.eco-marker-face{width:36px;height:36px;display:grid;place-items:center;background:#fffcf7;color:var(--accent);border:2px solid var(--accent);border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 3px 10px #30292035;transition:background .2s,scale .2s}
.eco-marker-face svg{transform:rotate(45deg)}.eco-marker.electronics .eco-marker-face{border-radius:10px;transform:none}.eco-marker.electronics svg{transform:none}
.eco-marker.selected{z-index:5}.eco-marker.selected .eco-marker-face{background:var(--accent);color:white;scale:1.15}
.eco-tip{display:none;position:absolute;bottom:46px;left:50%;transform:translateX(-50%);background:#fffcf7;border:1px solid #d4c4b4;border-radius:8px;padding:7px 10px;color:#302920;font-size:12px;width:max-content;max-width:210px;text-align:left;box-shadow:0 3px 12px #30292018}
.eco-marker:hover .eco-tip,.eco-marker:focus .eco-tip,.eco-marker.selected .eco-tip{display:block}
.eco-tooltip-category{font-size:10px;display:block;color:#7c6e62;margin-top:3px}
.eco-user{position:absolute;width:16px;height:16px;transform:translate(-50%,-50%);border-radius:50%;background:#376b9c;border:3px solid #fff;box-shadow:0 1px 6px #0004}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style></head><body><div id="map" role="region" aria-label="Interaktywna mapa Google"></div><script>
(function(){
var channel='ecoloop-map-v1',failed=false,map=null,overlays=[],userOverlay=null,pending=null,oldIds=null,oldSelected=null,oldFocus=null;
function send(type,id){var message={channel:channel,type:type};if(id)message.id=id;if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(message));else window.parent.postMessage(message,'*');}
function fail(){if(failed)return;failed=true;send('provider-failed');}
window.gm_authFailure=fail;
var timer=setTimeout(function(){if(!map)fail();},12000);
function HtmlMarker(position,element){this.position=position;this.element=element;}
function makeOverlayClass(){
 HtmlMarker.prototype=new google.maps.OverlayView();
 HtmlMarker.prototype.onAdd=function(){this.getPanes().overlayMouseTarget.appendChild(this.element);};
 HtmlMarker.prototype.draw=function(){var p=this.getProjection().fromLatLngToDivPixel(this.position);if(p){this.element.style.left=p.x+'px';this.element.style.top=p.y+'px';}};
 HtmlMarker.prototype.onRemove=function(){if(this.element.parentNode)this.element.parentNode.removeChild(this.element);};
}
window.ecoInit=function(){
 if(failed)return;
 clearTimeout(timer);
 makeOverlayClass();
 map=new google.maps.Map(document.getElementById('map'),{center:{lat:50.8118,lng:19.1203},zoom:14,disableDefaultUI:true,zoomControl:true,scaleControl:true,gestureHandling:'greedy',clickableIcons:false,styles:[{featureType:'poi.business',stylers:[{visibility:'off'}]}]});
 google.maps.event.addListenerOnce(map,'tilesloaded',function(){if(!failed)send('tiles-loaded');});
 send('ready');
 if(pending)window.ecoMapUpdate(pending);
};
window.ecoMapUpdate=function(config){
 if(!config||!Array.isArray(config.points))return;
 if(!map){pending=config;return;}
 var points=config.points.filter(function(p){return p&&typeof p.id==='string'&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=85&&Math.abs(p.longitude)<=180;});
 var ids=points.map(function(p){return p.id;}).sort().join(',');
 overlays.forEach(function(o){o.setMap(null);});overlays=[];
 points.forEach(function(p){
  var isElectro=p.category==='electronics';
  var iconPath=isElectro?'M8 2v6m8-6v6M5 8h14v5a7 7 0 0 1-14 0zm7 12v3':p.type==='Ręczny'?'M5 13l4 5h8l4-8-3-2-2 4V4h-3v8-9h-3v10-7H7v9':'M8 2h5v4l2 3v12H6V9l2-3zm-2 10h9m3-6h4v15h-4z';
  var el=document.createElement('button');
  el.className='eco-marker '+(isElectro?'electronics ':'')+(config.selected===p.id?'selected':'');
  el.setAttribute('aria-label',(isElectro?'Punkt elektroniki: ':'Zwrot opakowań: ')+p.name);
  el.innerHTML='<div class="eco-marker-face" style="--accent:'+(isElectro?'#326f68':'#793e4b')+'"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="'+iconPath+'"/></svg></div>';
  var tip=document.createElement('div');tip.className='eco-tip';tip.textContent=p.name;var sub=document.createElement('span');sub.className='eco-tooltip-category';sub.textContent=(isElectro?'Elektronika · uprawniony odbiorca':'Butelki i puszki · '+p.type)+' · '+p.status;tip.appendChild(sub);el.appendChild(tip);
  el.addEventListener('click',function(e){e.stopPropagation();send('select',p.id);});
  var o=new HtmlMarker(new google.maps.LatLng(p.latitude,p.longitude),el);o.setMap(map);overlays.push(o);
 });
 var right=Math.min(Number(config.rightInset)||0,window.innerWidth*.45);
 if(ids!==oldIds){
  if(points.length>1){var b=new google.maps.LatLngBounds();points.forEach(function(p){b.extend({lat:p.latitude,lng:p.longitude});});map.fitBounds(b,{top:65,left:40,bottom:65,right:right+40});google.maps.event.addListenerOnce(map,'idle',function(){if(map.getZoom()>16)map.setZoom(16);});}
  else if(points.length){map.setCenter({lat:points[0].latitude,lng:points[0].longitude});map.setZoom(15);}
 }
 if(config.selected!==oldSelected&&oldIds===ids){var chosen=points.find(function(p){return p.id===config.selected;});if(chosen)map.panTo({lat:chosen.latitude,lng:chosen.longitude});}
 if(config.focus&&config.focus.key!==oldFocus&&Number.isFinite(config.focus.latitude)&&Number.isFinite(config.focus.longitude)){
  var ll=new google.maps.LatLng(config.focus.latitude,config.focus.longitude);
  if(userOverlay)userOverlay.setMap(null);
  var dot=document.createElement('div');dot.className='eco-user';dot.title='Twoja lokalizacja';
  userOverlay=new HtmlMarker(ll,dot);userOverlay.setMap(map);map.setCenter(ll);map.setZoom(15);oldFocus=config.focus.key;
 }
 oldIds=ids;oldSelected=config.selected;
};
window.addEventListener('message',function(event){if(event.source===window.parent&&event.data&&event.data.channel===channel&&event.data.type==='update')window.ecoMapUpdate(event.data.config);});
var s=document.createElement('script');
s.src='https://maps.googleapis.com/maps/api/js?key=${key}&callback=ecoInit&language=pl&region=PL&loading=async';
s.async=true;s.onerror=fail;
document.head.appendChild(s);
})();
</script></body></html>`;
}
