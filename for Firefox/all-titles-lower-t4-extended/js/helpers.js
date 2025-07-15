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
function getT4Processed() {
    if(window.sessionStorage.getItem("t4_processed")) {
        return window.sessionStorage.getItem("t4_processed") === 'true';
    } else {
        return false;
    }
}

function setT4Processed(value) {
    window.sessionStorage.setItem("t4_processed", value);
}