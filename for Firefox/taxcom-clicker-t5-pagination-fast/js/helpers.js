function rtrim(string, character) {  
  character = character || '';

  if (!character) {
    return string.trimEnd();
  }

  if (!string.endsWith(character)) {
    return string;
  }

  while (string.lastIndexOf(character) > -1 && string.lastIndexOf(character) == string.length-1) {
    const end = string.lastIndexOf(character);
    string = string.substr(0, end);
  }

  return string;
}

function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

function log() {
    console.log(...arguments);
}