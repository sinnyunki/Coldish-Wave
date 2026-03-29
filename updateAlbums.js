const fs = require("fs");
const fetch = require("node-fetch");

/*
  Apple Music Playlist FREE Scraper
*/

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
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!res.ok) {
    throw new Error("Fetch failed: " + res.status);
  }

  return await res.text();
}

function extractJSON(html) {
  const match = html.match(
    /<script id="serialized-server-data"[^>]*>(.*?)<\/script>/
  );

  if (!match) {
    throw new Error("Serialized data not found");
  }

  return JSON.parse(match[1]);
}

function parseAlbums(data) {
  const tracks = data[0].data.sections[0].items;

  return tracks.map(t => ({
    title: t.title,
    artist: t.subtitle,
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
    const json = extractJSON(html);
    const albums = parseAlbums(json);

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

run();