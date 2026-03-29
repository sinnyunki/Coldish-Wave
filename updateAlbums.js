const fs = require("fs");

const PLAYLISTS = [
  { name: "pm2", id: "pl.u-xlyNjvVtkpmLMy" },
  { name: "pm5", id: "pl.u-oZyl4JguR06J4K" }
];

async function fetchPlaylist(id) {
  const res = await fetch(
    `https://amp-api.music.apple.com/v1/catalog/kr/playlists/${id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch playlist");
  }

  return res.json();
}

async function run() {
  const result = [];

  for (const p of PLAYLISTS) {
    console.log("Fetching:", p.name);

    const data = await fetchPlaylist(p.id);

    const albums =
      data.data[0].relationships.tracks.data.map(t => ({
        title: t.attributes.albumName,
        artist: t.attributes.artistName,
        cover: t.attributes.artwork.url
          .replace("{w}", "600")
          .replace("{h}", "600"),
        url: t.attributes.url
      }));

    result.push({
      category: p.name,
      albums
    });
  }

  fs.mkdirSync("./data", { recursive: true });

  fs.writeFileSync(
    "./data/albums.json",
    JSON.stringify(result, null, 2)
  );

  console.log("✅ albums.json updated");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});