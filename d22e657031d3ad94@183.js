// https://observablehq.com/@airton-neto/projetovismapasubparks@183
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# ProjetoVISMapaSubparks`
)});
  main.variable(observer("view")).define("view", ["md","container"], function(md,container){return(
md`${container()}`
)});
  main.variable(observer("format")).define("format", ["d3"], function(d3){return(
d3.format(".1f")
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv('https://gist.githubusercontent.com/airton-neto/ecbc20944793481e707c22e51447c426/raw/5d03c8459c7d8b7ac070d8cb8445c9d73a6efe1e/subpark.csv')
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("idDimension")).define("idDimension", ["facts"], function(facts){return(
facts.dimension(d => d.subpark_id)
)});
  main.variable(observer("idGrouping")).define("idGrouping", ["idDimension"], function(idDimension){return(
idDimension.group()
)});
  main.variable(observer("updateMarkers")).define("updateMarkers", ["idGrouping","circles","layerList","map","L"], function(idGrouping,circles,layerList,map,L){return(
function updateMarkers(){
 let ids = idGrouping.all()
 let todisplay = new Array(ids.length) //preallocate array to be faster
 let mc = 0; //counter of used positions in the array
 for (let i = 0; i < ids.length; i++) {
 let tId = ids[i];
 if(tId.value > 0){ //when an element is filtered, it has value > 0
 todisplay[mc] = circles.get(tId.key)
 mc = mc + 1
 }
 }
 todisplay.length = mc; //resize the array so Leaflet does not complain
 if (layerList.length == 1) {
 layerList[0].clearLayers() //remove circles in layerGroup
 if (map.hasLayer(layerList[0])){
 map.removeLayer(layerList[0]) //remove layerGroup if present
 }
 }
 layerList[0] = L.layerGroup(todisplay).addTo(map) //add it again passing the array of markers
 }
)});
  main.variable(observer()).define(["updateMarkers"], function(updateMarkers){return(
updateMarkers()
)});
  main.variable(observer("updateFilters")).define("updateFilters", ["layerList","idDimension","dc"], function(layerList,idDimension,dc){return(
function updateFilters(e){
  let visibleMarkers = new Array(layerList.length);
   let mc = 0;
 layerList[0].eachLayer(function(layer) {
 if( e.target.getBounds().contains(layer.getLatLng()) )
//add layer.subpark_id to some array visibleMarkers
   visibleMarkers[mc] = layer.subpark_id
   mc = mc + 1;
 })
 idDimension.filterFunction(function(d) {
 return visibleMarkers.indexOf(d) > -1;
 });
 dc.redrawAll();
}
)});
  main.variable(observer("layerList")).define("layerList", function(){return(
[]
)});
  main.variable(observer("greenIcon")).define("greenIcon", ["L"], function(L){return(
L.icon({
    iconUrl: 'https://static.thenounproject.com/png/62953-200.png',
    //iconUrl: 'https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/1631825/wind-turbine-clipart-xl.png',
    iconSize:     [68, 70], // size of the icon
    iconAnchor:   [35, 35], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
})
)});
  main.variable(observer("circles")).define("circles", ["dataset","L","greenIcon"], function(dataset,L,greenIcon)
{
 let markers = new Map();
 dataset.forEach(function(d) {
   let circle = L.marker([d.latitude, d.longitude], {icon: greenIcon});
   circle.bindPopup("Subparque: " + d.subpark);
   circle.subpark_id = d.subpark_id; //para a interação na outra direção
   markers.set(d.subpark_id, circle);
 });
 return markers;
}
);
  main.variable(observer()).define(["dataset"], function(dataset){return(
dataset
)});
  main.variable(observer("map")).define("map", ["view","L","updateFilters"], function(view,L,updateFilters)
{
  view;
  let mapInstance = L.map('mapid').setView([-2.87369,-39.92208], 15)
   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    minZoom: 11,
    maxZoom: 17
    }).addTo(mapInstance)
  mapInstance.on('moveend', updateFilters)
  return mapInstance
}
);
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role="main" class="container">
    <div class="row">
      <h4>Subparques</h4>
    </div>
    <div class='row'>
        <div id="mapid" class="col-6">
        </div>
    </div>
  </main>
 `
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
<link rel="stylesheet" type="text/css" href="https://unpkg.com/dc@4/dist/style/dc.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
   crossorigin=""/>
<style>
#mapid {
 width: 650px;
 height: 480px;
}
</style>
`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require('dc')
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require('crossfilter2')
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  main.variable(observer("L")).define("L", ["require"], function(require){return(
require('leaflet@1.6.0')
)});
  return main;
}
