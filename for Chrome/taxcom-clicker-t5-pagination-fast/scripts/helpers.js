/** обрабатывает 502 ошибку */
function fixError502(redirect) {
    log("in function:", arguments.callee.name);
    let
        hh = document.getElementsByTagName('h1'),
        errors = [
            "502 Bad Gateway".toLowerCase(),
            "504 Gateway Time-out".toLowerCase(),
        ];
    
    if(hh.length != 1 || !errors.includes(hh[0].firstChild.data.toLowerCase())) {
        return false;
    }
    // если найдена 502 - перезагружаю страницу
    location.href = redirect;
    return true;
}

/** устанавливает дефоолтные фильтра на странице at signing */
function pressEnterOnFilter() {
    log("in function:", arguments.callee.name);
    const filter = document.getElementById('filter_click');
    
    filter.click();
    
    let buttons = document.getElementsByClassName("ui-btn ui-btn-primary ui-btn-icon-search main-ui-filter-field-button  main-ui-filter-find filter-container-find");
    
    if(buttons.length == 1) {
        buttons[0].click();
        return true;
    }
    
    return false;
}
/**  */
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

function showFilterWarning() {
    document.body.insertBefore(
        create('<h5 style="border: 2px solid red; margin: 10px auto;padding: 5px 10px;">Слетели все фильтры. Настройте фильтры и нажмите кнопку "На подписании"</h5>'),
        document.body.childNodes[0]
    );
}

function checkFilters() {
    log("in function:", arguments.callee.name);
    let filters = document.querySelectorAll('.filter-conteaner-search .main-ui-filter-search-square');
    log("найдено фильтров:", filters.length);
    return filters.length > 0;
}