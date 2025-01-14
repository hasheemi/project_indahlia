// let config = {
//   minZoom: 7,
//   maxZoom: 18,
// };
// magnification with which the map will start -6.905977, 107.613144.
let container = document.querySelector(".container");
let panel = document.querySelector(".panel");
let judul = document.querySelector(".desc h3");
let img = document.querySelector(".panel img");
let link = document.querySelector(".panel a");
let closer = document.querySelector(".close");
const zoom = 10;
let holder = document.querySelectorAll("p.hidden");

// co-ordinates
const co = [-7.8478713, 113.0161214];

// calling map
const map = L.map("maps", {
  zoomControl: false,
}).setView(co, zoom);
holder.forEach((e) => {
  let koor = e.innerHTML.split(",");
  var marker = L.marker([koor[0], koor[1]], {
    id: koor[2],
  })
    .on("click", async (e) => {
      let req = await fetch(`/maps/place/${e.target.options.id}`);
      let res = await req.json();
      console.log(res[0]);
      panel.innerHTML = `
      <div class="close"><i class="bi bi-x-lg"></i></div>
      <img src="${res[0].img}" alt="" />

      <div class="desc">
        <h3>${res[0].nama}</h3>
        <div>
          <p>
          ${res[0].deskripsi}
          </p>
        </div>
        <div class="list">
          <div><i class="bi bi-geo-alt"></i> ${res[0].kabupaten}, ${res[0].provinsi}</div>
          <div><i class="bi bi-flag"></i> ${res[0].jenis}</div>
          <div><i class="bi bi-telephone"></i> ${res[0].notel}</div>
        </div>
        <a href="${res[0].link}"><button>lihat google maps</button></a>
        <button><i class="bi bi-share-fill"></i></button>
      </div>
    `;
      document.querySelector(".close").onclick = (e) => {
        container.classList.remove("open");
        console.log(e);
      };
      container.classList.add("open");
    })
    .addTo(map);
});
L.control
  .zoom({
    position: "bottomright",
  })
  .addTo(map);
// Define layers
const layerPeta = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
  }
);
const layerSatelit = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);
// // Add the initial layer (Layer Peta) to the map
layerPeta.addTo(map);

// Handle layer toggle
let isPetaLayer = true;
document.getElementById("layer-toggle").addEventListener("click", function () {
  if (isPetaLayer) {
    map.removeLayer(layerPeta);
    map.addLayer(layerSatelit);
    this.innerHTML = '<i class="bi bi-layers"></i> Layer Peta';
  } else {
    map.removeLayer(layerSatelit);
    map.addLayer(layerPeta);
    this.innerHTML = '<i class="bi bi-layers"></i> Layer Satelit';
  }
  isPetaLayer = !isPetaLayer;
});
