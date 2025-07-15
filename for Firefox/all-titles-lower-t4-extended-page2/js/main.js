

function main() {
    /* настройки стилей и времени */
    const
        BORDER_STYLE_EMPTY = '5px solid #a1a1a1',
        BORDER_STYLE_WARNING = '5px solid yellow',
        BORDER_STYLE_ERROR = '5px solid red',
        BORDER_STYLE_OK = '5px solid green',
        
        DELAY_BORDER_BLINK_MS = 500, // бордер мигает раз в 1 секунду
        DELAY_LINK_CLICK_MS = 5000, // задержка между мереходами по страницам
        DELAY_REDIRECT_TO_PREVENT_ALERTS = 60000, // при заглушеных алертах - перенаправлять на список
        DELAY_PAGE_RELOAD = 5000; // через сколько перезагружать страницу
    
	/* паттерны урлов и идентификаторы страниц */
	const
        PLUGIN_VERSION = 'all-titles-lower-t4-extended-page2',
        
        TITLE_T4 = 'т4 - показания одометра при выезде',
        TITLE_T5 = 'т5 - показания одометра при заезде',
        
        URL_LIST_ALL = 'https://epl.taxcom.ru/all/?waybill_list_tab=page-2',
        URL_START = 'https://epl.taxcom.ru/at_signing/?start-all-titles-lower-t4-extended-page2';
        
        MILEAGE_PATTERN = '^показания одометра: [0-9]+$',
        
		URL_PATTERN_START_PLUGIN = '^https://epl.taxcom.ru/at_signing/\\?start-all-titles-lower-t4-extended-page2$', // запуск плагина
		URL_PATTERN_LIST_ALL = '^https://epl.taxcom.ru/all/\\?waybill_list_tab=page-2$', // тут собираю урлы ЭПЛов
		URL_PATTERN_WAYBILL = '^https://epl.taxcom.ru/waybill/[0-9]{7}/$', // тут жму "открыть" в блоке Т6
		URL_PATTERN_WAYBILL_TITLE_ANY = '^https://epl.taxcom.ru/waybill/[0-9]{7}/[1-6]/$', // тут жму "подписать"
		URL_PATTERN_WAYBILL_TITLE_4 = '^https://epl.taxcom.ru/waybill/[0-9]{7}/4/$', // тут жму "подписать" или "отправить" 
		
        PAGE_ID_START = 'start', // запуск плагина
		PAGE_ID_LIST_ALL = 'list-all', // тут собираю урлы ЭПЛов
		PAGE_ID_WAYBILL = 'waybill', // тут жму "открыть" в блоке Т6
		PAGE_ID_WAYBILL_TITLE_ANY = 'waybill_title_any', // тут жму "подписать"
		PAGE_ID_WAYBILL_TITLE_4 = 'waybill_title_4', // тут жму "подписать" или "отправить" 
		
		LOCATIONS = {};
		
        LOCATIONS[PAGE_ID_START]      = URL_PATTERN_START_PLUGIN;
		LOCATIONS[PAGE_ID_LIST_ALL] = URL_PATTERN_LIST_ALL;
		LOCATIONS[PAGE_ID_WAYBILL_TITLE_4] = URL_PATTERN_WAYBILL_TITLE_4;
		LOCATIONS[PAGE_ID_WAYBILL_TITLE_ANY] = URL_PATTERN_WAYBILL_TITLE_ANY;
		LOCATIONS[PAGE_ID_WAYBILL] = URL_PATTERN_WAYBILL;
    
    function create(htmlStr) {
        var frag = document.createDocumentFragment(),
            temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    }
	
    function setPluginVersion() { window.sessionStorage.setItem("plugin_number", PLUGIN_VERSION); }
    
    function checkPluginVersion() {
        let res = window.sessionStorage.getItem("plugin_number") == PLUGIN_VERSION;
        if(res) {
            let
                num = typeof window.sessionStorage.alerts_counter_plugin_lower != 'undefined' ? window.sessionStorage.alerts_counter_plugin_lower : 0,
                fragment = create('<div>Плагин: '+ PLUGIN_VERSION +'. Кликает нижний ЭПЛ на второй странице списка "ВСЕ ЭПЛ". Для Т4 - обрабатывает так же кнопки ОТКРЫТЬ -> ОТПРАВИТЬ.</div>');
            // You can use native DOM methods to insert the fragment:
            document.body.insertBefore(fragment, document.body.childNodes[0]);
        }
        return res;
    }

	/**
     * определяет открытую страницу и возвращает ее ИД
     */
	function getCurrentLocation() {
		let pattern;
		for(let id in LOCATIONS) {
			pattern = new RegExp(LOCATIONS[id]);
			if(pattern.test(document.location.href)) {
				return id;
			}
		}
		return undefined;
	}
    
    /* устанавливает стиль бордера */
    function setBorderStyle(border_style, blink) {
        if(blink) {
            setInterval(function(border_style) {
                if(document.body.style.border != border_style) {
                    document.body.style.border = border_style;
                } else {
                    document.body.style.border = BORDER_STYLE_EMPTY;
                }
            }, DELAY_BORDER_BLINK_MS, border_style);
        } else {
            document.body.style.border = border_style;
        }
    }
    
    /**
     * устанавливает сессию
     */
    function actionStart() {
        setBorderStyle(BORDER_STYLE_OK, true);
        setPluginVersion();
        checkPluginVersion();
        setTimeout(()=>{ location.href = URL_LIST_ALL; }, DELAY_PAGE_RELOAD);
    }
    
    /**
     * выполняет действия на странице PAGE_ID_LIST_ALL
     */
    function actionListAll() {
        if(!checkPluginVersion()) {
            return;
        }
        // ищу ссылка на ЭПЛы
        let links = document.querySelectorAll('.head-table a');
        // Кликает нижний ЭПЛ на странице /at_signing
        if(links.length == 0) {
            // если ссылок не найдено, включаю мигание зеленым и перезагружаю страницу через время
            setBorderStyle(BORDER_STYLE_OK, true);
            setTimeout(()=>{ location.reload(); }, DELAY_PAGE_RELOAD);
        } else {
            // если ссылки есть, включаю зеленый бордер и через время перехожу по первой ссылке
            setBorderStyle(BORDER_STYLE_OK, false);
            setTimeout(()=>{ links[links.length-1].click(); }, DELAY_LINK_CLICK_MS);
        }
    }
    
    /**
     * дял указанного блока проверяет наличие заполненного пробега
     */
    function blockHasMileageAssigned(block) {
        // ищу упоминание пробега
        let labels = block.querySelectorAll('div label.main-cont');
        let pattern = new RegExp(MILEAGE_PATTERN);
		
        for(let i = 0; i < labels.length; i++) {
            // блок текста с упоминанием пробега найден
            if(pattern.test(labels[i].innerText.toLowerCase().trim())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * выполняет действия на странице PAGE_ID_WAYBILL
     */
    function actionWaybill() {
        if(!checkPluginVersion()) {
            return;
        }
        
        // если т4 обработан - возращаюсь на список
        if(getT4Processed()) {
            setT4Processed(false);
            setTimeout(()=>{ location.href = URL_LIST_ALL; }, 1000);
            return;
        }
        // ищу все кнопки "заполнить"
        let
            blocks = document.querySelectorAll('.order-md-1 .card'),//a.btn.btn-green
            btn = false,
            header;
        
        for(let i = 0; i < blocks.length; i++) {
            // в пятом блоке проверяю показания одометра если нет - пропускаю
            // сравниваю заголовок блока
            header = blocks[i].querySelector('.accordion-button');
            // если заголовка нет - значит сломалась структура документа
            if(!header) {
                setBorderStyle(BORDER_STYLE_ERROR, true);
                console.error("не найден заголовок блока");
                return;
            }
            // blocks[i] - четвертый блок -   если там есть кнопка «ОТКРЫТЬ»
            if(header.textContent.toLowerCase().trim() == TITLE_T4) {
                // ищу кнопку «ОТКРЫТЬ»
                btn = blocks[i].querySelector('a.btn.btn-green');
                if(btn && btn.firstChild.textContent.toLowerCase() == 'открыть') {
                    break;
                }
            }
            // blocks[i] - пятый блок. Если нет пробега - пропускаю
            if(header.textContent.toLowerCase().trim() == TITLE_T5 && !blockHasMileageAssigned(blocks[i])) {
                continue;
            }
            
            // в каждом блоке ищу кнопку "подписать"
            btn = blocks[i].querySelector('a.btn.btn-green');
            ///console.info(blocks[i]);
            if(btn && btn.firstChild.textContent.toLowerCase() == 'заполнить') {
                break;
            } else {
                btn = false;
            }
        }
        
        if(!btn) {
            /* нет подходящих кнопок - возвращаюсь к списку */
            setBorderStyle(BORDER_STYLE_WARNING, true);
            setTimeout(()=>{ location.href = URL_LIST_ALL; }, DELAY_PAGE_RELOAD);
        } else {
            setBorderStyle(BORDER_STYLE_OK, false);
            setTimeout(()=>{ btn.click(); }, 100);
            setPrevUrl(document.location.href); // запоминаю урл списка тайтлов
        }
    }
    
    /**
     * выполняет действия на странице PAGE_ID_WAYBILL_TITLE_4
     */
    function actionWaybillTitle4() {
        if(!checkPluginVersion()) {
            return;
        }
        // ищу кнопку "Подписать" или "отправить"
        let
            buttons = document.querySelectorAll('.col-md-12 button.btn'),
            btn = false;
        // ищу нужную
        buttons.forEach((el, index)=>{
            if(el.firstChild.textContent.toLowerCase() == 'подписать') {
                btn = el;
            }
            if(el.firstChild.textContent.toLowerCase() == 'отправить') {
                btn = el;
            }
        });
        
        if(!btn || btn.disabled) {
            // кнопка не найдена или неактивна
            setBorderStyle(BORDER_STYLE_WARNING, true);
            setTimeout(()=>{ location.href = URL_LIST_ALL; }, DELAY_PAGE_RELOAD);
        } else {
            // из Т4, после обработки нажатия, выходить на общий список
            setT4Processed(true);
            setBorderStyle(BORDER_STYLE_OK, false);
            setTimeout(()=>{ btn.click(); }, 1000);
            setTimeout(()=>{ location.href = getPrevUrl(URL_LIST_ALL); }, 120000);// если кнопка не сработает, то через 120 секунд кликер вернется в просмотр списка тайтлов для данного ЭПЛ
        }
    }
    
    /**
     * выполняет действия на странице PAGE_ID_WAYBILL_TITLE_ANY
     */
    function actionWaybillTitleAny() {
        if(!checkPluginVersion()) {
            return;
        }
        // ищу кнопку "Подписать"
        let
            buttons = document.querySelectorAll('.col-md-12 button.btn'),
            btn = false;
        // ищу нужную
        buttons.forEach((el, index)=>{
            if(el.firstChild.textContent.toLowerCase() == 'подписать') {
                btn = el;
            }
        });
        
        if(!btn || btn.disabled) {
            // кнопка не найдена или неактивна
            setBorderStyle(BORDER_STYLE_WARNING, true);
            setTimeout(()=>{ location.href = URL_LIST_ALL; }, DELAY_PAGE_RELOAD);
        } else {
            setBorderStyle(BORDER_STYLE_OK, false);
            setTimeout(()=>{ btn.click(); }, 1000);
            setTimeout(()=>{ location.href = getPrevUrl(URL_LIST_ALL); }, 120000);// если кнопка не сработает, то через 120 секунд кликер вернется в просмотр списка тайтлов для данного ЭПЛ
        }
    }
    
    /**
     * выполняет действия на неизвестной странице
     */
    function actionUndefined() {
        if(!checkPluginVersion()) {
            return;
        }
        setBorderStyle(BORDER_STYLE_ERROR, true);
    }
    
    /* подменяю встроенный алерт - чтобы сразу редиректить на начало */
    window.alert = function() {
        if(arguments.length == 0) {
            return;
        }
        console.info("редирект на список");
        if(typeof window.sessionStorage.alerts_counter_plugin_lower == 'undefined') {
            window.sessionStorage.alerts_counter_plugin_lower = 0;
        }
        window.sessionStorage.alerts_counter_plugin_lower++;
        setTimeout(()=>{ location.href = URL_LIST_ALL; }, DELAY_PAGE_RELOAD);
    }
    
	/* определяю какая страница открыта */
    let page_id = getCurrentLocation();
    
	switch(page_id) {
        case PAGE_ID_START:
            actionStart();
            break;
        case PAGE_ID_LIST_ALL:
            actionListAll();
            break;
        case PAGE_ID_WAYBILL:
            actionWaybill();
            break;
        case PAGE_ID_WAYBILL_TITLE_4:
            actionWaybillTitle4();
            break;
        case PAGE_ID_WAYBILL_TITLE_ANY:
            actionWaybillTitleAny();
            break;
        default:
            actionUndefined();
            break;
    }
}

// вызываю алерт, чтобы сразу отключить их
alert('надо перезагрузить страницу и выбрать опцию "запретить уведомления"');

/**
 * 
 */
(function() {
    main();
})();
