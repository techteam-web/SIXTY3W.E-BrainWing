// The Games Room's own 360° shot, cam_03 — tiled the same way the drone flythrough is
// (see FloorPanoDay.js), but a single interior scene rather than a per-floor ladder.
// Tiles live at public/assets/level26/tiles/0-cam_03 (not the pano/panoday ladder), which
// is why this is its own small data file rather than another entry in that one.
//
// Taken verbatim from the Marzipano Tool's own export (app-files/data.js) — not measured
// off the tile files by hand. The first level (256px) is `fallbackOnly`: Marzipano fills
// it from the scene's preview.jpg rather than a tile folder, so the three real levels
// (512 / 1024 / 2048) are the ones that need folders on disk, and they are — 1, 2, 3,
// matching 1×1, 2×2 and 4×4 faces of 512px tiles. Getting this one level short (as an
// earlier, hand-written version of this file did) shifts every folder's assumed
// resolution by one step and tears the cube apart at the seams.
var APP_DATA = {
  scenes: [
    {
      id: '0-cam_03',
      name: 'Games Room',
      levels: [
        { tileSize: 256, size: 256, fallbackOnly: true },
        { tileSize: 512, size: 512 },
        { tileSize: 512, size: 1024 },
        { tileSize: 512, size: 2048 },
      ],
      faceSize: 2000,
      initialViewParameters: {
        yaw: -0.7596282421799998,
        pitch: -0.07084218653419327,
        fov: 1.4070723946101482,
      },
      linkHotspots: [],
      infoHotspots: [],
    },
  ],
  settings: {
    mouseViewMode: 'drag',
    autorotateEnabled: true,
    fullscreenButton: false,
    viewControlButtons: false,
  },
};

export default APP_DATA;
