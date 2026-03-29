const fs = require("fs");
const fetch = require("node-fetch");

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

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  if (!res.ok) throw new Error("Fetch failed");

  return await res.text();
}

function extractSerializedData(html) {
  const match = html.match(
    /<script id="serialized-server-data".*?>(.*?)<\/script>/
  );

  if (!match) {
    throw new Error("Apple Music data not found");
  }

  return JSON.parse(match[1]);
}

/* ⭐ 구조 자동 탐색 */
function findTracks(obj) {
  if (!obj || typeof obj !== "object") return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findTracks(item);
      if (found) return found;
    }
  } else {
    if (obj.items && Array.isArray(obj.items)) {
      return obj.items;
    }

    for (const key of Object.keys(obj)) {
      const found = findTracks(obj[key]);
      if (found) return found;
    }
  }

  return null;
}

function parseAlbums(serialized) {
  const tracks = findTracks(serialized);

  if (!tracks) {
    throw new Error("Tracks not found");
  }

  return tracks
    .filter(t => t.artwork)
    .map(t => ({
      title: t.title || "",
      artist: t.subtitle || "",
      cover: t.artwork.url
        .replace("{w}", "600")
        .replace("{h}", "600"),
      url: "https://music.apple.com" + t.href
    }));
}

async function run() {
  const result = [];

  for (const p of PLAYLISTS) {
    console.log("Fetching:", p.name);

    const html = await fetchHTML(p.url);
    const data = extractSerializedData(html);
    const albums = parseAlbums(data);

    result.push({
      category: p.name,
      albums
    });
  }

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