
/** создает tml-лемент для вставки в страницу */
function create(htmlStr) {
    log("in function:", arguments.callee.name);
    var
        frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}
    
/* устанавливает стиль бордера */
function setBorderStyle(border_style) {
    log("in function:", arguments.callee.name);
    document.body.style.border = border_style;
}
    
/**
* возвращает сохраненный урл из сессии, или дефолтный - default_url
*/
function getPrevUrl(default_url) {
    log("in function:", arguments.callee.name);
    if(window.sessionStorage.getItem("prev_url")) {
        return window.sessionStorage.getItem("prev_url");
    } else {
        return default_url;
    }
}

/**
* сохраняет урл в сессию
*/
function setPrevUrl(url) {
    log("in function:", arguments.callee.name);
    window.sessionStorage.setItem("prev_url", url);
}


/* две функции для получения и установки признака что делать в ЭПЛ - возвращатсья на список или обрабатывать тайтлы */
function getBackToList() {
    log("in function:", arguments.callee.name);
    if(window.sessionStorage.getItem("should_back_to_list")) {
        return window.sessionStorage.getItem("should_back_to_list") === 'true';
    } else {
        return false;
    }
}

function setBackToList(value) {
    log("in function:", arguments.callee.name);
    window.sessionStorage.setItem("should_back_to_list", value);
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