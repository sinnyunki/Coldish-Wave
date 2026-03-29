import fs from "fs";

const PLAYLISTS = [
  { name: "pm2", id: "pl.u-xlyNjvVtkpmLMy" },
  { name: "pm5", id: "pl.u-oZyl4JguR06J4K" }
];

async function fetchPlaylist(p) {
  console.log("Fetching:", p.name);

  const url = `https://itunes.apple.com/lookup?id=${p.id}&entity=song&country=kr`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch playlist");
  }

  const json = await res.json();

  if (!json.results || json.results.length === 0) {
    throw new Error("Playlist empty");
  }

  // 첫 항목은 플레이리스트 정보 → 제외
  const tracks = json.results.slice(1);

  const albums = tracks.map(t => ({
    title: t.collectionName,
    artist: t.artistName,
    cover: t.artworkUrl100.replace("100x100", "600x600"),
    url: t.collectionViewUrl
  }));

  return {
    category: p.name,
    albums
  };
}

async function run() {
  const result = [];

  for (const p of PLAYLISTS) {
    const data = await fetchPlaylist(p);
    result.push(data);
  }

  fs.mkdirSync("./data", { recursive: true });

  fs.writeFileSync(
    "./data/albums.json",
    JSON.stringify(result, null, 2)
  );

  console.log("✅ albums.json updated");
}

run();