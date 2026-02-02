const DIR = "/ics/";
const ERR_IMG  = "error.png";
const DEF_SIZE = 64;

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (url.pathname === "/resizeIcon.js") {
    event.respondWith((async () => {
      const w = parseInt(url.searchParams.get("w")) || DEF_SIZE;
      let file = url.searchParams.get("p") || ERR_IMG;

      if (!/^[\w.\-]+$/.test(file)) file = ERR_IMG;

      let imgPath = DIR + file;

      try {
        let res = await fetch(imgPath);

        if (!res.ok) {
          imgPath = DIR + ERR_IMG;
          res = await fetch(imgPath);
        }

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

      } catch {
        const res = await fetch(DIR + ERR_IMG);
        const blob = await res.blob();
        return new Response(blob, { headers: { "Content-Type": "image/png" } });
      }

    })());
  }
});