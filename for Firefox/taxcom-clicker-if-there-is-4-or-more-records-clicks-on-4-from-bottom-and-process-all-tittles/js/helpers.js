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