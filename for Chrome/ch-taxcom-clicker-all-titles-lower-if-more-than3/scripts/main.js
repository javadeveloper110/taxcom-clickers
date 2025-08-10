


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
        PLUGIN_VERSION = 'all-titles-bottom-4-if-4-or-more',
        
        TITLE_T5 = 'т5 - показания одометра при заезде',
        
        URL_AT_SIGNING = 'https://epl.taxcom.ru/at_signing/',
        URL_START = 'https://epl.taxcom.ru/at_signing/?start-all-titles-bottom-4-if-4-or-more';
        
        MILEAGE_PATTERN = '^показания одометра: [0-9]+$',
        
		URL_PATTERN_MAIN = '^https://epl.taxcom.ru/$', // тут жму на кнопку "Подписать"
		URL_PATTERN_START_PLUGIN = '^https://epl.taxcom.ru/at_signing/\\?start-all-titles-bottom-4-if-4-or-more$', // запуск плагина
		URL_PATTERN_AT_SIGNING = '^https://epl.taxcom.ru/at_signing/$', // тут собираю урлы ЭПЛов
		URL_PATTERN_WAYBILL = '^https://epl.taxcom.ru/waybill/[0-9]{7,8}/$', // тут жму "открыть" в блоке Т6
		URL_PATTERN_WAYBILL_T6 = '^https://epl.taxcom.ru/waybill/[0-9]{7,8}/[1-6]/$', // тут жму "подписать и отправить"
		
		PAGE_ID_MAIN = 'main', // тут жму на кнопку "Подписать"
        PAGE_ID_START = 'start', // запуск плагина
		PAGE_ID_AT_SIGNING = 'at-signing', // тут собираю урлы ЭПЛов
		PAGE_ID_WAYBILL = 'waybill', // тут жму "открыть" в блоке Т6
		PAGE_ID_WAYBILL_T6 = 'waybill_t6', // тут жму "подписать и отправить"
		
		LOCATIONS = {};
		
        LOCATIONS[PAGE_ID_START]      = URL_PATTERN_START_PLUGIN;
		LOCATIONS[PAGE_ID_AT_SIGNING] = URL_PATTERN_AT_SIGNING;
		LOCATIONS[PAGE_ID_WAYBILL_T6] = URL_PATTERN_WAYBILL_T6;
		LOCATIONS[PAGE_ID_WAYBILL] = URL_PATTERN_WAYBILL;
		LOCATIONS[PAGE_ID_MAIN] = URL_PATTERN_MAIN;
    
    
	
    function setPluginVersion() { window.sessionStorage.setItem("plugin_number", PLUGIN_VERSION); }
    
    function checkPluginVersion() {
        let res = window.sessionStorage.getItem("plugin_number") == PLUGIN_VERSION;
        if(res) {
            let
                num = typeof window.sessionStorage.alerts_counter != 'undefined' ? window.sessionStorage.alerts_counter : 0,
                fragment = create('<div>&#128315;&#128315;&#128315;&#128315; Кликает НИЖНИЙ ЭПЛ при наличии 4-ёх ЭПЛ в списке. Обрабатывает все тайтлы.</div>');
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
        location.href = URL_AT_SIGNING;
    }
    
    /**
     * выполняет действия на странице PAGE_ID_MAIN
     */
    function actionMain() {
        if(!checkPluginVersion()) {
            return;
        }
        
        //мигаю желтым - можно заполнять фильтр
        setBorderStyle(BORDER_STYLE_WARNING, true);
    }
    
    /**
     * выполняет действия на странице PAGE_ID_AT_SIGNING
     */
    function actionAtSigning() {
        if(!checkPluginVersion()) {
            return;
        }
        log(arguments.callee.name);
        // 502 ошибка
        if(fixError502(URL_AT_SIGNING)) {
            return;
        }
        
        // проверяю фильтры
        if(!checkFilters()) {
            setBorderStyle(BORDER_STYLE_WARNING);
            // пытаюсь кликнуть по фильтру
            if(pressEnterOnFilter()) {
                location.href = URL_AT_SIGNING;
            }
            // не получилось
            showFilterWarning();
            return;
        }
        
        // ищу ссылка на ЭПЛы
        let links = document.querySelectorAll('.head-table a');
        // Кликает верхний ЭПЛ, если на странице /at_signing больше двух записей
        if(links.length < 4) {
            // если ссылок меньше двух, включаю мигание зеленым и перезагружаю страницу через время
            setBorderStyle(BORDER_STYLE_OK, true);
            let timer_info = {};
            timer_info['id'] = setTimeout(function(timer_info) {
                clearTimeout(timer_info['id']);
                location.reload();
            }, DELAY_PAGE_RELOAD, timer_info);
        } else {
            // если ссылки есть, включаю зеленый бордер и через время перехожу по первой ссылке
            setBorderStyle(BORDER_STYLE_OK, false);
            links[links.length-1].click();
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
        log(arguments.callee.name);
        // 502 ошибка
        if(fixError502(URL_AT_SIGNING)) {
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
            location.href = URL_AT_SIGNING;
        } else {
            setBorderStyle(BORDER_STYLE_OK, false);
            // запоминаю урл списка тайтлов
            setPrevUrl(document.location.href);
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
     * выполняет действия на странице PAGE_ID_WAYBILL_T6
     */
    function actionWaybillTitle() {
        if(!checkPluginVersion()) {
            return;
        }
        log(arguments.callee.name);
        // 502 ошибка
        if(fixError502(URL_AT_SIGNING)) {
            return;
        }
        // ищу кнопку "Подписать и отправить"
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
            location.href = URL_AT_SIGNING;
        } else {
            log("кнопка найдена - кликаю. каждые три секунды проверяю наличие крутилки");
            setBorderStyle(BORDER_STYLE_OK, false);
            btn.click();
            
            let timerInfo = {}; // сюда кладу айди таймера
            timerInfo['id'] = setInterval(checkCoverLayer, 3000, timerInfo);// каждые три секунды проверяю наличие крутилки
        }
    }
    
    /**
     * выполняет действия на неизвестной странице
     */
    function actionUndefined() {
        if(!checkPluginVersion()) {
            return;
        }
        log(arguments.callee.name, "ХЗ куда я попал - тут меня быть не должно");
        // 502 ошибка
        if(fixError502(URL_AT_SIGNING)) {
            return;
        }
        setBorderStyle(BORDER_STYLE_ERROR, true);
    }
    
	/* определяю какая страница открыта */
    let page_id = getCurrentLocation();
    
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
        case PAGE_ID_WAYBILL_T6:
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
