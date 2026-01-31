const editor = document.getElementById("editor");
const suggestions = document.getElementById("suggestions");

let keywords = [];

fetch("/data.json")
  .then(r => r.json())
  .then(data => {
    keywords = data;
    
    
  })
  .catch(err => {
    alert("Error loading data: " + err);
    });

editor.oninput = () => {

editorEvent();

  const pos = editor.selectionStart;
  const textBefore = editor.value.slice(0, pos);


  const match = textBefore.match(/([<]?[A-Za-z_$][\w\.\-]*|\.[\w]*)$/);

  if (!match) {
    suggestions.innerHTML = "";
    return;
  }

  const fullWord = match[1];

  const lowFullWord = fullWord.toLowerCase();

  let filtered = keywords.filter(k => {
    const lowK = k.toLowerCase();

    if (fullWord.startsWith('.')) {
      return lowK.startsWith(lowFullWord);
    }

    if (fullWord.includes('.')) {
      
      if (lowK.startsWith(lowFullWord)) return true;

      const parts = lowFullWord.split('.');
      const lastPart = '.' + parts[parts.length - 1];
      return lowK.startsWith(lastPart) && k.startsWith('.');
    }

    return lowK.startsWith(lowFullWord);
  });


  suggestions.innerHTML = "";
  if (filtered.length === 0 || (filtered.length === 1 && filtered[0] === fullWord)) return;

  filtered.slice(0, 15).forEach(k => {
    const div = document.createElement("div");
    div.textContent = k;

    div.addEventListener("mousedown", (e) => {
      e.preventDefault();
      
      const posNow = editor.selectionStart;
      let before = "";


      if (k.startsWith('.') && fullWord.includes('.')) {

        const lastDotIndex = textBefore.lastIndexOf('.');
        before = editor.value.slice(0, lastDotIndex);
      } else {

        before = editor.value.slice(0, posNow - fullWord.length);
      }

      const after = editor.value.slice(posNow);
      editor.value = before + k + after;

      const newPos = before.length + k.length;
      editor.setSelectionRange(newPos, newPos);
      suggestions.innerHTML = "";
      editor.focus();
editorEvent();
    });

    suggestions.appendChild(div);
  });
}
