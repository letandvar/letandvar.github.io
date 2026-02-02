self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (url.pathname === "/resizeIco.js" && url.searchParams.has("p")) {
    event.respondWith(handleImage(url));
  }
});

async function handleImage(url) {
  try {
    const file = url.searchParams.get("p");
    const w = parseInt(url.searchParams.get("w")) || 64;

    if (!/^[\w.\-]+$/.test(file)) {
      throw new Error("Invalid filename");
    }


    const imgPath = `/ics/${file}`;

    const res = await fetch(imgPath);
    if (!res.ok) throw new Error("Image not found");

    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(w, w);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, w);

    const outBlob = await canvas.convertToBlob({ type: "image/png" });

    return new Response(outBlob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000"
      }
    });

  } catch (e) {
    return errorSVG();
  }
}

function errorSVG() {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <rect width="100%" height="100%" fill="#111"/>
      <text x="50%" y="50%" fill="white" font-size="10"
        text-anchor="middle" dominant-baseline="middle">ERR</text>
    </svg>`,
    { headers: { "Content-Type": "image/svg+xml" } }
  );
}