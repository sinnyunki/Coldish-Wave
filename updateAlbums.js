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

async function fetchPlaylist(url) {
  const res = await fetch(url);
  const html = await res.text();

  // Apple Music 내부 JSON 추출
  const match = html.match(
    /<script id="serialized-server-data".*?>(.*?)<\/script>/
  );

  if (!match) throw new Error("Playlist data not found");

  const json = JSON.parse(match[1]);

  const tracks =
    json[0].data.sections[0].items;

  return tracks.map(t => ({
    title: t.title,
    artist: t.subtitle,
    cover: t.artwork.url.replace("{w}", "600").replace("{h}", "600"),
    url: t.href
      ? `https://music.apple.com${t.href}`
      : url
  }));
}

const result = [];

for (const p of PLAYLISTS) {
  console.log("Fetching:", p.name);

  const albums = await fetchPlaylist(p.url);

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

console.log("albums.json updated!");