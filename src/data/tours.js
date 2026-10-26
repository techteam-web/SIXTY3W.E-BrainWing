// A walkable 360° tour, as TourViewer takes it: a Marzipano Tool export, the folder its
// tiles live in, and a name for every scene.
//
// Exports name scenes by camera ("Cam_03", "Living_Cam_02"), which says nothing to a
// visitor. A walk-through arrow is labelled with where it leads, so each tour supplies
// the place each scene is in.

const FACES = ['f', 'r', 'b', 'l'];

// `map`, optional: `{ render, title, points: [{ place, n, u, v }] }` — a picture of the
// whole tour with a numbered dot per place, at u/v normalised against that render. Each
// dot is given the place's first camera, so clicking it lands where the jump menu would.
//
// `names`, optional: `{ sceneId: 'Reception Desk' }` — a camera's own name, for a place
// big enough that "Point 4" tells a visitor nothing (a lobby that winds past half the
// level). It replaces the numbered name for that camera only; the place it belongs to,
// and so the jump menu and the map, are unchanged.
//
// `views`, optional: `{ sceneId: { yaw, pitch } }` (radians) — where a camera opens
// facing, over the export's own, for a camera named after something it doesn't open on.
// Applied to a copy; the export itself stays exactly as the Marzipano Tool wrote it.
export function makeTour({ data: raw, tiles, labels, fallback, names: own = {}, views = {}, map = null }) {
  const data = {
    ...raw,
    scenes: raw.scenes.map((s) =>
      views[s.id]
        ? { ...s, initialViewParameters: { ...s.initialViewParameters, ...views[s.id] } }
        : s,
    ),
  };
  const byId = Object.fromEntries(data.scenes.map((s) => [s.id, s]));

  // A place shot from more than one camera gets each one numbered — "Games Room · Point
  // 1" to "· Point 3" — in the export's own order, so no two arrows in a tour say the
  // same thing and the name under Back says which spot you are standing on. A place
  // with one camera keeps its plain name.
  const place = (id) => labels[id] ?? fallback;
  const total = {};
  for (const s of data.scenes) total[place(s.id)] = (total[place(s.id)] ?? 0) + 1;
  const seen = {};
  const names = {};
  for (const s of data.scenes) {
    const p = place(s.id);
    seen[p] = (seen[p] ?? 0) + 1;
    names[s.id] = own[s.id] ?? (total[p] > 1 ? `${p} · Point ${seen[p]}` : p);
  }

  // Every PLACE in the tour, once, in the export's own order, each pointing at the first
  // camera shot there. This is what the viewer's jump menu offers: a visitor thinks in
  // places ("the pool"), not in cameras, and a menu listing "Lift Lobby · Point 1"
  // through "· Point 7" is a menu nobody reads to the end.
  const places = [];
  const firstOf = {};
  for (const s of data.scenes) {
    const p = place(s.id);
    if (firstOf[p]) continue;
    firstOf[p] = s.id;
    places.push({ id: s.id, label: p });
  }

  return {
    map: map
      ? {
          ...map,
          points: map.points
            .filter((pt) => firstOf[pt.place])
            .map((pt) => ({ ...pt, id: firstOf[pt.place] })),
        }
      : null,
    // The shape PanoViewer takes: one tile set, offered as "day" only.
    data: { day: data, night: data },
    tiles: { day: tiles, night: tiles },
    label: (id) => names[id] ?? place(id),
    places,
    // Which place a scene belongs to, so the menu can mark where you are standing even
    // after the arrows have walked you to another camera in the same room.
    placeOf: (id) => place(id),
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
