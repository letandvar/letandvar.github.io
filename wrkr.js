self.onmessage = (e) => {
  if (e.data.type === "backup") {
    saveToIndexedDB(e.data.content);
  } else if (e.data.type === "load") {
    loadFromIndexedDB();
  }
};

const defaultTemplate = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title></title>
  <style></style>
</head>

<body>

  <script></script>
</body>

</html>`;

function saveToIndexedDB(text) {
  const request = indexedDB.open("backupDB", 1);

  request.onupgradeneeded = () => {
    request.result.createObjectStore("files", { keyPath: "id" });
  };

  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction("files", "readwrite");
    const store = tx.objectStore("files");
    store.put({ id: 1, content: text });
  };
}

function loadFromIndexedDB() {
  const request = indexedDB.open("backupDB", 1);

  request.onupgradeneeded = () => {
    request.result.createObjectStore("files", { keyPath: "id" });
  };

  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction("files", "readonly");
    const store = tx.objectStore("files");
    const getReq = store.get(1);

    getReq.onsuccess = () => {
      const stored = getReq.result?.content || "";


      const contentToReturn = stored.trim() === "" ? defaultTemplate : stored;

      self.postMessage({
        type: "loaded",
        content: contentToReturn
      });
    };
  };
}
