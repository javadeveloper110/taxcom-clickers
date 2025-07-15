/**
* возвращает сохраненный урл из сессии, или дефолтный - default_url
*/
function getPrevUrl(default_url) {
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
    window.sessionStorage.setItem("prev_url", url);
}


/* две функции для получения и установки признака что делать в ЭПЛ - возвращатсья на список или обрабатывать тайтлы */
function getBackToList() {
    if(window.sessionStorage.getItem("should_back_to_list")) {
        return window.sessionStorage.getItem("should_back_to_list") === 'true';
    } else {
        return false;
    }
}

function setBackToList(value) {
    window.sessionStorage.setItem("should_back_to_list", value);
}