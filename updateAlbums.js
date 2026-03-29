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

  // Apple Music JSON 데이터 추출
  const match = html.match(/<script id="serialized-server-data".*?>(.*?)<\/script>/s);

  if (!match) throw new Error("Playlist data not found");

  const json = JSON.parse(match[1]);

  const tracks =
    json[0].data.sections[0].items;

  const albums = tracks.map(t => ({
    title: t.title,
    artist: t.subtitle,
    cover: t.artwork.url.replace("{w}", "600").replace("{h}", "600"),
    url: t.url
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