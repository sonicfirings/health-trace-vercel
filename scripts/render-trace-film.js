const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const sharp = require("sharp");
const ffmpegPath = require("ffmpeg-static");

const width = 3840;
const height = 2160;
const fps = 24;
const accent = "#9dff7a";
const outFile = path.resolve(
  __dirname,
  "../../../outputs/trace-cinematic-keynote-4k.mp4",
);

const scenes = [
  { name: "intro", duration: 6 },
  { name: "split", duration: 7 },
  { name: "graph", duration: 6 },
  { name: "signals", duration: 7 },
  { name: "permissions", duration: 6 },
  { name: "finale", duration: 7 },
];

const totalFrames = scenes.reduce((sum, scene) => sum + scene.duration * fps, 0);

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function ease(value) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function smooth(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function lines(text, x, y, size, color = "#fff", weight = 500, lh = 1.06, anchor = "start") {
  return text
    .split("\n")
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * size * lh}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(line)}</text>`,
    )
    .join("");
}

function pill(x, y, label, color = accent, w = 430) {
  return `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="${w}" height="112" rx="56" fill="#0b0d0b" stroke="${color}" stroke-opacity="0.78" stroke-width="3"/>
      <circle cx="58" cy="56" r="24" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-opacity="0.75" stroke-width="2"/>
      <circle cx="58" cy="56" r="7" fill="${color}"/>
      <text x="100" y="68" font-size="32" font-weight="650" fill="#fff">${esc(label)}</text>
    </g>`;
}

function sourcePill(x, y, label, opacity = 1, scale = 1) {
  return `
    <g transform="translate(${x} ${y}) scale(${scale})" opacity="${opacity}">
      <rect x="-210" y="-54" width="420" height="108" rx="54" fill="#101110" stroke="#fff" stroke-opacity="0.14" stroke-width="2"/>
      <circle cx="-156" cy="0" r="22" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-opacity="0.75" stroke-width="2"/>
      <circle cx="-156" cy="0" r="7" fill="${accent}"/>
      <text x="-118" y="12" font-size="30" font-weight="650" fill="#fff">${esc(label)}</text>
    </g>`;
}

function base(content) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <radialGradient id="glow" cx="50%" cy="48%" r="44%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.13"/>
          <stop offset="55%" stop-color="${accent}" stop-opacity="0.035"/>
          <stop offset="100%" stop-color="#030303" stop-opacity="0"/>
        </radialGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="38"/></filter>
      </defs>
      <rect width="100%" height="100%" fill="#030303"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
      <g font-family="Inter, Segoe UI, Arial, sans-serif" letter-spacing="0">${content}</g>
    </svg>`;
}

function intro(t) {
  const first = "Every AI starts from zero.";
  const second = "What if it didn't?";
  let text = first.slice(0, Math.floor(clamp(t / 2.0) * first.length));
  if (t > 2.4 && t < 3.25) text = first.slice(0, Math.floor((1 - clamp((t - 2.4) / 0.85)) * first.length));
  if (t >= 3.25) text = second.slice(0, Math.floor(clamp((t - 3.25) / 1.35) * second.length));
  const logo = ease((t - 4.85) / 0.8);
  return base(`
    <g transform="translate(1920 990)">
      <text text-anchor="middle" font-size="190" font-weight="520" fill="#fff">${esc(text)}<tspan fill="${accent}">|</tspan></text>
    </g>
    <g opacity="${logo}" transform="translate(1920 1260)">
      <circle cx="0" cy="0" r="260" fill="${accent}" opacity="0.06" filter="url(#soft)"/>
      <text text-anchor="middle" font-size="260" font-weight="650" letter-spacing="48" fill="#fff">TRACE</text>
      <text y="150" text-anchor="middle" font-size="42" fill="#fff" opacity="0.48">The personal context layer for AI.</text>
    </g>`);
}

function split(t) {
  const status = ["Connecting Trace", "Loading Personal Context", "Permission Verified", "Context Ready"];
  const answer = ease((t - 4.4) / 0.9);
  return base(`
    ${lines("The same prompt.\nA different kind of memory.", 250, 255, 118)}
    <rect x="1430" y="360" width="980" height="96" rx="48" fill="#111" stroke="#fff" stroke-opacity="0.22"/>
    <text x="1920" y="423" text-anchor="middle" font-size="42" font-weight="650" fill="#fff">What should I focus on today?</text>
    <g transform="translate(250 620)">
      <rect width="1530" height="980" rx="72" fill="#0d0d0d" stroke="#fff" stroke-opacity="0.16" stroke-width="3"/>
      <text x="86" y="126" font-size="38" font-weight="700" letter-spacing="18" fill="#fff" opacity="0.52">STANDARD AI</text>
      <line x1="86" y1="210" x2="1440" y2="210" stroke="#fff" stroke-opacity="0.12"/>
      ${lines("You could start with your most important task,\navoid distractions, and use a timer\nto stay focused.", 86, 510, 66)}
      <rect x="86" y="770" width="410" height="76" rx="38" fill="#fff" fill-opacity="0.03" stroke="#fff" stroke-opacity="0.09"/>
      <rect x="520" y="770" width="350" height="76" rx="38" fill="#fff" fill-opacity="0.03" stroke="#fff" stroke-opacity="0.09"/>
      <rect x="894" y="770" width="330" height="76" rx="38" fill="#fff" fill-opacity="0.03" stroke="#fff" stroke-opacity="0.09"/>
      <text x="118" y="820" font-size="30" fill="#fff" opacity="0.42">Prioritize work</text>
      <text x="552" y="820" font-size="30" fill="#fff" opacity="0.42">Avoid distractions</text>
      <text x="926" y="820" font-size="30" fill="#fff" opacity="0.42">Use a timer</text>
    </g>
    <g transform="translate(1990 620)">
      <rect width="1600" height="980" rx="72" fill="#0b120b" stroke="${accent}" stroke-opacity="0.26" stroke-width="3"/>
      <text x="86" y="126" font-size="38" font-weight="700" letter-spacing="18" fill="${accent}" opacity="0.72">AI + TRACE</text>
      <line x1="86" y1="210" x2="1510" y2="210" stroke="#fff" stroke-opacity="0.18"/>
      ${status
        .map((s, i) => {
          const on = ease((t - (1.05 + i * 0.52)) / 0.28);
          return `<g opacity="${on}" transform="translate(86 ${285 + i * 100})"><rect width="1428" height="72" rx="36" fill="#000" fill-opacity="0.25" stroke="#fff" stroke-opacity="0.11"/><circle cx="36" cy="36" r="10" fill="${accent}"/><text x="72" y="48" font-size="31" font-weight="650" fill="#fff" opacity="0.76">${s}</text></g>`;
        })
        .join("")}
      <g opacity="${answer}" transform="translate(86 735)">
        <rect width="1428" height="190" rx="42" fill="#000" fill-opacity="0.28" stroke="${accent}" stroke-opacity="0.23"/>
        ${lines("Your highest focus window is 9:30 to 11:00 AM.\nI've reorganized your schedule accordingly.", 50, 76, 48)}
      </g>
    </g>`);
}

function graph(t) {
  const draw = clamp((t - 1.0) / 2.6);
  return base(`
    ${lines("Here's why.", 240, 260, 170)}
    <rect x="240" y="420" width="2480" height="1120" rx="64" fill="#070807" stroke="#fff" stroke-opacity="0.18" stroke-width="3"/>
    <text x="330" y="525" font-size="28" font-weight="700" letter-spacing="14" fill="#fff" opacity="0.46">PERSONAL CONTEXT</text>
    <g stroke="${accent}" stroke-opacity="0.45" stroke-width="4" stroke-dasharray="14 14" fill="none" opacity="${draw}">
      <polyline points="820,656 990,656"/>
      <polyline points="1420,656 1620,656"/>
      <polyline points="1205,712 1205,870"/>
      <polyline points="820,926 990,926"/>
      <polyline points="1205,982 1205,1140"/>
      <polyline points="820,1196 990,1196"/>
      <polyline points="1420,1196 1620,1196"/>
      <polyline points="1835,712 1835,1140"/>
    </g>
    ${pill(390, 600, "Sleep", "rgba(183,151,255,0.9)")}
    ${pill(990, 600, "Calendar", "rgba(109,211,255,0.9)")}
    ${pill(1620, 600, "Meetings", "rgba(255,184,107,0.9)")}
    ${pill(390, 870, "Productivity")}
    ${pill(990, 870, "Focus")}
    ${pill(390, 1140, "Screen Time", "rgba(255,119,166,0.9)")}
    ${pill(990, 1140, "Coding", "rgba(91,230,196,0.9)")}
    ${pill(1620, 1140, "Projects", "rgba(255,255,255,0.75)")}
    <g transform="translate(2840 520)">
      <rect width="760" height="1020" rx="64" fill="#0c120c" stroke="${accent}" stroke-opacity="0.22" stroke-width="3"/>
      <text x="80" y="160" font-size="28" font-weight="700" letter-spacing="14" fill="${accent}" opacity="0.72">PERSONAL CONTEXT</text>
      ${lines("It does not\nremember a chat.\nIt remembers\npatterns.", 80, 270, 70)}
      ${lines("Sleep, calendar pressure,\ncoding output, projects,\nand attention signals become\none usable context layer.", 80, 660, 36, "rgba(255,255,255,0.58)", 400, 1.35)}
    </g>`);
}

function signals(t) {
  const merge = clamp((t - 0.7) / 4.9);
  const context = ease((t - 3.65) / 1.15);
  const text = ease((t - 4.85) / 1.1);
  const names = ["Apple Health", "Calendar", "GitHub", "Cursor", "Slack", "Spotify", "Oura", "Screen Time"];
  const pos = [
    [-650, -260],
    [-220, -260],
    [220, -260],
    [650, -260],
    [-650, 260],
    [-220, 260],
    [220, 260],
    [650, 260],
  ];
  const pills = names
    .map((n, i) => {
      const p = smooth(merge);
      const x = 1440 + pos[i][0] * (1 - p);
      const y = 1170 + pos[i][1] * (1 - p);
      return sourcePill(x, y, n, clamp(1 - p * 1.18), 1 - p * 0.46);
    })
    .join("");
  return base(`
    ${lines("Your life already produces\nmillions of signals.", 260, 260, 140)}
    ${pills}
    <g opacity="${context}" transform="translate(1440 1170)">
      <rect x="-310" y="-170" width="620" height="340" rx="118" fill="${accent}" opacity="0.08" filter="url(#soft)"/>
      <rect x="-250" y="-136" width="500" height="272" rx="96" fill="#071007" stroke="${accent}" stroke-opacity="0.2" stroke-width="2"/>
      <text y="-30" text-anchor="middle" font-size="28" font-weight="700" letter-spacing="12" fill="${accent}">PERSONAL</text>
      <text y="58" text-anchor="middle" font-size="72" font-weight="650" fill="#fff">Context</text>
    </g>
    <g opacity="${text}" transform="translate(2160 1082)">
      ${lines("Data is abundant.\nUnderstanding is scarce.", 0, 0, 112)}
    </g>`);
}

function permissionsScene(t) {
  const cards = [
    ["ChatGPT", "Productivity", "Writing Style", "Health"],
    ["Claude", "Coding", "Projects", "Personal"],
    ["Cursor", "Code Style", "Repository Context", "Calendar"],
  ];
  return base(`
    ${lines("You own your context.", 260, 310, 155)}
    ${lines("Not your AI provider.", 260, 510, 92, "rgba(255,255,255,0.42)")}
    ${cards
      .map((c, i) => {
        const o = ease((t - 0.8 - i * 0.22) / 0.7);
        const x = 260 + i * 1120;
        return `<g opacity="${o}" transform="translate(${x} 760)">
          <rect width="1000" height="760" rx="64" fill="#0d0e0d" stroke="#fff" stroke-opacity="0.14" stroke-width="3"/>
          <text x="70" y="115" font-size="58" font-weight="650" fill="#fff">${c[0]}</text>
          <rect x="70" y="230" width="860" height="96" rx="32" fill="${accent}" fill-opacity="0.07" stroke="${accent}" stroke-opacity="0.24"/>
          <rect x="70" y="360" width="860" height="96" rx="32" fill="${accent}" fill-opacity="0.07" stroke="${accent}" stroke-opacity="0.24"/>
          <rect x="70" y="490" width="860" height="96" rx="32" fill="#000" fill-opacity="0.24" stroke="#fff" stroke-opacity="0.09"/>
          <text x="115" y="292" font-size="38" fill="#fff">${c[1]}</text>
          <text x="115" y="422" font-size="38" fill="#fff">${c[2]}</text>
          <text x="115" y="552" font-size="38" fill="#fff" opacity="0.45">${c[3]}</text>
        </g>`;
      })
      .join("")}`);
}

function finale(t) {
  const a = t < 2 ? "Foundation models gave AI intelligence.".slice(0, Math.floor((t / 2) * 45)) : "";
  const b = t >= 2.4 && t < 4.2 ? "Trace gives AI continuity.".slice(0, Math.floor(((t - 2.4) / 1.8) * 27)) : "";
  const c = t >= 4.5 ? "Personal context should be a primitive of AI.".slice(0, Math.floor(clamp((t - 4.5) / 2.0) * 45)) : "";
  const text = c || b || a;
  const logo = ease((t - 6.3) / 0.8);
  return base(`
    <text x="1920" y="960" text-anchor="middle" font-size="160" font-weight="520" fill="#fff">${esc(text)}<tspan fill="${accent}">|</tspan></text>
    <g opacity="${logo}">
      <circle cx="1920" cy="1210" r="300" fill="${accent}" opacity="0.07" filter="url(#soft)"/>
      <text x="1920" y="1280" text-anchor="middle" font-size="250" font-weight="650" letter-spacing="48" fill="#fff">TRACE</text>
    </g>`);
}

function render(scene, t) {
  if (scene === "intro") return intro(t);
  if (scene === "split") return split(t);
  if (scene === "graph") return graph(t);
  if (scene === "signals") return signals(t);
  if (scene === "permissions") return permissionsScene(t);
  return finale(t);
}

async function main() {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

  const ffmpeg = spawn(ffmpegPath, [
    "-y",
    "-f",
    "image2pipe",
    "-framerate",
    String(fps),
    "-i",
    "-",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "veryfast",
    "-crf",
    "18",
    "-movflags",
    "+faststart",
    outFile,
  ], { stdio: ["pipe", "inherit", "inherit"] });

  let sceneStart = 0;
  let frame = 0;
  for (const scene of scenes) {
    const frames = scene.duration * fps;
    for (let i = 0; i < frames; i += 1) {
      const svg = render(scene.name, i / fps);
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      if (!ffmpeg.stdin.write(png)) {
        await new Promise((resolve) => ffmpeg.stdin.once("drain", resolve));
      }
      frame += 1;
      if (frame % 48 === 0) {
        process.stdout.write(`Rendered ${frame}/${totalFrames} frames\r`);
      }
    }
    sceneStart += frames;
  }

  ffmpeg.stdin.end();
  await new Promise((resolve, reject) => {
    ffmpeg.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with ${code}`));
    });
  });
  console.log(`\nWrote ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
