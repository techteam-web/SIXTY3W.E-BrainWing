// The Western Express Highway as ONE clean line, for the Location map's own drawing of it.
//
// OpenStreetMap maps it as it is built: two one-way carriageways, flyovers, slip roads
// and service roads alongside — over a hundred separate ways. Drawn as the basemap draws
// them, that is a bundle of overlapping gold strands, which is what made the highway look
// untidy. This is their centre: every way named "Western Express Highway" (trunk and
// motorway) between Vile Parle and Dahisar, from the Overpass API on 26 Oct 2026, merged
// by taking the median longitude in each 0.001° band of latitude, lightly smoothed and
// simplified (Douglas–Peucker, ~3 m). [lng, lat], south to north.
//
// © OpenStreetMap contributors, ODbL — the same data the basemap's tiles are built from.
export const WEH_LINE = [
  [72.84982, 19.09526], [72.8519, 19.09746], [72.85352, 19.09966], [72.85445, 19.10186],
  [72.85438, 19.10286], [72.85419, 19.10386], [72.85445, 19.10766], [72.85481, 19.11146],
  [72.85525, 19.11526], [72.85631, 19.12286], [72.85631, 19.12386], [72.85617, 19.12486],
  [72.85551, 19.12786], [72.85537, 19.12886], [72.85493, 19.13986], [72.855, 19.14086],
  [72.85514, 19.14186], [72.85583, 19.14486], [72.85616, 19.14686], [72.85685, 19.15386],
  [72.85754, 19.15886], [72.85846, 19.16606], [72.85874, 19.16846], [72.859, 19.17146],
  [72.85901, 19.17306], [72.85864, 19.17966], [72.85849, 19.18126], [72.85841, 19.18286],
  [72.85846, 19.18486], [72.85843, 19.18786], [72.85869, 19.18946], [72.85937, 19.19266],
  [72.86024, 19.19586], [72.86086, 19.19886], [72.86112, 19.19986], [72.8615, 19.20086],
  [72.86201, 19.20186], [72.8648, 19.20546], [72.86614, 19.20726], [72.8673, 19.20906],
  [72.86828, 19.21086], [72.86829, 19.21186], [72.86817, 19.21286], [72.86794, 19.21386],
  [72.86765, 19.21486], [72.86418, 19.22486], [72.86387, 19.22586], [72.86362, 19.22686],
  [72.86344, 19.22786], [72.86335, 19.22886], [72.86333, 19.23486],
];
