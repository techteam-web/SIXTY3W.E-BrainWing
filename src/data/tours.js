// A walkable 360° tour, as TourViewer takes it: a Marzipano Tool export, the folder its
// tiles live in, and a name for every scene.
//
// Exports name scenes by camera ("Cam_03", "Living_Cam_02"), which says nothing to a
// visitor. A walk-through arrow is labelled with where it leads, so each tour supplies
// the place each scene is in.

const FACES = ['f', 'r', 'b', 'l'];

export function makeTour({ data, tiles, labels, fallback }) {
  const byId = Object.fromEntries(data.scenes.map((s) => [s.id, s]));
  return {
    // The shape PanoViewer takes: one tile set, offered as "day" only.
    data: { day: data, night: data },
    tiles: { day: tiles, night: tiles },
    label: (id) => labels[id] ?? fallback,
    // A card's thumbnail: the lowest real level's single tile on whichever cube face the
    // scene opens facing — the face nearest its initial yaw (front 0, right +90°, back
    // 180°, left −90°), so the card shows what the visitor will actually see first.
    thumb: (id) => {
      const yaw = byId[id]?.initialViewParameters?.yaw ?? 0;
      const face = FACES[(((Math.round(yaw / (Math.PI / 2)) % 4) + 4) % 4)];
      return `${tiles}/${id}/1/${face}/0/0.jpg`;
    },
  };
}
