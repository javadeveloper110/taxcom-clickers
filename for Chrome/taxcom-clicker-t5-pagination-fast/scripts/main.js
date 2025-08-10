

class Clicker {
    PLUGIN_ID = 't5-pagination-fast';
    SESSION_KEY_LAST_PAGE_URL = 'last_page_url-'+ this.PLUGIN_ID;
    BORDER_STYLE_EMPTY = '5px solid #a1a1a1';
    BORDER_STYLE_WARNING = '5px solid yellow';
    BORDER_STYLE_ERROR = '5px solid red';
    BORDER_STYLE_OK = '5px solid green';
    
    MILEAGE_PATTERN = '^показания одометра: [0-9]+$';
    
    DELAY_BORDER_BLINK_MS = 500; // бордер мигает раз в 1 секунду
    DELAY_LINK_CLICK_MS = 5000; // задержка между мереходами по страницам
    DELAY_PAGE_RELOAD = 5000; // через сколько перезагружать страницу
    
    URL_START = 'https://epl.taxcom.ru/at_signing/?start-t5-pagination-fast';
    URL_AT_SIGNING = 'https://epl.taxcom.ru/at_signing/';
    TITLE_T5 = 'т5 - показания одометра при заезде';
    
    URL_PATTERN_MAIN = '^https://epl.taxcom.ru/$'; // тут жму на кнопку "Подписать"
    URL_PATTERN_START_PLUGIN = '^https://epl.taxcom.ru/at_signing/\\?start-t5-pagination-fast'; // запуск плагина
    URL_PATTERN_AT_SIGNING = '^https://epl.taxcom.ru/at_signing/'; // тут собираю урлы ЭПЛов
    URL_PATTERN_WAYBILL = '^https://epl.taxcom.ru/waybill/[0-9]{7,8}/'; // тут жму "открыть" в блоке Т6
    URL_PATTERN_WAYBILL_T5 = '^https://epl.taxcom.ru/waybill/[0-9]{7,8}/5/'; // тут жму "подписать и отправить"
    
    PAGE_ID_MAIN = 'main'; // тут жму на кнопку "Подписать"
    PAGE_ID_START = 'start'; // запуск плагина
    PAGE_ID_AT_SIGNING = 'at-signing'; // тут собираю урлы ЭПЛов
    PAGE_ID_WAYBILL = 'waybill'; // тут жму "открыть" в блоке Т6
    PAGE_ID_WAYBILL_T5 = 'waybill_t5'; // тут жму "подписать и отправить"
    
    setPluginVersion() { window.sessionStorage.setItem("plugin_number", this.PLUGIN_ID); }
    
    checkPluginVersion() {
        let res = window.sessionStorage.getItem("plugin_number") == this.PLUGIN_ID;
        if(res) {
            let
                fragment = create('<div>Плагин: t5-pagination-fast. Обрабатывает ЭПЛ на сайте epl.taxcom.ru. Обрабатывает все ЭПЛ на странице /at_signing, с пагинацией, запоминает номер страницы. Проверяет фильтры. Обрабатывает ошибку 502.</div>');
            // You can use native DOM methods to insert the fragment:
            document.body.insertBefore(fragment, document.body.childNodes[0]);
        }
        
        return res;
    }
    
    /**
     * функция поиска ожидания кнопки на странице "Тайтл 5"
     */
    getWaybillTitle5ButtonSign() {
        log("getWaybillTitle5ButtonSign");
        let
            buttons = document.querySelectorAll('.col-md-12 button.btn'),
            btn = false;
        // ищу нужную
        
        for(let i = 0; i < buttons.length; i++) {
            let regex = /подписать/;
            if(!buttons[i].disabled && regex.test(buttons[i].firstChild.textContent.toLowerCase())) {
                btn = buttons[i];
                break;
            }
        }
        return btn;
    }
    
    /** проверяет наличие "крутилки" после нажатия на кнопку в тайтле. если крутилки нет - редирект */
    checkCoverLayer(timerInfo) {
        log("checkCoverLayer");
        let
            cover = document.getElementsByClassName('cover'),
            coverExists = cover.length > 0 && !cover[0].classList.contains('d-none');
        // если крутилка есть - жду
        if(coverExists) {
            log("крутилка найдена - жду");
            return;
        }
        // иначе - останавливаю таймер и редирект
        clearInterval(timerInfo['id']);
        let redirect_url = this.getLastPageUrl();
        log("крутилка не найдена - переход на ", redirect_url);
        location.href = redirect_url;
    }
    
    /**
     * выполняет действия в тайтле 5
     */
    actionWaybillTitle() {
        if(!this.checkPluginVersion()) {
            return;
        }
        log("actionWaybillTitle");
        // 502 ошибка
        if(fixError502(this.URL_AT_SIGNING)) {
            return;
        }
        // ищу кнопку
        let btn = this.getWaybillTitle5ButtonSign();
        if(btn) {
            log("кнопка найдена - кликаю. каждые три секунды проверяю наличие крутилки");
            this.setBorderStyle(this.BORDER_STYLE_OK, false);
            btn.click();
            
            let timerInfo = {}; // сюда кладу айди таймера
            timerInfo['id'] = setInterval(this.checkCoverLayer, 3000, timerInfo);// каждые три секунды проверяю наличие крутилки
        } else {
            log("кнопка не найдена или неактивна - перехожу на список");
            this.setBorderStyle(this.BORDER_STYLE_WARNING);
            location.href = this.getLastPageUrl();
        }
    }
    
    /**
     * возвращает кнопку "следующая"
     */
    getPaginationButtonNext() {
        log("getPaginationButtonNext");
        let all_links = document.querySelectorAll('.main-grid-panel-cell-pagination .main-ui-pagination-arrow');
        for(let i=0; i<all_links.length;i++) {
            if(all_links[i].innerText.toLowerCase() == 'следующая' && all_links[i].href) {
                return all_links[i];
            }
        }
        return false;
    }
    
    /**
     * забывает урл текущей обрабатываемой страницы списка в сессии
     */
    forgetLastPageUrl() {
        log("forgetLastPageUrl");
        window.sessionStorage.setItem(this.SESSION_KEY_LAST_PAGE_URL, undefined);
    }
    /**
     * запоминает урл текущей обрабатываемой страницы списка в сессию - для пагинации
     */
    rememberLastPageUrl() {
        log("запоминаю последнюю страницу:", document.location.href);
        window.sessionStorage.setItem(this.SESSION_KEY_LAST_PAGE_URL, document.location.href);
    }
    
    /**
     * возвращает урл текущей обрабатываемой страницы списка - для пагинации
     */
    getLastPageUrl() {
        let url = window.sessionStorage.getItem(this.SESSION_KEY_LAST_PAGE_URL);
        if(typeof url != 'undefined') {
            return url;
        } else {
            return this.URL_AT_SIGNING;
        }
    }
    
    /**
     * выполняет действия на списке ЭПЛ
     */
    actionStart() {
        this.forgetLastPageUrl();
        this.setPluginVersion();
        this.setBorderStyle(this.BORDER_STYLE_OK, true);
        location.href = this.getLastPageUrl();
    }
    actionAtSigning() {
        if(!this.checkPluginVersion()) {
            return;
        }
        log("actionAtSigning");
        // 502 ошибка
        if(fixError502(this.URL_AT_SIGNING)) {
            return;
        }
        
        if(!checkFilters()) {
            this.setBorderStyle(this.BORDER_STYLE_WARNING, false);
            // пытаюсь кликнуть по фильтру
            if(pressEnterOnFilter()) {
                location.href = this.URL_AT_SIGNING;
            }
            // не получилось
            showFilterWarning();
            return;
        }
        
        //
        let link = this.getNextNotProcessedEwbLink();
        let next_button = this.getPaginationButtonNext();//.main-ui-pagination
        
        // если ссылка найдена - добавляю в обработанные и перехожу по ней
        if(link) {
            this.setBorderStyle(this.BORDER_STYLE_OK, false);
            this.markLinkAsProcessed(link.innerText);
            // запоминаю урл страницы списка
            this.rememberLastPageUrl();
            link.click();
        } else if(next_button) {
            this.setBorderStyle(this.BORDER_STYLE_OK, false);
            log("перехожу на следующую страницу");
            location.href = next_button.href;
        } else {
            this.setBorderStyle(this.BORDER_STYLE_OK, false);
            this.clearProcessedLinksList();
            this.redirectToStart();
        }
    }
    
    redirectToStart(msg) {
        log("redirectToStart");
        location.href = this.URL_START;
    }
    
    /**
     * для указанного блока проверяет наличие заполненного пробега
     */
    blockHasMileageAssigned(block) {
        // ищу упоминание пробега
        let labels = block.querySelectorAll('div label.main-cont');
        let pattern = new RegExp(this.MILEAGE_PATTERN);
		
        for(let i = 0; i < labels.length; i++) {
            // блок текста с упоминанием пробега найден
            if(pattern.test(labels[i].innerText.toLowerCase().trim())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * урл неизвестен
     */
    actionUndefined() {
        if(!this.checkPluginVersion()) {
            return;
        }
        log("ХЗ куда я попал - тут меня быть не должно");
        // 502 ошибка
        if(fixError502(this.URL_AT_SIGNING)) {
            return;
        }
        this.setBorderStyle(this.BORDER_STYLE_ERROR, true);
    }
    
    /**
     * выполняет действия на странице ЭПЛ
     */
    actionWaybill() {
        if(!this.checkPluginVersion()) {
            return;
        }
        log("actionWaybill");
        // 502 ошибка
        if(fixError502(this.URL_AT_SIGNING)) {
            return;
        }
        log("ищу кнопку 'заполнить'");
        // все блоки с тайтлами
        let
            blocks = document.querySelectorAll('.order-md-1 .card'),//a.btn.btn-green
            btn = false,
            header;
        
        for(let i = 0; i < blocks.length; i++) {
            // нужен только пятый блок
            // сравниваю заголовок блока
            header = blocks[i].querySelector('.accordion-button');
            // если заголовка нет - значит сломалась структура документа
            if(!header) {
                this.setBorderStyle(this.BORDER_STYLE_ERROR, true);
                console.error("не найден заголовок блока");
                return;
            }
            // если это не пятый - пропускаю
            if(header.textContent.toLowerCase().trim() != this.TITLE_T5) {
                continue;
            }
            // пятый, но пробег не заполнен
            if(!this.blockHasMileageAssigned(blocks[i])) {
                break;
            }
            
            // пробег заполнен - ищу кнопку "подписать"
            btn = blocks[i].querySelector('a.btn.btn-green');
            
            if(btn && btn.firstChild.textContent.toLowerCase() == 'заполнить') {
                break;
            } else {
                btn = false;
            }
        }
        // 
        if(!btn) {
            log("кнопка не нашлась - возвращаюсь к списку");
            /* кнопка не нашлась - возвращаюсь к списку */
            this.setBorderStyle(this.BORDER_STYLE_WARNING, true);
            location.href = this.getLastPageUrl();
        } else {
            log("нашлась - кликаю");
            this.setBorderStyle(this.BORDER_STYLE_OK, false);
            btn.click();
        }
    }
    
    /**
     * определяет открытую страницу и возвращает ее ИД
     */
	getCurrentLocation(url) {
		let
            pattern,
            LOCATIONS = {};
            
        LOCATIONS[this.PAGE_ID_START]      = this.URL_PATTERN_START_PLUGIN;
        LOCATIONS[this.PAGE_ID_AT_SIGNING] = this.URL_PATTERN_AT_SIGNING;
        LOCATIONS[this.PAGE_ID_WAYBILL_T5] = this.URL_PATTERN_WAYBILL_T5;
        LOCATIONS[this.PAGE_ID_WAYBILL]    = this.URL_PATTERN_WAYBILL;
        LOCATIONS[this.PAGE_ID_MAIN]       = this.URL_PATTERN_MAIN;
        
		for(let id in LOCATIONS) {
			pattern = new RegExp(LOCATIONS[id]);
			if(pattern.test(url)) {
				return id;
			}
		}
		return undefined;
	}
    
    /**
     * возвращает полное имя элемента в сессии по ключу
     */
    getSessionKey(name) {
        return this.PLUGIN_ID + name;
    }
    
    constructor() {}
  
    run(url) {
        log("старт");
        /* определяю какая страница открыта */
        let page_id = this.getCurrentLocation(url);
        switch(page_id) {
            case this.PAGE_ID_START:
                this.actionStart();
                break;
            case this.PAGE_ID_AT_SIGNING:
                this.actionAtSigning();
                break;
            case this.PAGE_ID_WAYBILL:
                this.actionWaybill();
                break;
            case this.PAGE_ID_WAYBILL_T5:
                this.actionWaybillTitle();
                break;
            default:
                this.actionUndefined();
                break;
        }
  }
  
    /**
     * устанавливает стиль бордера
     */
    setBorderStyle(border_style, blink) {
        log("setBorderStyle");
        if(blink) {
            setInterval(function(border_style) {
                if(document.body.style.border != border_style) {
                    document.body.style.border = border_style;
                } else {
                    document.body.style.border = this.BORDER_STYLE_EMPTY;
                }
            }, this.DELAY_BORDER_BLINK_MS, border_style);
        } else {
            document.body.style.border = border_style;
        }
    }
    
    /**
     * добавляет ссылку в проверенные
     * @return bool
     */
    markLinkAsProcessed(ewb_number) {
        log("markLinkAsProcessed");
        window.sessionStorage.setItem(this.getSessionKey(ewb_number), 1);
    }
    
    /**
     * очищает список проверенных ссылок
     * @return bool
     */
    clearProcessedLinksList() {
        log("clearProcessedLinksList");
        window.sessionStorage.clear();
    }
  
  /**
   * проверяет - была ли обработана ссылка с указанным номером
   * @return bool
   */
    checkIfWebIsProcessed(ewb_number) {
        log("checkIfWebIsProcessed");
        return window.sessionStorage.getItem(this.getSessionKey(ewb_number)) !== null;
    }
  
  /* возвращает объект следующей необработанной ссылки */
    getNextNotProcessedEwbLink() {
        log("getNextNotProcessedEwbLink");
        // получаю все строки таблицы
        let
            trs = document.querySelectorAll('#waybill_list_tab_table tbody tr:not(.main-grid-not-count)'),// все строки таблицы с ЭПЛами 
            link = false;
        // перебираю по очереди
        for(let i=0; i < trs.length; i++) {
            link = trs[i].querySelector('td:nth-child(2) a');
            if(!link) {
                break;
            }
            // если ссылка не использовалась, то возвращаею ее
            if(!this.checkIfWebIsProcessed(link.innerText)) {
                return link;
            }
        }
        return null;
    }
}

/**
 * 
 */
let clicker = new Clicker();

clicker.run(document.location.href);