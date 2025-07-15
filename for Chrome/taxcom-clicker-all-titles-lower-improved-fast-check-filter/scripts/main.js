

function main() {
    log("in function:", arguments.callee.name);
    /* настройки стилей и времени */
    const
        BORDER_STYLE_EMPTY = '5px solid #a1a1a1',
        BORDER_STYLE_WARNING = '5px solid yellow',
        BORDER_STYLE_ERROR = '5px solid red',
        BORDER_STYLE_OK = '5px solid green',
        
        DELAY_BORDER_BLINK_MS = 500, // бордер мигает раз в 1 секунду
        DELAY_PAGE_RELOAD = 5000; // через сколько перезагружать страницу
    
	/* паттерны урлов и идентификаторы страниц */
	const
        PLUGIN_VERSION = 'all-titles-lower-check-filter',
        
        TITLE_T5 = 'т5 - показания одометра при заезде',
        
        URL_AT_SIGNING = 'https://epl.taxcom.ru/at_signing/',
        URL_START = 'https://epl.taxcom.ru/at_signing/?start-all-titles-lower-check-filter';
        
        MILEAGE_PATTERN = '^показания одометра: [0-9]+$',
        
		URL_PATTERN_MAIN = '^https://epl.taxcom.ru/$', // тут жму на кнопку "Подписать"
		URL_PATTERN_START_PLUGIN = '^https://epl.taxcom.ru/at_signing/\\?start-all-titles-lower-check-filter$', // запуск плагина
		URL_PATTERN_AT_SIGNING = '^https://epl.taxcom.ru/at_signing/$', // тут собираю урлы ЭПЛов
		URL_PATTERN_WAYBILL = '^https://epl.taxcom.ru/waybill/[0-9]{7}/$', // тут жму "открыть" в блоке Т6
		URL_PATTERN_WAYBILL_TITLE = '^https://epl.taxcom.ru/waybill/[0-9]{7}/[1-6]/$', // тут жму "подписать и отправить"
		URL_PATTERN_GET_TITLE_NUMBER = '^https://epl.taxcom.ru/waybill/[0-9]{7}/([1-6])/$', // тут жму "подписать и отправить"
		
		PAGE_ID_MAIN = 'main', // тут жму на кнопку "Подписать"
        PAGE_ID_START = 'start', // запуск плагина
		PAGE_ID_AT_SIGNING = 'at-signing', // тут собираю урлы ЭПЛов
		PAGE_ID_WAYBILL = 'waybill', // тут жму "открыть" в блоке Т6
		PAGE_ID_WAYBILL_TITLE = 'waybill_title', // тут жму "подписать и отправить"
		
		LOCATIONS = {};
		
        LOCATIONS[PAGE_ID_START]      = URL_PATTERN_START_PLUGIN;
		LOCATIONS[PAGE_ID_AT_SIGNING] = URL_PATTERN_AT_SIGNING;
		LOCATIONS[PAGE_ID_WAYBILL_TITLE] = URL_PATTERN_WAYBILL_TITLE;
		LOCATIONS[PAGE_ID_WAYBILL] = URL_PATTERN_WAYBILL;
		LOCATIONS[PAGE_ID_MAIN] = URL_PATTERN_MAIN;
    
    log("start");
	
    function setPluginVersion() {
        log("in function:", arguments.callee.name);
        window.sessionStorage.setItem("plugin_number", PLUGIN_VERSION);
    }
    
    function checkPluginVersion() {
        log("in function:", arguments.callee.name);
        let res = window.sessionStorage.getItem("plugin_number") == PLUGIN_VERSION;
        if(res) {
            let
                num = typeof window.sessionStorage.alerts_counter_plugin_lower != 'undefined' ? window.sessionStorage.alerts_counter_plugin_lower : 0,
                fragment = create('<div>Плагин: all-titles-lower-check-filter. Кликает нижний ЭПЛ из списка. Если кнопка подписания зависнет, кликер вернется на список тайтлов. Проверяет фильтры.</div>');
            // You can use native DOM methods to insert the fragment:
            document.body.insertBefore(fragment, document.body.childNodes[0]);
        }
        return res;
    }

	/**
     * определяет открытую страницу и возвращает ее ИД
     */
	function getCurrentTitleNumber() {
        log("in function:", arguments.callee.name);
		let
            pattern = new RegExp(URL_PATTERN_GET_TITLE_NUMBER),
            results = pattern.exec(document.location.href);
        if(results.length == 2) {
            return parseInt(results[1]);
        } else {
            return null;
        }
	}
    
	/**
     * определяет открытую страницу и возвращает ее ИД
     */
	function getCurrentLocation() {
        log("in function:", arguments.callee.name);
		let pattern;
		for(let id in LOCATIONS) {
			pattern = new RegExp(LOCATIONS[id]);
			if(pattern.test(document.location.href)) {
				return id;
			}
		}
		return undefined;
	}
    
    /**
     * устанавливает сессию
     */
    function actionStart() {
        log("in function:", arguments.callee.name);
        setBorderStyle(BORDER_STYLE_OK);
        setPluginVersion();
        checkPluginVersion();
        setTimeout(()=>{ location.href = URL_AT_SIGNING; }, 3000);
    }
    
    /**
     * выполняет действия на странице PAGE_ID_MAIN
     */
    function actionMain() {
        log("in function:", arguments.callee.name);
        if(!checkPluginVersion()) {
            return;
        }
        //мигаю желтым - можно заполнять фильтр
        setBorderStyle(BORDER_STYLE_WARNING);
    }
    /**
     * выполняет действия на странице PAGE_ID_AT_SIGNING
     */
    function actionAtSigning() {
        log("in function:", arguments.callee.name);
        if(!checkPluginVersion()) {
            return;
        }
        
        if(!checkFilters()) {
            setBorderStyle(BORDER_STYLE_WARNING);
            showFilterWarning();
            return;
        }
        // после попадания на список сбрасываю параметр
        setBackToList(false);
        
        // ищу ссылка на ЭПЛы
        let links = document.querySelectorAll('.head-table a');
        log("найдено", links.length, "ЭПЛ");
        // Кликает нижний ЭПЛ на странице /at_signing
        if(links.length == 0) {
            // если ссылок не найдено, включаю мигание зеленым и перезагружаю страницу через время
            setBorderStyle(BORDER_STYLE_OK);
            log("перезагружаю страницу через", DELAY_PAGE_RELOAD, "секунд");
            setTimeout(()=>{ location.reload(); }, DELAY_PAGE_RELOAD);
        } else {
            // если ссылки есть, включаю зеленый бордер и через время перехожу по первой ссылке
            setBorderStyle(BORDER_STYLE_OK);
            log("кликаю последний");
            links[links.length-1].click();
        }
    }
    
    /**
     * дял указанного блока проверяет наличие заполненного пробега
     */
    function blockHasMileageAssigned(block) {
        log("in function:", arguments.callee.name);
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
        log("in function:", arguments.callee.name);
        if(!checkPluginVersion()) {
            return;
        }
        // если необходимо вернуться на список ЭПЛ - возвращаюсь
        if(getBackToList()) {
            log("возвращаюсь на список");
            location.href = URL_AT_SIGNING;
            return;
        }
        
        // ищу все кнопки "заполнить"
        log("ищу все кнопки \"заполнить\"");
        let
            blocks = document.querySelectorAll('.order-md-1 .card'),//a.btn.btn-green
            btn = false,
            header;
        log("найдено:", blocks.length);
        for(let i = 0; i < blocks.length; i++) {
            // в пятом блоке проверяю показания одометра если нет - пропускаю
            // сравниваю заголовок блока
            header = blocks[i].querySelector('.accordion-button');
            // если заголовка нет - значит сломалась структура документа
            if(!header) {
                setBorderStyle(BORDER_STYLE_ERROR);
                console.error("не найден заголовок блока");
                return;
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
            setBorderStyle(BORDER_STYLE_WARNING);
            log("нет подходящих кнопок - возвращаюсь к списку");
            location.href = URL_AT_SIGNING;
        } else {
            setBorderStyle(BORDER_STYLE_OK);
            log("запоминаю урл списка тайтлов");
            setPrevUrl(document.location.href); // запоминаю урл списка тайтлов
            log("переход по кнопке");
            btn.click();
        }
    }
    
    /** проверяет наличие "крутилки" после нажатия на кнопку в тайтле. если крутилки нет - редирект */
    function checkCoverLayer(timerInfo) {
        log("in function:", arguments.callee.name);
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
        let redirect_url = getPrevUrl(URL_AT_SIGNING);
        log("крутилка не найдена - переход на ", redirect_url);
        location.href = redirect_url;
    }
    
    /**
     * выполняет действия на странице PAGE_ID_WAYBILL_TITLE
     */
    function actionWaybillTitle() {
        log("in function:", arguments.callee.name);
        if(!checkPluginVersion()) {
            return;
        }
        
        // после обработки тайтлов т1, Т2, т4, Т5, Т6 - переход сразу на список
        setBackToList([1, 2, 4, 5, 6].includes(getCurrentTitleNumber()));
        
        // ищу кнопку "Подписать и отправить"
        log("ищу кнопку \"Подписать и отправить\"");
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
            log("кнопка не найдена или неактивна - перехожу на список");
            setBorderStyle(BORDER_STYLE_WARNING);
            location.href = URL_AT_SIGNING;
        } else {
            log("кнопка найдена - кликаю. каждые три секунды проверяю наличие крутилки");
            setBorderStyle(BORDER_STYLE_OK);
            btn.click();
            
            let timerInfo = {}; // сюда кладу айди таймера
            timerInfo['id'] = setInterval(checkCoverLayer, 3000, timerInfo);// каждые три секунды проверяю наличие крутилки
            //setTimeout(()=>{ location.href = getPrevUrl(URL_AT_SIGNING); }, 20000);// если кнопка не сработает, то через 120 секунд кликер вернется в просмотр списка тайтлов для данного ЭПЛ
        }
    }
    
    /**
     * выполняет действия на неизвестной странице
     */
    function actionUndefined() {
        log("in function:", arguments.callee.name);
        if(!checkPluginVersion()) {
            return;
        }
        log("ХЗ куда я попал - тут меня быть не должно");
        setBorderStyle(BORDER_STYLE_ERROR);
    }
    
	/* определяю какая страница открыта */
    let page_id = getCurrentLocation();
    
    log("определяю какая страница открыта:", page_id);
	switch(page_id) {
        case PAGE_ID_START:
            actionStart();
            break;
        case PAGE_ID_MAIN:
            actionMain();
            break;
        case PAGE_ID_AT_SIGNING:
            actionAtSigning();
            break;
        case PAGE_ID_WAYBILL:
            actionWaybill();
            break;
        case PAGE_ID_WAYBILL_TITLE:
            actionWaybillTitle();
            break;
        default:
            actionUndefined();
            break;
    }
}

/**
 * 
 */
(function() {
    main();
})();
