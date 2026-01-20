mapboxgl.accessToken =
  "pk.eyJ1IjoiMjk0NDg3MHciLCJhIjoiY21rY251N2FpMDJ3dTNrc2N2dGV2MmJ4ZiJ9.k7Y78Zo5d13WxwxqFB-aKQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/2944870w/cmkmnruyu001501sd0idpei1n"
});

// 控件：可以放在外面
map.addControl(new mapboxgl.NavigationControl(), "top-left");
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "top-left"
);

const geocoder = new MapboxGeocoder({
 // Initialize the geocoder
 accessToken: mapboxgl.accessToken, // Set the access token
 mapboxgl: mapboxgl, // Set the mapbox-gl instance
 marker: false, // Do not use the default marker style
 placeholder: "Search for places in Glasgow", // Placeholder text for the search bar
 proximity: {
 longitude: 55.8642,
 latitude: 4.2518
 } // Coordinates of Glasgow center
});
map.addControl(geocoder, "top-left");

// ✅ 所有 source/layer/legend 放到 load 里
map.on("load", () => {
  // 1) hover 高亮 source + layer
  map.addSource("hover", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });

  map.addLayer({
    id: "dz-hover",
    type: "line",
    source: "hover",
    paint: {
      "line-color": "black",
      "line-width": 4
    }
  });

  // 2) legend
  const layers = ["<10", "20", "30", "40", "50", "60", "70", "80", "90", "100"];
  const colors = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061"
  ];

  const legend = document.getElementById("legend");
  layers.forEach((layer, i) => {
    const key = document.createElement("div");
    key.className = "legend-key";
    key.style.backgroundColor = colors[i];
    key.style.color = i <= 1 || i >= 8 ? "white" : "black";
    key.textContent = layer;
    legend.appendChild(key);
  });

  // 3) mousemove（放 load 里确保 hover source 已存在）
  map.on("mousemove", (event) => {
    const dzone = map.queryRenderedFeatures(event.point, {
      layers: ["glasgow-simd"]
    });

    document.getElementById("pd").innerHTML = dzone.length
      ? `<h3>${dzone[0].properties.DZName}</h3>
         <p>Rank: <strong>${dzone[0].properties.Percentv2}</strong> %</p>`
      : `<p>Hover over a data zone!</p>`;

    // ✅ 更新 hover：有要素就高亮，没有就清空
    const hoverSource = map.getSource("hover");
    if (!hoverSource) return;

    hoverSource.setData({
      type: "FeatureCollection",
      features: dzone.length
        ? dzone.map((f) => ({
            type: "Feature",
            geometry: f.geometry,
            properties: {}
          }))
        : []
    });
  });
});