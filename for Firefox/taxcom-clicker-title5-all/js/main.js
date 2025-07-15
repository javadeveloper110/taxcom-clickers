/* ЗАПУСК: https://epl.taxcom.ru/at_signing/?start-title5-all */

class Clicker {
    PLUGIN_VERSION = 'title5-all';
    BORDER_STYLE_EMPTY = '5px solid #a1a1a1';
    BORDER_STYLE_WARNING = '5px solid yellow';
    BORDER_STYLE_ERROR = '5px solid red';
    BORDER_STYLE_OK = '5px solid green';
    
    MILEAGE_PATTERN = '^показания одометра: [0-9]+$';
    
    DELAY_BORDER_BLINK_MS = 500; // бордер мигает раз в 1 секунду
    DELAY_LINK_CLICK_MS = 3000; // задержка между мереходами по страницам
    DELAY_REDIRECT_TO_PREVENT_ALERTS = 60000; // при заглушеных алертах - перенаправлять на список
    DELAY_PAGE_RELOAD = 3000; // через сколько перезагружать страницу
    
    URL_START = 'https://epl.taxcom.ru/at_signing/?start-title5-all';
    URL_AT_SIGNING = 'https://epl.taxcom.ru/at_signing/';
    TITLE_T5 = 'т5 - показания одометра при заезде';
    
    URL_PATTERN_MAIN = '^https://epl.taxcom.ru/$'; // тут жму на кнопку "Подписать"
    URL_PATTERN_START_PLUGIN = '^https://epl.taxcom.ru/at_signing/\\?start-title5-all$'; // запуск плагина
    URL_PATTERN_AT_SIGNING = '^https://epl.taxcom.ru/at_signing/'; // тут собираю урлы ЭПЛов
    URL_PATTERN_WAYBILL = '^https://epl.taxcom.ru/waybill/[0-9]{7}/$'; // тут жму "открыть" в блоке Т6
    URL_PATTERN_WAYBILL_T5 = '^https://epl.taxcom.ru/waybill/[0-9]{7}/5/$'; // тут жму "подписать и отправить"
    
    PAGE_ID_MAIN = 'main'; // тут жму на кнопку "Подписать"
    PAGE_ID_START = 'start'; // запуск плагина
    PAGE_ID_AT_SIGNING = 'at-signing'; // тут собираю урлы ЭПЛов
    PAGE_ID_WAYBILL = 'waybill'; // тут жму "открыть" в блоке Т6
    PAGE_ID_WAYBILL_T5 = 'waybill_t5'; // тут жму "подписать и отправить"
    
    setPluginVersion() { window.sessionStorage.setItem("plugin_number", this.PLUGIN_VERSION); }
    checkPluginVersion() {
        let res = window.sessionStorage.getItem("plugin_number") == this.PLUGIN_VERSION;
        if(res) {
            let
                num = typeof window.sessionStorage.alerts_counter_plugin_all_titles != 'undefined' ? window.sessionStorage.alerts_counter_plugin_all_titles : 0,
                fragment = create('<div>&#11093; Т5 и ЗАПОМИНАЕТ пагинацию. перехвачено: '+ num +'</div>');
            // You can use native DOM methods to insert the fragment:
            document.body.insertBefore(fragment, document.body.childNodes[0]);
        }
        
        return res;
    }
    
    /**
     * ждет появления на странице эедемента и выполняет с ним действие
     * @param finder - функция, которая выполняет поиск и возвразает искомый элемент
     * @param callback - функция, которая выполняет действие после того как элемент был найден
     * @param number_of_attempts - количество попыток
     * @param interval - интервал между попытками (мс)
     */
    waitForElementPresented(finder, callback, number_of_attempts = 5, interval = 1000) {
        console.info("поиск элемента, осталось попыток:", number_of_attempts);
        //если количество попыток истекло - редирект на начало списка
        if(number_of_attempts <= 0) {
            console.info("элемент не найден, перехожу на список");
            this.setBorderStyle(this.BORDER_STYLE_WARNING, true);
            //setTimeout(()=>{ location.href = this.URL_AT_SIGNING; }, this.DELAY_PAGE_RELOAD);
        } else { // иначе - продолжаю ожидать
            setTimeout(function (self, finder, callback, number_of_attempts) {
                let btn = finder();
                if(btn) {
                    console.info("элемент найден");
                    callback(self, btn);
                } else {
                    console.info("элемент не найден");
                    self.waitForElementPresented(finder, callback, number_of_attempts-1);
                }
            }, interval, this, finder, callback, number_of_attempts);
        }
        
    }
    
    /**
     * функция поиска ожидания кнопки на странице "Тайтл 5"
     */
    _actionWaybillTitle5Finder() {
        let
            buttons = document.querySelectorAll('.col-md-12 button.btn'),
            btn = false;
        // ищу нужную
        for(let i = 0; i < buttons.length; i++) {
            if(!buttons[i].disabled && buttons[i].firstChild.textContent.toLowerCase() == 'подписать') {
                btn = buttons[i];
                break;
            }
        }
        return btn;
    }
    
    /**
     * выполняет действия в тайтле 5
     */
    actionWaybillTitle5() {
        if(!this.checkPluginVersion()) {
            //return;
        }
        // функция обратного вызова для клика по найденой кнопке
        let callabck = function(self, button) {
            self.setBorderStyle(self.BORDER_STYLE_OK, false);
            setTimeout(()=>{ button.click(); }, 1000);
        };
        // ищу кнопку "Подписать и отправить"
        this.waitForElementPresented(
            this._actionWaybillTitle5Finder,    // функция поиска
            callabck,                           // функция обратного вызова
            100,                                // количество попыток
            1000                                // интервал между попытками (мс)
        );
    }
    
    /**
     * возвращает кнопку "следующая"
     */
    getPaginationButtonNext() {
        let all_links = document.querySelectorAll('.main-grid-panel-cell-pagination .main-ui-pagination-arrow');
        for(let i=0; i<all_links.length;i++) {
            if(all_links[i].innerText.toLowerCase() == 'следующая' && all_links[i].href) {
                return all_links[i];
            }
        }
        return false;
    }
    
    /**
     * выполняет действия на списке ЭПЛ
     */
    actionStart() {
        this.setPluginVersion();
        this.setBorderStyle(this.BORDER_STYLE_OK, true);
        setTimeout(()=>{ location.href = this.URL_AT_SIGNING; }, this.DELAY_PAGE_RELOAD);
    }
    actionAtSigning() {
        if(!this.checkPluginVersion()) {
            return;
        }
        let link = this.getNextNotProcessedEwbLink();
        let next_button = this.getPaginationButtonNext();//.main-ui-pagination
        
        // если ссылка найдена - добавляю в обработанные и перехожу по ней
        if(link) {
            this.setBorderStyle(this.BORDER_STYLE_OK, false);
            this.markLinkAsProcessed(link.innerText);
            setTimeout(()=>{ link.click(); }, this.DELAY_LINK_CLICK_MS);
        } else if(next_button) {
            this.setBorderStyle(this.BORDER_STYLE_OK, false);
            setTimeout(()=>{ location.href = next_button.href; }, this.DELAY_LINK_CLICK_MS);
        } else {
            this.setBorderStyle(this.BORDER_STYLE_OK, false);
            this.clearProcessedLinksList();
            this.redirectToStart();
        }
    }
    
    redirectToStart(msg) {
        setTimeout(()=>{ location.href = this.URL_START; }, this.DELAY_PAGE_RELOAD);
    }
    
    /**
     * для указанного блока проверяет наличие заполненного пробега
     */
    blockHasMileageAssigned(block) {
        if(!this.checkPluginVersion()) {
            return;
        }
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
     * при запрещенных алертах, если в любом из перечисленных действий не произошел редирект, то принудительно перенаправляю на список
     */
    handleAlert() {
        if(!this.checkPluginVersion()) {
            return;
        }
        
        setTimeout(()=>{
            console.info("редирект на список");
            if(typeof window.sessionStorage.alerts_counter_plugin_all_titles == 'undefined') {
                window.sessionStorage.alerts_counter_plugin_all_titles = 0;
            }
            window.sessionStorage.alerts_counter_plugin_all_titles++;
            location.href = this.URL_AT_SIGNING;
        }, this.DELAY_REDIRECT_TO_PREVENT_ALERTS);
    }
    
    /**
     * урл неизвестен
     */
    actionUndefined() {
        if(!this.checkPluginVersion()) {
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
            ///console.info(blocks[i]);
            if(btn && btn.firstChild.textContent.toLowerCase() == 'заполнить') {
                break;
            } else {
                btn = false;
            }
        }
        // 
        if(!btn) {
            /* кнопка не нашлась - возвращаюсь к списку */
            this.setBorderStyle(this.BORDER_STYLE_WARNING, true);
            setTimeout(()=>{ location.href = this.URL_AT_SIGNING; }, this.DELAY_PAGE_RELOAD);
        } else {
            this.setBorderStyle(this.BORDER_STYLE_OK, false);
            setTimeout(()=>{ btn.click(); }, this.DELAY_LINK_CLICK_MS);
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
        return 'clicker_2-'+ name;
    }
    
    constructor() {}
  
    run(url) {
        console.info("ПЛАГИН 2: старт");
        /* определяю какая страница открыта */
        let page_id = this.getCurrentLocation(url);
        switch(page_id) {
            case this.PAGE_ID_START:
                this.actionStart();
                break;
            //case this.PAGE_ID_MAIN:
                //actionMain();
                //break;
            case this.PAGE_ID_AT_SIGNING:
                this.actionAtSigning();
                break;
            case this.PAGE_ID_WAYBILL:
                this.actionWaybill();
                break;
            case this.PAGE_ID_WAYBILL_T5:
                this.actionWaybillTitle5();
                break;
            default:
                this.actionUndefined();
                break;
        }
        
        // если в любом из перечисленных действий не произошел редирект, то принудительно перенаправляю на список
        this.handleAlert();
  }
  
    /**
     * устанавливает стиль бордера
     */
    setBorderStyle(border_style, blink) {
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
        window.sessionStorage.setItem(this.getSessionKey(ewb_number), 1);
    }
    
    /**
     * очищает список проверенных ссылок
     * @return bool
     */
    clearProcessedLinksList() {
        console.info("clear");
        window.sessionStorage.clear();
    }
  
  /**
   * проверяет - была ли обработана ссылка с указанным номером
   * @return bool
   */
  checkIfWebIsProcessed(ewb_number) {
      return window.sessionStorage.getItem(this.getSessionKey(ewb_number)) !== null;
  }
  
  /* возвращает объект следующей необработанной ссылки */
  getNextNotProcessedEwbLink() {
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

// вызываю алерт, чтобы сразу отключить их
alert('надо перезагрузить страницу и выбрать опцию "запретить уведомления"');

/**
 * 
 */
let clicker = new Clicker();
/* подменяю встроенный алерт - чтобы сразу редиректить на начало */
//window.alert = clicker.redirectToStart();

clicker.run(document.location.href);