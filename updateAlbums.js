import fs from "fs";

const PLAYLISTS = [
  {
    name: "pm2",
    url: "https://music.apple.com/kr/playlist/codlishwave-pm2/pl.u-xlyNjvVtkpmLMy"
  },
  {
    name: "pm5",
    url: "https://music.apple.com/kr/playlist/codlishwave-pm5/pl.u-oZyl4JguR06J4K"
  }
];

async function scrapePlaylist(p) {
  console.log("Fetching:", p.name);

  const res = await fetch(p.url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    }
  });

  if (!res.ok) throw new Error("Failed to fetch playlist");

  const html = await res.text();

  // ✅ 모든 JSON script 찾기
  const scripts = [...html.matchAll(
    /<script type="application\/json">([\s\S]*?)<\/script>/g
  )];

  let playlistData = null;

  for (const s of scripts) {
    try {
      const json = JSON.parse(s[1]);

      if (
        json?.data?.[0]?.relationships?.tracks?.data
      ) {
        playlistData = json.data[0];
        break;
      }
    } catch {}
  }

  if (!playlistData)
    throw new Error("Playlist JSON not found");

  const tracks =
    playlistData.relationships.tracks.data;

  const albums = tracks.map(t => ({
    title: t.attributes.albumName,
    artist: t.attributes.artistName,
    cover: t.attributes.artwork.url
      .replace("{w}", "600")
      .replace("{h}", "600"),
    url: t.attributes.url
  }));

  return {
    category: p.name,
    albums
  };
}

async function run() {
  const result = [];

  for (const p of PLAYLISTS) {
    const data = await scrapePlaylist(p);
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