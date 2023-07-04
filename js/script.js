//
window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
}

const getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};


let tg = window.Telegram.WebApp;
// const USER_ID = 5178264021;
const USER_ID = tg.initDataUnsafe.user.id;
tg.expand(); 
let backPage = '';
let platformButton = null, returnButton = null, stepButton = null;
const firstSection = document.querySelector('.main-select');
const categorySection = document.querySelector('.main-category');
const catalogElement = document.querySelector('.main-category .category_list');

function log(str) {
    document.querySelector('#log').textContent = str;
}

let user = {};

const start = async () => {
    showLoad();
    const argumentReturn = getUrlParameter('return');

    if(argumentReturn != false) {
        openCatalog(window.localStorage.getItem('current_catalog'), window.localStorage.getItem('current_platform'));  
    }
    
    try {
        
        const data = await fetch(URL + 'get_user?' + new URLSearchParams({
            // id: 5178264021
            id: tg.initDataUnsafe.user.id
        }), {mode: 'cors'})
        user = await data.json();
        if(user.end < Date.now()/1000) {
            document.querySelector('.let.sub.main-panel__wrapper__button').classList.remove('none');
        } else {
            document.querySelector('.let.sub.main-panel__wrapper__button').classList.add('none');
        }
    } catch (e) {
        log(JSON.stringify(e));
    }
    
    try {
        const quest = await fetch(URL + 'quest', {mode: 'cors'})
        const answers = await quest.json();
        answers.forEach(answ => {
            const element = document.querySelector('.main-buy__item.none').cloneNode(true);
            element.querySelector('.main-buy__item__title').textContent = answ.vopros;
            element.querySelector('.main-buy__item__descr').textContent = answ.otvet;
            if(answ.vopros.includes('отменить')) {
                element.classList.add('otmenit');
            }
            document.querySelector('.main-buy__quest').appendChild(element);
            element.classList.remove('none');
        })


        const element = document.querySelector('.main-buy__item.none').cloneNode(true);
        element.querySelector('.main-buy__item__title').textContent = "ВОПРОС - ОТВЕТ";
        element.querySelector('.main-buy__item__title').classList.add('prepend');
        element.classList.add('prependItem');        
        element.classList.add('active');
        document.querySelector('.main-buy__quest').prepend(element);
        element.classList.remove('none');

        
        document.querySelectorAll('.main-buy__item').forEach(item => item.addEventListener('click', () => {
            const descr = item.querySelector('.main-buy__item__descr');
            if(item.querySelector('.main-buy__item__title').classList.contains('prepend')) return false;
            if(item.classList.contains('active')) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
            if(descr.classList.contains('none')) {
                descr.classList.remove('none');
            } else {
                descr.classList.add('none');
            }
        }))
    } catch(e) {
    }


    if(user.demo == false || user.demo == 0 || user.end*1000 < Date.now()) {
        
        openPanel('start');
        if((user.demo == false || user.demo == 0) && user.end*1000 < Date.now()) {
            document.querySelector('#firstButton').textContent = `7 дней подписки бесплатно`;
            document.querySelector('#firstButton').classList.remove('none');
        } else {
            document.querySelector('#firstButton').classList.add('none');
        }
        
    } else {
        
        const dating = new Date(user.end*1000);
        // dateElement.textContent = `Действие подписки ` + dating.toLocaleString();
    }
    
    // openPanel('start');

    // console_log(JSON.stringify(user));
    
}

function currentPage() {
    return document.querySelector('.page:not(.main-panel):not(.none)');
}

async function console_log(str) {
    await fetch(URL + 'console_log?' + new URLSearchParams({
        data: str
    }));
}

setTimeout(async () => {
    await start();
}, 1);

let 
currentPlatform, 
currentCatalog;

document.addEventListener('click', async event => {
    if(event.target.getAttribute('linker') != null) {
        showLoad();
        const cID = event.target.getAttribute('linker');
        await windowCatalog(cID);
        hideLoad();
        return false;
    }
    if(event.target.getAttribute('selectButton') == null) return false;
    if(event.target.getAttribute('return') != null) {
        // openCatalog(-1, event.target.getAttribute('return'))
        firstSection.classList.remove('none');
        categorySection.classList.add('none');

        if(user.demo == false || user.demo == 0 || user.end*1000 < Date.now()) {
            openPanel('start');
        } else {
            openPanel('medium', user.end);
        }
        return;
    }
    if(event.target.getAttribute('step') != null) {
        if(event.target.getAttribute('platform') != null) {
            currentPlatform = parseInt(event.target.getAttribute('platform'));
            
            openCatalog(event.target.getAttribute('step'), event.target.getAttribute('platform'));    
        } else {
            if(user.end*1000 > Date.now()) {
                openCatalog(event.target.getAttribute('step'));
            }
        }
        
    }
})

document.querySelectorAll('.sub').forEach(sub => {
    sub.addEventListener('click', () => {
        openPage('main-buy');
    })
})

function openPage(page) {
    document.querySelectorAll(`.page`).forEach(pageE => {
        if(pageE.classList.contains(page)) {
            pageE.classList.remove('none');
            backPage = pageE.getAttribute('back-page');
            if(backPage == null) {
                tg.BackButton.hide();
            } else {
                tg.BackButton.show();
            }
            log(backPage);
        } else {
            pageE.classList.add('none');
        }
    })

    if(currentPage().classList.contains('main-select') || currentPage().classList.contains('main-buy') || currentPage().classList.contains('main-pay')) {
        document.body.classList.remove('two');
    } else {
        document.body.classList.add('two');
    }

    if(currentPage().classList.contains('main-pay')) {
        fetch(URL + 'notifications?' + new URLSearchParams({
            userid: user.id,
            type: 0,
            date: parseInt(Date.now()/1000)
        }), {mode: 'cors'})
    }

}

async function windowCatalog(catalogid, platform) {
    if(currentPlatform == '0') {
        document.querySelectorAll('.section[name="shops"] .products__item__url').forEach(elem => {
            elem.textContent = 'Летуаль';
        })
    } else if(currentPlatform == '1') {
        document.querySelectorAll('.section[name="shops"] .products__item__url').forEach(elem => {
            elem.textContent = 'Ozon';
        })
    } else if(currentPlatform == '2') {
        document.querySelectorAll('.section[name="shops"] .products__item__url').forEach(elem => {
            elem.textContent = 'Wb';
        })
    } else if(currentPlatform == '3') {
        document.querySelectorAll('.section[name="shops"] .products__item__url').forEach(elem => {
            elem.textContent = 'Lamoda';
        })
    }
    // zdes

    await startApplication(0, 70, catalogid, '');
    isCatalogOpen = true;

    switch(currentPlatform) {
        case '2': {
            document.querySelector('.edittext').textContent = 'WB';
            break;
        }
        case '0': {
            document.querySelector('.edittext').textContent = 'Летуаль';
            break;
        }
        case '1': {
            document.querySelector('.edittext').textContent = 'OZON';
            break;
        }
        case '3': {
            document.querySelector('.edittext').textContent = 'Lamoda';
            break;
        }
    }
}

function openCatalog(catalogid, platformid) {
    

    hidePanel();
    currentCatalog = catalogid;
    currentPlatform = platformid;
    window.localStorage.setItem('current_catalog', currentCatalog);
    window.localStorage.setItem('current_platform', currentPlatform);
    if(currentPlatform == 2) {
        document.querySelector('.category_up').classList.add('wb');
    } else {
        document.querySelector('.category_up').classList.remove('wb');
    }

    document.querySelectorAll('.category_list-item').forEach(cat => {
        catalogElement.removeChild(cat);
    })

    if(catalogid != '-1') {
        switch(currentPlatform) {
            case '2': {
                document.querySelector('.edittext').textContent = 'WB';
                break;
            }
            case '0': {
                document.querySelector('.edittext').textContent = 'Летуаль';
                break;
            }
            case '1': {
                document.querySelector('.edittext').textContent = 'OZON';
                break;
            }
            case '3': {
                document.querySelector('.edittext').textContent = 'Lamoda';
                break;
            }
        }
    }

    // firstSection.classList.add('none');
    // categorySection.classList.remove('none');

    openPage('main-category');

    const catalog = catalogs[catalogid];
    try {
        document.querySelector('.category_up span').textContent = catalog?.up_name || catalog.name;
    } catch {
        document.querySelector('.category_up span').textContent = 'Категории'
    }

    if(catalogid == '-1') {
        switch(currentPlatform) {
            case '0': {
                document.querySelector('.category_up span').textContent = 'Категории Летуаль';
                break;
            }
            case '1': {
                document.querySelector('.category_up span').textContent = 'Категории OZON';
                break;
            }
            case '2': {
                document.querySelector('.category_up span').textContent = 'Категории WB';
                break;
            }
            case '3': {
                document.querySelector('.category_up span').textContent = 'Категории Ламода';
                break;
            }
        }
    }
    
    createList(catalogid);
    
    
}

function createList(catalogid) {
    const filterCatalogs = catalogs.filter(catalog => (((catalog.parent == catalogid)) && catalog.platform == currentPlatform && catalog?.isWork != 'none'));
    
    
    filterCatalogs.forEach(catalog => {
        let tag = 'div';
        const isHaveChild = !!(catalog.up_name && catalog.catalogId != currentCatalog);
        const catalogBlock = document.createElement(isHaveChild ? 'div' : 'a');
        catalogBlock.classList.add('category_list-item');
        catalogBlock.setAttribute('selectButton', 'true');
        try {
            catalog.up_name = catalog.up_name.replace(/^([\d.]+)\s/g, '')
            catalog.name = catalog.name.replace(/^([\d.]+)\s/g, '')
            
        } catch {
            catalog.name = catalog.name.replace(/^([\d.]+)\s/g, '')
        }
        
        if(currentCatalog == catalog.catalogId) {
            catalogBlock.textContent = catalog.name;    
        } else {
            catalogBlock.textContent = catalog.up_name || catalog.name;
        }
        

        if(isHaveChild == false) {
            // catalogBlock.href = catalog.link;
            catalogBlock.setAttribute('linker', catalog.catalogId);
        } else {
            stepButton = catalog.catalogId;
            platformButton = catalog.platform;
            catalogBlock.setAttribute('step', catalog.catalogId);
            catalogBlock.setAttribute('platform', catalog.platform);
        }

        catalogElement.appendChild(catalogBlock);
    })

    const catalogBlock = document.createElement('a');
    catalogBlock.classList.add('category_list-item');
    catalogBlock.textContent = 'Все категории';

    try {
        stepButton = catalogs[catalogid].parent;
        platformButton = catalogs[catalogid].platform;
    } catch {
        returnButton = currentPlatform;
    }

    if(catalogid == -1) {
        if(currentPlatform == 0) {
            catalogBlock.setAttribute('linker', '1000');
        } else if(currentPlatform == 1) {
            catalogBlock.setAttribute('linker', '1001');
        } else if(currentPlatform == 2) {
            catalogBlock.setAttribute('linker', '1002');
        } else if(currentPlatform == 3) {
            catalogBlock.setAttribute('linker', '1003');
        }
        catalogBlock.setAttribute('selectbutton', 'true');
        
        catalogElement.prepend(catalogBlock);
    }

    // catalogElement.appendChild(catalogBlock);
}

async function setHistory(catalogId, value) {
    const favors = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'set_hist',
        params: {
            userid: USER_ID,
            catalogId: catalogId,
            from: value
        }
    })).data;
}
async function getHistory(catalogId) {
    return (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_hist',
        params: {
            userid: USER_ID,
            catalogId: catalogId
        }
    })).data;
}

function openPanel(category, end = 0) {
    document.querySelectorAll('.main-panel').forEach(panel => {
        panel.classList.add('none');
        if(panel.getAttribute('category') == category) {
            panel.classList.remove('none');
            document.querySelectorAll('.date').forEach(dateElement => {
                const dating = new Date(end*1000);
                dateElement.textContent = dating.toLocaleString();
            })
        }
    })
}


function hidePanel() {
    document.querySelectorAll('.main-panel').forEach(panel => {
        panel.classList.add('none');
    })
}

// document.querySelector('#dney7').addEventListener('click', async () => {
//     await fetch(URL + 'onmessage?' + new URLSearchParams({
//         user: JSON.stringify(tg.initDataUnsafe.user),
//         message: '7 дней подписки бесплатно'
//     }));
//     tg.close();
// });

// document.querySelector('#promo').addEventListener('click', async () => {
//     await fetch(URL + 'onmessage?' + new URLSearchParams({
//         user: JSON.stringify(tg.initDataUnsafe.user),
//         message: 'Пригласить друга'
//     }));
//     tg.close();
// });

document.querySelector('#firstButton').addEventListener('click', async () => {
    await fetch(URL + 'onmessage?' + new URLSearchParams({
        user: JSON.stringify(tg.initDataUnsafe.user),
        message: '7 дней подписки бесплатно'
    }));
    tg.close();
});

async function openPayment(price, m) {
    openPage('main-pay');
    tg.MainButton.text = "Оплатить " + price + ' ₽'; //изменяем текст кнопки 
    tg.MainButton.setText("Оплатить " + price + ' ₽'); //изменяем текст кнопки иначе
    tg.MainButton.textColor = "#FFFFFF"; //изменяем цвет текста кнопки
    tg.MainButton.color = "#5CB253"; //изменяем цвет бэкграунда кнопки
    tg.MainButton.setParams({"color": "#5CB253"}); //так изменяются все параметры
    tg.MainButton.show()


    document.querySelector('#price').textContent = `${price} ₽`;
    document.querySelector('#m').textContent = m;
    document.querySelector('#rubtwo').textContent = `${price}`;
}

document.querySelectorAll('.main-buy__button').forEach(button => {
    if(button.id != 'firstButton') {
        button.addEventListener('click', but => {
            openPayment(button.getAttribute('price'), button.getAttribute('m'));
        })
    }
})

Telegram.WebApp.onEvent('mainButtonClicked', async function(){

	const form = document.querySelector('.main-pay__container');
    const check = document.querySelector('#check');
    const price = form.querySelector('#price').textContent;
    const m = form.querySelector('#m').textContent;
    const mail = form.querySelector('#email');

    let go = true;

    if(!check.checked) {
        check.classList.add('warning');
        go = false;
    }

    if(mail.value.length < 5) {
        mail.classList.add('warning');
        go = false;
    }

    if(go == true) {
        const data = await fetch(URL + 'payment?' + new URLSearchParams({
            user: JSON.stringify(user),
            mounth: m,
            price: price,
            mail: 'robin32125@bk.ru'
        }))
        tg.close();
    }
});

Telegram.WebApp.onEvent('backButtonClicked', function(){
    document.documentElement.scrollTop = 0;
    document.querySelector('.edittext').textContent = 'Поиск';
    try {
        stopApplication();
    } catch (e) {}
    
    if(currentSection != sections.shops) {
        for(let section in sections) {
            if(currentSection == sections[section]) {
                backButtonHandl[section]();
                return true;
            }
        }
    }
    // if(returnButton != null) {
    //     // openCatalog(-1, event.target.getAttribute('return'))
    //     firstSection.classList.remove('none');
    //     categorySection.classList.add('none');

    //     if(user.demo == false || user.demo == 0 || user.end*1000 < Date.now()) {
    //         openPanel('start');
            
    //     } else {
    //         openPanel('medium', user.end);
    //     }
    //     returnButton = null;
    //     return;
    // }
    if(isCatalogOpen == false) {
        if(currentCatalog != -1 && currentCatalog != undefined) {
            if(platformButton != null) {
                // if(user.end*1000 < Date.now()) {
                //     await fetch(URL + 'message?' + new URLSearchParams({
                //         user: JSON.stringify(tg.initDataUnsafe.user),
                //         message: 'Для просмотра каталога приобретите подписку или возьми пробный *период 7 дней*'
                //     }));
                //     tg.close();
                //     return;
                // }
                openCatalog(stepButton, platformButton);
                return true;
            } else {
                openCatalog(stepButton);
            }
            
        }
    }
    
    isCatalogOpen = false;
	tg.MainButton.hide();
    // openPage('main-buy');
    
    openPage(backPage);
    if(currentPage().classList.contains('main-select')) {
        if(user.demo == false || user.demo == 0 || user.end*1000 < Date.now()) {
        
            openPanel('start');
            document.querySelector('#firstButton').textContent = `7 дней подписки бесплатно`;
        } else {
            openPanel('medium', user.end);
            const dating = new Date(user.end*1000);
            // dateElement.textContent = `Действие подписки ` + dating.toLocaleString();
        }
    }
    
});

function showLoad() {
    document.querySelector('.loader').classList.remove('none');
    return true;
}

function hideLoad() {
    document.querySelector('.loader').classList.add('none');
    return true;
}

const catalogs = [
    {
        "url": "https://www.letu.ru/browse/parfyumeriya/filters/N-2ky1z?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "2. Все категории парфюмерия",
        "channel": "-1856913298",
        "platform": 0,
        "parent": -1,
        "catalogId": 0,
        "up_name": "2. Парфюмерия",
        "link": "https://t.me/+f_DJJMQ5mWVkMTcy"
    },
    {
        "url": "https://www.letu.ru/browse/parfyumeriya/zhenskaya-parfyumeriya/filters/N-1qwrtks?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "3. Женская парфюмерия",
        "channel": "-1656811235",
        "platform": 0,
        "catalogId": 1,
        "parent": 0,
        "link": "https://t.me/+SbO9_BKQELdhZTQy"
    },
    {
        "url": "https://www.letu.ru/browse/muzhchinam/muzhskaya-parfyumeriya/filters/N-mcx86j?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "4. Мужская парфюмерия",
        "channel": "-1520403690",
        "platform": 0,
        "catalogId": 2,
        "parent": 0,
        "link": "https://t.me/+vge1jtVL4pUwNDAy"
    },
    {
        "url": "https://www.letu.ru/browse/parfyumeriya/nishevaya-parfyumeriya/filters/N-17lw9ue?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "5. Нишевая парфюмерия",
        "channel": "-1726381198",
        "platform": 0,
        "catalogId": 3,
        "parent": 0,
        "link": "https://t.me/+gC_Jw19N91UxYTli"
    },
    {
        "url": "https://www.letu.ru/browse/parfyumeriya/uniseks/filters/N-17a6r03?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "6. Унисекс",
        "channel": "-1134661321",
        "platform": 0,
        "catalogId": 4,
        "parent": 0,
        "link": "https://t.me/+CJ4KrFDlsvAyNDRi"
    },
    {
        "url": "https://www.letu.ru/browse/parfyumeriya/aromaty-dlya-doma-i-aksessuary/filters/N-1on0d6?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "7. Ароматы для дома и аксессуары",
        "channel": "-1879918156",
        "platform": 0,
        "catalogId": 5,
        "parent": 0,
        "link": "https://t.me/+0op45MQ8NeVhMjVi"
    },
    {
        "url": "https://www.letu.ru/browse/makiyazh/filters/N-164j8nn?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "8. Макияж",
        "channel": "-1801847618",
        "platform": 0,
        "catalogId": 6,
        "parent": -1,
        "link": "https://t.me/+xytqD66-fPs1OGIy"
    },
    {
        "url": "https://www.letu.ru/browse/uhod-za-kozhei/filters/N-1v26ro5?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "9. Уход за кожей",
        "channel": "-1600651799",
        "platform": 0,
        "catalogId": 7,
        "parent": -1,
        "link": "https://t.me/+ZQQWFcgaFm5lNmEy"
    },
    {
        "url": "https://www.letu.ru/browse/uhod-za-volosami/filters/N-1to7koq?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "10. Для волос",
        "channel": "-1656238051",
        "platform": 0,
        "catalogId": 8,
        "parent": -1,
        "link": "https://t.me/+A1bLgUFYAwsyZDJi"
    },
    {
        "url": "https://www.letu.ru/browse/dlya-nogtei/filters/N-cvjzpo?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "11. Маникюр и педикюр",
        "channel": "-1400800446",
        "platform": 0,
        "catalogId": 9,
        "parent": -1,
        "link": "https://t.me/+CpLbHaiQL6E4NWNi"
    },
    {
        "url": "https://www.letu.ru/browse/aptechnaya-kosmetika/filters/N-r7pp80?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "12. Аптечная косметика ",
        "channel": "-1703708984",
        "platform": 0,
        "catalogId": 10,
        "parent": -1,
        "link": "https://t.me/+gHlXkANkrYk0OTAy"
    },
    {
        "url": "https://www.letu.ru/browse/sredstva-uhoda-za-polostyu-rta/filters/N-xreng3?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "13. Уход за полостью рта",
        "channel": "-1730859838",
        "platform": 0,
        "catalogId": 11,
        "parent": -1,
        "link": "https://t.me/+jTOrNMkp6WhhMTVi"
    },
    {
        "url": "https://www.letu.ru/browse/tehnika/filters/N-jua54e?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "14. Техника",
        "channel": "-1892495662",
        "platform": 0,
        "catalogId": 12,
        "parent": -1,
        "link": "https://t.me/+pZjIY3Ml1Sg5MWNi"
    },
    {
        "url": "https://www.letu.ru/browse/muzhchinam/filters/N-1pxo8bf?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "15. Все категории Мужчинам",
        "channel": "-1566859099",
        "platform": 0,
        "catalogId": 13,
        "parent": -1,
        "up_name": "15. Мужчинам",
        "link": "https://t.me/+-oxJ3AowRmQwMWZi"
    },
    {
        "url": "https://www.letu.ru/browse/muzhchinam/muzhskaya-parfyumeriya/filters/N-mcx86j?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "16. Мужская парфюмерия",
        "channel": "-1627100333",
        "platform": 0,
        "catalogId": 14,
        "parent": 13,
        "link": "https://t.me/+Ot6CjbSttwY2NDli"
    },
    {
        "url": "https://www.letu.ru/browse/muzhchinam/uhod-za-kozhei-dlya-muzhchin/filters/N-6toi8i?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "17. Уход для мужчин",
        "channel": "-1760715622",
        "platform": 0,
        "catalogId": 15,
        "parent": 13,
        "link": "https://t.me/+LfqVjSHxjboxZmIy"
    },
    {
        "url": "https://www.letu.ru/browse/detyam/filters/N-yksgpg?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "18. Все категории Для детей",
        "channel": "-1870782258",
        "platform": 0,
        "catalogId": 16,
        "parent": -1,
        "up_name": "18. Для детей",
        "link": "https://t.me/+XKxjrr-kt0ZkMzZi"
    },
    {
        "url": "https://www.letu.ru/browse/detyam/parfyumeriya-dlya-detei/filters/N-r0vpvw?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "19. Парфюмерия для детей",
        "channel": "-1542755303",
        "platform": 0,
        "catalogId": 17,
        "parent": 16,
        "link": "https://t.me/+I56q6ohDjzY5MWEy"
    },
    {
        "url": "https://www.letu.ru/browse/detyam/uhod-za-kozhei-dlya-detei/filters/N-ectpnr?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "20. Уход для детей",
        "channel": "-1476968241",
        "platform": 0,
        "catalogId": 18,
        "parent": 16,
        "link": "https://t.me/+BgKqr2MTlEFhNzE6"
    },
    {
        "url": "https://www.letu.ru/browse/aksessuary/filters/N-l06p3p?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "21. Одежда, обувь и аксессуары",
        "channel": "-1828669325",
        "platform": 0,
        "catalogId": 19,
        "parent": -1,
        "link": "https://t.me/+QeEgUBtDNTIwMWQy"
    },
    {
        "url": "https://www.letu.ru/browse/podarki/podarki-dlya-neyo/filters/N-zwyd14?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "22. Подарки для неё",
        "channel": "-1651068630",
        "platform": 0,
        "catalogId": 20,
        "parent": -1,
        "up_name": "20. Подарки",
        "link": "https://t.me/+ooUFia14ivE5MDFi"
    },
    {
        "url": "https://www.letu.ru/browse/podarki/podarki-dlya-nego/filters/N-1ywu01o?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "23. Подарки для него",
        "channel": "-1724532516",
        "platform": 0,
        "catalogId": 21,
        "parent": 20,
        "link": "https://t.me/+WQggtL2nAUIzYzJi"
    },
    {
        "url": "https://www.letu.ru/browse/sexual-wellness/filters/N-18gam5q?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "24. Sexual wellness",
        "channel": "-1835245356",
        "platform": 0,
        "catalogId": 22,
        "parent": -1,
        "link": "https://t.me/+s_OQS_FwQsdkMDky"
    },
    {
        "url": "https://www.letu.ru/browse/vse-dlya-doma/filters/N-oqisq0?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "25. Для дома",
        "channel": "-1899323447",
        "platform": 0,
        "catalogId": 23,
        "parent": -1,
        "link": "https://t.me/+vnWJWgYy_DFmYjNi"
    },
    {
        "url": "https://www.letu.ru/browse/tovary-dlya-zhivotnyh/filters/N-1ipqwb6?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "26. Для животных",
        "channel": "-1616512392",
        "platform": 0,
        "catalogId": 24,
        "parent": -1,
        "link": "https://t.me/+7m0CoTC2NUdjMWUy"
    },
    {
        "url": "https://www.letu.ru/browse/tovary-dlya-sporta/filters/N-1vnq7x?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "27. Для спорта",
        "channel": "-1634483716",
        "platform": 0,
        "catalogId": 25,
        "parent": -1,
        "link": "https://t.me/+o5VPVXBWeotmYWJi"
    },
    {
        "url": "https://www.letu.ru/browse/kantstovary-i-pechatnaya-produktsiya/filters/N-rx665v?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "28. Канцтовары и печатная продукция",
        "channel": "-1517149216",
        "platform": 0,
        "catalogId": 26,
        "parent": -1,
        "link": "https://t.me/+pdf7akKKtthlZjEy"
    },
    {
        "url": "https://www.letu.ru/browse/ukrasheniya/filters/N-1mcltg7?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "29. Украшения",
        "channel": "-1853911533",
        "platform": 0,
        "catalogId": 27,
        "parent": -1,
        "link": "https://t.me/+if_zgWCHTVJhM2My"
    },
    {
        "url": "https://www.letu.ru/browse/apteka/filters/N-4hhsyi?Ns=product.dateAvailable%7C1%7C%7Cproduct.relevance%7C1&pushSite=storeMobileRU",
        "name": "30. Аптека",
        "channel": "-1890374916",
        "platform": 0,
        "catalogId": 28,
        "parent": -1,
        "link": "https://t.me/+otxHnHFGm_owZTVi"
    },
    {
        "url": "https://www.ozon.ru/category/elektronika-15500/?sorting=new",
        "name": "2. Электроника",
        "channel": "-1591807644",
        "platform": 1,
        "catalogId": 29,
        "parent": -1,
        "link": "https://t.me/+Me4PN3UmAz1lMjA6"
    },
    {
        "url": "https://www.ozon.ru/category/odezhda-obuv-i-aksessuary-7500/?sorting=new",
        "name": "3. Все категории Одежда",
        "channel": "-1625880864",
        "platform": 1,
        "catalogId": 30,
        "parent": -1,
        "up_name": "3. Одежда",
        "link": "https://t.me/+TS22D4LYs4w0Mjgy"
    },
    {
        "url": "https://www.ozon.ru/category/zhenskaya-odezhda-7501/?sorting=new",
        "name": "4. Женщинам",
        "channel": "-1850742979",
        "platform": 1,
        "catalogId": 31,
        "parent": 30,
        "link": "https://t.me/+CI2pwRZZwOU3ZjEy"
    },
    {
        "url": "https://www.ozon.ru/category/detskaya-odezhda-7580/?sorting=new",
        "name": "5. Детям",
        "channel": "-1506926092",
        "platform": 1,
        "catalogId": 32,
        "parent": 30,
        "link": "https://t.me/+_kMwFn7or4wyNDQy"
    },
    {
        "url": "https://www.ozon.ru/category/muzhskaya-odezhda-7542/?sorting=new",
        "name": "6. Мужчинам",
        "channel": "-1836369322",
        "platform": 1,
        "catalogId": 33,
        "parent": 30,
        "link": "https://t.me/+vXCCnJCtgeRmZjZi"
    },
    {
        "url": "https://www.ozon.ru/category/spetsodezhda-i-sredstva-individualnoy-zashchity-10189/?sorting=new",
        "name": "7. Спецодежда",
        "channel": "-1648448770",
        "platform": 1,
        "catalogId": 34,
        "parent": 30,
        "link": "https://t.me/+20xjNJlbrPdmODIy"
    },
    {
        "url": "https://www.ozon.ru/category/sredstva-dlya-uhoda-za-odezhdoy-7757/?sorting=new",
        "name": "8. Уход за одеждой",
        "channel": "-1895865905",
        "platform": 1,
        "catalogId": 35,
        "parent": 30,
        "link": "https://t.me/+8MPg7NakejYxZDU6"
    },
    {
        "url": "https://www.ozon.ru/category/obuv-17777/?sorting=new",
        "name": "9. Все категории Обувь",
        "channel": "-1786592653",
        "platform": 1,
        "catalogId": 36,
        "parent": -1,
        "up_name": "9. Обувь",
        "link": "https://t.me/+hIS0WU52b0w1N2Fi"
    },
    {
        "url": "https://www.ozon.ru/category/zhenskaya-obuv-7640/?sorting=new",
        "name": "10. Женщинам",
        "channel": "-1788740875",
        "platform": 1,
        "catalogId": 37,
        "parent": 36,
        "link": "https://t.me/+ebST_s6swfRjNTc6"
    },
    {
        "url": "https://www.ozon.ru/category/muzhskaya-obuv-7658/?sorting=new",
        "name": "11. Мужчинам",
        "channel": "-1752529714",
        "platform": 1,
        "catalogId": 38,
        "parent": 36,
        "link": "https://t.me/+6gNOCECWm3RmZTBi"
    },
    {
        "url": "https://www.ozon.ru/category/detskaya-obuv-7639/?sorting=new",
        "name": "12. Детям",
        "channel": "-1775395694",
        "platform": 1,
        "parent": 36,
        "catalogId": 39,
        "link": "https://t.me/+wJoofByPYC00MWRi"
    },
    {
        "url": "https://www.ozon.ru/category/sredstva-dlya-uhoda-za-obuvyu-7763/?sorting=new",
        "name": "13. Уход и аксессуары",
        "channel": "-1762956817",
        "platform": 1,
        "parent": 36,
        "catalogId": 40,
        "link": "https://t.me/+DwAxR4Hf3s00ZjUy"
    },
    {
        "url": "https://www.ozon.ru/category/dom-i-sad-14500/?sorting=new",
        "name": "14. Дом и сад",
        "channel": "-1824316167",
        "platform": 1,
        "catalogId": 41,
        "parent": -1,
        "link": "https://t.me/+cHVEIivZDUpmYzhi"
    },
    {
        "url": "https://www.ozon.ru/category/detskie-tovary-7000/?sorting=new",
        "name": "15. Детские товары",
        "channel": "-1538847810",
        "platform": 1,
        "catalogId": 42,
        "parent": -1,
        "link": "https://t.me/+NVA9JwxGm19hY2Fi"
    },
    {
        "url": "https://www.ozon.ru/category/krasota-i-zdorove-6500/?sorting=new",
        "name": "16. Красота и здоровье OZON",
        "channel": "-1846973656",
        "platform": 1,
        "parent": -1,
        "catalogId": 43,
        "link": "https://t.me/+3tK4fOCtsFo1NDMy"
    },
    {
        "url": "https://www.ozon.ru/category/bytovaya-tehnika-10500/?sorting=new",
        "name": "17. Бытовая техника",
        "channel": "-1754380608",
        "parent": -1,
        "platform": 1,
        "catalogId": 44,
        "link": "https://t.me/+nww5fUWZGqZkYThi"
    },
    {
        "url": "https://www.ozon.ru/category/sport-i-otdyh-11000/?sorting=new",
        "name": "18. Спорт и отдых",
        "channel": "-1816214940",
        "parent": -1,
        "platform": 1,
        "catalogId": 45,
        "link": "https://t.me/+c1zKjLUCaRMxZDZi"
    },
    {
        "url": "https://www.ozon.ru/category/stroitelstvo-i-remont-9700/?sorting=new",
        "name": "19. Строительство и ремонт",
        "channel": "-1899782098",
        "platform": 1,
        "parent": -1,
        "catalogId": 46,
        "link": "https://t.me/+l68OP4uzVNs5YzYy"
    },
    {
        "url": "https://www.ozon.ru/category/produkty-pitaniya-9200/?sorting=new",
        "name": "20. Продукты и питания",
        "channel": "-1649645554",
        "platform": 1,
        "parent": -1,
        "catalogId": 47,
        "link": "https://t.me/+e-SC1TtSQs4wY2E6"
    },
    {
        "url": "https://www.ozon.ru/category/apteka-6000/?sorting=new",
        "name": "21. Аптека",
        "channel": "-1728479005",
        "platform": 1,
        "parent": -1,
        "catalogId": 48,
        "link": "https://t.me/+wVarj-jwr3llOTAy"
    },
    {
        "url": "https://www.ozon.ru/category/tovary-dlya-zhivotnyh-12300/?sorting=new",
        "name": "22. Товары для животных",
        "channel": "-1821624948",
        "platform": 1,
        "parent": -1,
        "catalogId": 49,
        "link": "https://t.me/+-aaG0tNT2UQzMzY6"
    },
    {
        "url": "https://www.ozon.ru/category/knigi-16500/?sorting=new",
        "name": "23. Книги",
        "channel": "-1714962144",
        "parent": -1,
        "platform": 1,
        "catalogId": 50,
        "link": "https://t.me/+46JAHwT_DIRlNjQy"
    },
    {
        "url": "https://www.ozon.ru/category/ohota-rybalka-turizm-33332/?sorting=new",
        "name": "24. Туризм, рыбалка, охота",
        "channel": "-1817045138",
        "parent": -1,
        "platform": 1,
        "catalogId": 51,
        "link": "https://t.me/+dfhDj8EFR6xlMTIy"
    },
    {
        "url": "https://www.ozon.ru/category/avtotovary-8500/?sorting=new",
        "name": "25. Автотовары",
        "channel": "-1889694130",
        "parent": -1,
        "platform": 1,
        "catalogId": 52,
        "link": "https://t.me/+FJqyFz7FuEpmYWNi"
    },
    {
        "url": "https://www.ozon.ru/category/mebel-15000/?sorting=new",
        "name": "26. Мебель OZON",
        "parent": -1,
        "channel": "-1832219579",
        "platform": 1,
        "catalogId": 53,
        "link": "https://t.me/+TB52cA9qc-o5MjUy"
    },
    {
        "url": "https://www.ozon.ru/category/hobbi-i-tvorchestvo-13500/?sorting=new",
        "name": "27. Хобби и творчество OZON",
        "channel": "-1788307848",
        "platform": 1,
        "catalogId": 54,
        "parent": -1,
        "link": "https://t.me/+wnUZ0RrFwRBiOGIy"
    },
    {
        "url": "https://www.ozon.ru/category/yuvelirnye-ukrasheniya-50001/",
        "name": "28. Ювелирные украшения",
        "channel": "-1869816453",
        "platform": 1,
        "catalogId": 55,
        "parent": -1,
        "link": "https://t.me/+NGH0pc_Imy00ZmNi"
    },
    {
        "url": "https://www.ozon.ru/category/aksessuary-7697/?sorting=new",
        "name": "29. Аксессуары",
        "channel": "-1808504817",
        "platform": 1,
        "catalogId": 56,
        "parent": -1,
        "link": "https://t.me/+0nonClsjug1hMDgy"
    },
    {
        "url": "https://www.ozon.ru/category/igry-i-soft-13300/?sorting=new",
        "name": "30. Игры и консоли",
        "channel": "-1822751737",
        "platform": 1,
        "parent": -1,
        "catalogId": 57,
        "link": "https://t.me/+UD1UXxiElEVmNTgy"
    },
    {
        "url": "https://www.ozon.ru/category/kantselyarskie-tovary-18000/?sorting=new",
        "name": "31. Канцелярские товары",
        "channel": "-1407363987",
        "platform": 1,
        "catalogId": 58,
        "parent": -1,
        "link": "https://t.me/+8ow4e-cg58wxODMy"
    },
    {
        "url": "https://www.ozon.ru/category/tovary-dlya-vzroslyh-9000/?sorting=new",
        "name": "32. Товары для взрослых",
        "channel": "-1891711005",
        "platform": 1,
        "parent": -1,
        "catalogId": 59,
        "link": "https://t.me/+31QgS6QMQ6phYjcy"
    },
    {
        "url": "https://www.ozon.ru/category/antikvariat-vintazh-iskusstvo-8000/?sorting=new",
        "name": "33. Антиквариат и коллекционирования",
        "channel": "-1862148004",
        "platform": 1,
        "parent": -1,
        "catalogId": 60,
        "link": "https://t.me/+cUpZNEG8ULNiZmMy"
    },
    {
        "url": "https://www.ozon.ru/category/tsifrovye-tovary-32056/?sorting=new",
        "name": "34. Цифровые товары",
        "channel": "-1302112271",
        "platform": 1,
        "parent": -1,
        "catalogId": 61,
        "link": "https://t.me/+PWjGL7oCPYkyNTAy"
    },
    {
        "url": "https://www.ozon.ru/category/bytovaya-himiya-14572/?sorting=new",
        "name": "35. Бытовая химия и гигиена",
        "channel": "-1671794011",
        "platform": 1,
        "parent": -1,
        "catalogId": 62,
        "link": "https://t.me/+AvNEsKjzHBtmMzdi"
    },
    {
        "url": "https://www.ozon.ru/category/muzyka-i-video-13100/?sorting=new",
        "name": "36. Музыка и видео",
        "channel": "-1863851628",
        "platform": 1,
        "parent": -1,
        "catalogId": 63,
        "link": "https://t.me/+xTNK6kwdDwQ2MWFi"
    },
    {
        "url": "https://www.ozon.ru/category/avtomobili-34458/?sorting=new",
        "name": "37. Автомобили",
        "channel": "-1832496222",
        "platform": 1,
        "parent": -1,
        "catalogId": 64,
        "link": "https://t.me/+A5mXGp_jXmtmMjI6"
    },
    {
        "url": "https://www.ozon.ru/category/elektronnye-sigarety-i-tovary-dlya-kureniya-35659/?sorting=new",
        "name": "38. Электронные сигареты",
        "channel": "-1895254083",
        "platform": 1,
        "parent": -1,
        "catalogId": 65,
        "link": "https://t.me/+ZZ5DT4esQZU4YTgy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Женщинам",
        "channel": "-1779369810",
        "platform": 2,
        "parent": -1,
        "catalogId": 66,
        "up_name": "Женщинам",
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        // catId: 62875,
        // catName: 'shoes_accessories1',
        // publications: [
        //     {channel: '-1817408131', catalogId: 1002}
        // ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Все подкатегории",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 67,
        
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Блузки и рубашки",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 68,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8126,
        catName: 'bl_shirts',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
            // {catalogId: 1002}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Женские брюки",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 69,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8127,
        catName: 'pants',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Верхняя одежда",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 70,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8127,
        catName: 'pants',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Женские джемперы и кардиганы",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 71,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8130,
        catName: 'jumpers_cardigans',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Женские джинсы и джеггинсы",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 72,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8131,
        catName: 'jeanst1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Комбинезоны",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 73,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8133,
        catName: 'overalls',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Костюмы",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 74,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8134,
        catName: 'costumes',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Лонгсливы",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 75,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 9411,
        catName: 'sweatshirts_hoodies',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Женские пиджаки и жакеты",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 76,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8136,
        catName: 'blazers_wamuses',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Платья",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 77,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8137,
        catName: 'dresses',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Толстовки",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 78,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8140,
        catName: 'sweatshirts_hoodies',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Туники",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 79,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8141,
        catName: 'sweatshirts_hoodies',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Футболки и топы",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 80,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8142,
        catName: 'tops_tshirts1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Халаты",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 81,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 128996,
        catName: 'women_bathrobes',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Шорты",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 82,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 10567,
        catName: 'shorts',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Юбки",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 83,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 8143,
        catName: 'skirts',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Белье",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 84,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        search: 'Женское%20белье',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Большие размеры",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 85,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        search: 'Женская%20одежда%20больших%20размеров',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Будущие мамы",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 86,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 349,
        catName: 'moms',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Для высоких",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 87,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        search: 'Женская%20одежда%20для%20высоких',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Для невысоких",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 88,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 60897,
        catName: 'short-tall2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Одежда для дома",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 89,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        search: 'Женская%20домашняя%20одежда',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Офис",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 90,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 10460,
        catName: 'office_bigroot',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Пляжная",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 91,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 10043,
        catName: 'beach1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Религиозная",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 92,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 61439,
        catName: 'religion',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Для свадьбы",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 93,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 10016,
        catName: 'wedding',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Спецодежда и СИЗы",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 94,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        catId: 7404,
        catName: 'work_clothes',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "Подарки",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 66,
        "catalogId": 95,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi",
        "urls": [
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=benefit&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=priceup&cardSize=c516x688&page=1",
            "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=rate&cardSize=c516x688&page=1",
        ],
        api: 1,
        search: 'Подарки%20для%20женщин',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 67}
        ]
    },
    {
        "name": "Обувь",
        "platform": 2,
        "parent": -1,
        "catalogId": 96,
        "up_name": "Обувь",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002}
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 96,
        "catalogId": 97,
        api: 1,
    },
    {
        "name": "Детская",
        "platform": 2,
        "parent": 96,
        "catalogId": 98,
        api: 1,
        catId: 128330,
        catName: 'children_shoes',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 97}
        ]
    },
    {
        "name": "Для новорожденных",
        "platform": 2,
        "parent": 96,
        "catalogId": 99,
        api: 1,
        catId: 8225,
        catName: 'children_shoes',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 97}
        ]
    },
    {
        "name": "Женская",
        "platform": 2,
        "parent": 96,
        "catalogId": 100,
        api: 1,
        search: 'Женская%20обувь',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 97}
        ]
    },
    {
        "name": "Мужская",
        "platform": 2,
        "parent": 96,
        "catalogId": 101,
        api: 1,
        catId: 751,
        catName: 'men_shoes',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 97}
        ]
    },
    {
        "name": "Ортопедическая обувь",
        "platform": 2,
        "parent": 96,
        "catalogId": 102,
        api: 1,
        catId: 128335,
        catName: 'shealth1t1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 97}
        ]
    },
    {
        "name": "Аксессуары для обуви",
        "platform": 2,
        "parent": 96,
        "catalogId": 103,
        api: 1,
        catId: 128335,
        catName: 'shoes_accessories1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 97}
        ]
    },
    {
        "name": "Детям",
        "platform": 2,
        "parent": -1,
        "up_name": "Детям",
        "catalogId": 104,
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 104,
        "catalogId": 105,
        api: 1,
    },
    {
        "name": "Для девочек",
        "platform": 2,
        "parent": 104,
        "catalogId": 106,
        api: 1,
        search: 'Одежда%20для%20девочек',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Для мальчиков",
        "platform": 2,
        "parent": 104,
        "catalogId": 107,
        api: 1,
        search: 'Одежда%20для%20мальчиков',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Для новорожденных",
        "platform": 2,
        "parent": 104,
        "catalogId": 108,
        api: 1,
        catId: 199,
        catName: 'babies1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Детская электроника",
        "platform": 2,
        "parent": 104,
        "catalogId": 109,
        api: 1,
        catId: 58513,
        catName: 'electronic19',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Конструкторы",
        "platform": 2,
        "parent": 104,
        "catalogId": 110,
        api: 1,
        catId: 0,
        subject: 945,
        catName: 'toys1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Детский транспорт",
        "platform": 2,
        "parent": 104,
        "catalogId": 111,
        api: 1,
        catId: 9374,
        catName: 'sport27',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Детское питание",
        "platform": 2,
        "parent": 104,
        "catalogId": 112,
        api: 1,
        catId: 0,
        subject: 2638,
        catName: 'children_things2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Детская религиозная одежда",
        "platform": 2,
        "parent": 104,
        "catalogId": 113,
        api: 1,
        catId: 61448,
        catName: 'children_things2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Товары для малышей",
        "platform": 2,
        "parent": 104,
        "catalogId": 114,
        api: 1,
        catId: 243,
        catName: 'children_things3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Товары для малышей",
        "platform": 2,
        "parent": 104,
        "catalogId": 115,
        api: 1,
        catId: 243,
        catName: 'children_things3',
        isWork: "none",
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Подгузники",
        "platform": 2,
        "parent": 104,
        "catalogId": 116,
        api: 1,
        catId: 7107,
        catName: 'children_things2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Подарки для детей",
        "platform": 2,
        "parent": 104,
        "catalogId": 117,
        api: 1,
        search: 'Подарки%20для%20детей',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 105}
        ]
    },
    {
        "name": "Мужчинам",
        "platform": 2,
        "parent": -1,
        "catalogId": 118,
        "up_name": "Мужчинам",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 118,
        "catalogId": 119,
        api: 1,
    },
    {
        "name": "Брюки",
        "platform": 2,
        "parent": 118,
        "catalogId": 120,
        api: 1,
        catId: 8144,
        catName: 'men_clothes1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Верхняя одежда",
        "platform": 2,
        "parent": 118,
        "catalogId": 121,
        api: 1,
        catId: 63011,
        catName: 'men_clothes1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Джемперы, водолазки и кардиганы",
        "platform": 2,
        "parent": 118,
        "catalogId": 122,
        api: 1,
        catId: 8148,
        catName: 'men_clothes1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Джинсы",
        "platform": 2,
        "parent": 118,
        "catalogId": 123,
        api: 1,
        catId: 8149,
        catName: 'men_clothes2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Комбинезоны и полукомбинезоны",
        "platform": 2,
        "parent": 118,
        "catalogId": 124,
        api: 1,
        catId: 8152,
        catName: 'men_clothes2',
        publications: [
            {channel: '-1817408131', catalogId: 1002}
        ]
    },
    {
        "name": "Костюмы",
        "platform": 2,
        "parent": 118,
        "catalogId": 125,
        api: 1,
        catId: 8153,
        catName: 'men_clothes2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Лонгсливы",
        "platform": 2,
        "parent": 118,
        "catalogId": 126,
        api: 1,
        catId: 9412,
        catName: 'men_clothes3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Майки",
        "platform": 2,
        "parent": 118,
        "catalogId": 127,
        api: 1,
        catId: 129176,
        catName: 'men_clothes3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Пиджаки, жилеты и жакеты",
        "platform": 2,
        "parent": 118,
        "catalogId": 128,
        api: 1,
        catId: 8155,
        catName: 'men_clothes3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Пижамы",
        "platform": 2,
        "parent": 118,
        "catalogId": 129,
        api: 1,
        catId: 129258,
        catName: 'men_clothes3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Рубашки",
        "platform": 2,
        "parent": 118,
        "catalogId": 130,
        api: 1,
        catId: 8156,
        catName: 'men_clothes3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Толстовки, свитшоты и худи",
        "platform": 2,
        "parent": 118,
        "catalogId": 131,
        api: 1,
        catId: 8158,
        catName: 'men_clothes3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Футболки",
        "platform": 2,
        "parent": 118,
        "catalogId": 132,
        api: 1,
        catId: 8159,
        catName: 'men_clothes6',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Футболки-поло",
        "platform": 2,
        "parent": 118,
        "catalogId": 133,
        api: 1,
        catId: 129257,
        catName: 'men_clothes5',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Шорты",
        "platform": 2,
        "parent": 118,
        "catalogId": 134,
        api: 1,
        catId: 11428,
        catName: 'men_clothes5',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "64. Белье",
        "platform": 2,
        "parent": 118,
        "catalogId": 135,
        api: 1,
        catId: 567,
        catName: 'men_mixtape',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Большие размеры",
        "platform": 2,
        "parent": 118,
        "catalogId": 136,
        api: 1,
        catId: 9002,
        catName: 'men_mixtape',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Для высоких",
        "platform": 2,
        "parent": 118,
        "catalogId": 137,
        api: 1,
        catId: 60898,
        catName: 'men_clothes7',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Для невысоких",
        "platform": 2,
        "parent": 118,
        "catalogId": 138,
        api: 1,
        catId: 60899,
        catName: 'men_clothes7',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Одежда для дома",
        "platform": 2,
        "parent": 118,
        "catalogId": 139,
        api: 1,
        catId: 8154,
        catName: 'men_clothes8',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Офис",
        "platform": 2,
        "parent": 118,
        "catalogId": 140,
        api: 1,
        catId: 10471,
        catName: 'men_clothes5',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Пляжная одежда",
        "platform": 2,
        "parent": 118,
        "catalogId": 141,
        api: 1,
        catId: 10039,
        catName: 'men_mixtape',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Религиозная",
        "platform": 2,
        "parent": 118,
        "catalogId": 142,
        api: 1,
        catId: 61446,
        catName: 'men_clothes5',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Свадьба",
        "platform": 2,
        "parent": 118,
        "catalogId": 143,
        api: 1,
        catId: 10017,
        catName: 'wedding',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Спецодежда и СИЗы",
        "platform": 2,
        "parent": 118,
        "catalogId": 144,
        api: 1,
        catId: 7405,
        catName: 'work_clothes',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Подарки мужчинам",
        "platform": 2,
        "parent": 118,
        "catalogId": 145,
        api: 1,
        search: 'Подарки%20мужчинам',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 119}
        ]
    },
    {
        "name": "Дом",
        "platform": 2,
        "parent": -1,
        "catalogId": 146,
        "up_name": "Дом",
        api: 1,
        
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 146,
        "catalogId": 147,
        api: 1,
    },
    {
        "name": "76. Ванная",
        "platform": 2,
        "parent": 146,
        "catalogId": 148,
        api: 1,
        search: 'Товары%20для%20ванной',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Кухня",
        "platform": 2,
        "parent": 146,
        "catalogId": 149,
        api: 1,
        search: 'Товары%20для%20кухни',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Предметы интерьера",
        "platform": 2,
        "parent": 146,
        "catalogId": 150,
        api: 1,
        search: 'Предметы%20интерьера',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Товары для спальни",
        "platform": 2,
        "parent": 146,
        "catalogId": 151,
        api: 1,
        search: 'Товары%20для%20спальни',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Товары для гостиной",
        "platform": 2,
        "parent": 146,
        "catalogId": 152,
        api: 1,
        search: 'Товары%20для%20гостиной',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Детская",
        "platform": 2,
        "parent": 146,
        "catalogId": 153,
        api: 1,
        search: 'Товары%20для%20детской%20комнаты',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Досуг",
        "platform": 2,
        "parent": 146,
        "catalogId": 154,
        api: 1,
        search: 'Товары%20для%20досуга%20и%20творчества',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Для праздника",
        "platform": 2,
        "parent": 146,
        "catalogId": 155,
        api: 1,
        search: 'Товары%20для%20праздника',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Зеркала",
        "platform": 2,
        "parent": 146,
        "catalogId": 156,
        api: 1,
        catId: 0,
        subject: 198,
        catName: 'interior3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Коврики",
        "platform": 2,
        "parent": 146,
        "catalogId": 157,
        api: 1,
        catId: 8459,
        catName: 'interior3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Кронштейны",
        "platform": 2,
        "parent": 146,
        "catalogId": 158,
        api: 1,
        catId: 10027,
        catName: 'housecraft6',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Освещение",
        "platform": 2,
        "parent": 146,
        "catalogId": 159,
        api: 1,
        search: 'Освещение%20для%20квартиры',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Для курения",
        "platform": 2,
        "parent": 146,
        "catalogId": 160,
        api: 1,
        catId: 0,
        catName: 'housecraft4',
        subject: 6249,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Отдых на природе",
        "platform": 2,
        "parent": 146,
        "catalogId": 161,
        api: 1,
        search: 'Отдых%20на%20природе',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Парфюмерия для дома",
        "platform": 2,
        "parent": 146,
        "catalogId": 162,
        api: 1,
        catId: 9183,
        catName: 'interior3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Прихожая",
        "platform": 2,
        "parent": 146,
        "catalogId": 163,
        api: 1,
        catId: 60590,
        catName: 'hallway1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Прихожая",
        "platform": 2,
        "parent": 146,
        "catalogId": 164,
        api: 1,
        catId: 7395,
        catName: 'religion',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Сувенирная продукция",
        "platform": 2,
        "parent": 146,
        "catalogId": 165,
        api: 1,
        catId: 17135,
        catName: 'interior4',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Хозяйственные товары",
        "platform": 2,
        "parent": 146,
        "catalogId": 166,
        api: 1,
        search: 'Хозяйственные%20товары',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Хранение вещей",
        "platform": 2,
        "parent": 146,
        "catalogId": 167,
        api: 1,
        catId: 62506,
        catName: 'housecraft4',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Цветы, вазы и кашпо",
        "platform": 2,
        "parent": 146,
        "catalogId": 168,
        api: 1,
        catId: 295,
        catName: 'interior4',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Шторы",
        "platform": 2,
        "parent": 146,
        "catalogId": 169,
        api: 1,
        catId: 62836,
        catName: 'housecraft5',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 147}
        ]
    },
    {
        "name": "Красота",
        "platform": 2,
        "parent": -1,
        "catalogId": 170,
        api: 1,
        "up_name": "Красота",
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 170,
        "catalogId": 171,
        api: 1,
    },
    {
        "name": "Аксессуары",
        "platform": 2,
        "parent": 170,
        "catalogId": 172,
        api: 1,
        catId: 4872,
        catName: 'beauty7',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Волосы",
        "platform": 2,
        "parent": 170,
        "catalogId": 173,
        api: 1,
        catId: 8961,
        catName: 'beauty8',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Аптечная косметика",
        "platform": 2,
        "parent": 170,
        "catalogId": 174,
        api: 1,
        catId: 8727,
        catName: 'beauty8',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Детская декоративная косметика",
        "platform": 2,
        "parent": 170,
        "catalogId": 175,
        api: 1,
        catId: 9454,
        catName: 'beauty1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Для загара",
        "platform": 2,
        "parent": 170,
        "catalogId": 176,
        api: 1,
        catId: 8988,
        catName: 'beauty9',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Для мам и малышей",
        "platform": 2,
        "parent": 170,
        "catalogId": 177,
        api: 1,
        catId: 6837,
        catName: 'beauty9',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Израильская косметика",
        "platform": 2,
        "parent": 170,
        "catalogId": 178,
        api: 1,
        catId: 60751,
        catName: 'beauty1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Инструменты для парикмахеров",
        "platform": 2,
        "parent": 170,
        "catalogId": 179,
        api: 1,
        catId: 60506,
        catName: 'beauty10',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Корейские бренды",
        "platform": 2,
        "parent": 170,
        "catalogId": 180,
        api: 1,
        catId: 58217,
        catName: 'beauty11',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Косметические аппараты",
        "platform": 2,
        "parent": 170,
        "catalogId": 181,
        api: 1,
        catId: 5381,
        catName: 'appliances1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Макияж",
        "platform": 2,
        "parent": 170,
        "catalogId": 182,
        api: 1,
        catId: 8924,
        catName: 'beauty13',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Мужская линия",
        "platform": 2,
        "parent": 170,
        "catalogId": 183,
        api: 1,
        catId: 8999,
        catName: 'beauty14',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Наборы для ухода",
        "platform": 2,
        "parent": 170,
        "catalogId": 184,
        api: 1,
        catId: 0,
        subject: 403,
        catName: 'beauty2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Ногти",
        "platform": 2,
        "parent": 170,
        "catalogId": 185,
        api: 1,
        catId: 8951,
        catName: 'beauty18',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Органическая косметика",
        "platform": 2,
        "parent": 170,
        "catalogId": 186,
        api: 1,
        catId: 10012,
        catName: 'beauty16',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Парфюмерия",
        "platform": 2,
        "parent": 170,
        "catalogId": 187,
        api: 1,
        search: 'Парфюмерия',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Подарочные наборы",
        "platform": 2,
        "parent": 170,
        "catalogId": 188,
        api: 1,
        catId: 59860,
        catName: 'beauty2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Профессиональная косметика",
        "platform": 2,
        "parent": 170,
        "catalogId": 189,
        api: 1,
        catId: 7036,
        catName: 'beauty2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Средства личной гигиены",
        "platform": 2,
        "parent": 170,
        "catalogId": 190,
        api: 1,
        catId: 8997,
        catName: 'beauty2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Гигиена полости рта",
        "platform": 2,
        "parent": 170,
        "catalogId": 191,
        api: 1,
        catId: 8996,
        catName: 'beauty2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Уход за кожей",
        "platform": 2,
        "parent": 170,
        "catalogId": 192,
        api: 1,
        search: 'Косметика%20по%20уходу%20за%20кожей',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 171}
        ]
    },
    {
        "name": "Аксессуары",
        "platform": 2,
        "parent": -1,
        "catalogId": 193,
        "up_name": "Аксессуары",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002}
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 193,
        "catalogId": 194,
        api: 1,
    },
    {
        "name": "Аксессуары для волос",
        "platform": 2,
        "parent": 193,
        "catalogId": 195,
        api: 1,
        catId: 0,
        subject: 1465,
        catName: 'head_accessories1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Аксессуары для одежды",
        "platform": 2,
        "parent": 193,
        "catalogId": 196,
        api: 1,
        catId: 9990,
        catName: 'clothes_accessories2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Бижутерия",
        "platform": 2,
        "parent": 193,
        "catalogId": 197,
        api: 1,
        serach: 'Бижутерия',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Веера",
        "platform": 2,
        "parent": 193,
        "catalogId": 198,
        api: 1,
        catId: 0,
        subject: 2920,
        catName: 'hand_accessories2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Галстуки и бабочки",
        "platform": 2,
        "parent": 193,
        "catalogId": 199,
        api: 1,
        catId: 9980,
        catName: 'clothes_accessories2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Головные уборы",
        "platform": 2,
        "parent": 193,
        "catalogId": 200,
        api: 1,
        catId: 9967,
        catName: 'head_accessories2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Зеркальца",
        "platform": 2,
        "parent": 193,
        "catalogId": 201,
        api: 1,
        catId: 0,
        subject: 63,
        catName: 'hand_accessories2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Зонты",
        "platform": 2,
        "parent": 193,
        "catalogId": 202,
        api: 1,
        catId: 9974,
        catName: 'hand_accessories2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Кошельки и кредитницы",
        "platform": 2,
        "parent": 193,
        "catalogId": 203,
        api: 1,
        catId: 9973,
        catName: 'hand_accessories1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Маски для сна",
        "platform": 2,
        "parent": 193,
        "catalogId": 204,
        api: 1,
        catId: 0,
        subject: 985,
        catName: 'head_accessories1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Носовые платки",
        "platform": 2,
        "parent": 193,
        "catalogId": 205,
        api: 1,
        catId: 0,
        subject: 946,
        catName: 'hand_accessories1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Очки и футляры",
        "platform": 2,
        "parent": 193,
        "catalogId": 206,
        api: 1,
        catId: 9972,
        catName: 'clothes_accessories1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Перчатки и варежки",
        "platform": 2,
        "parent": 193,
        "catalogId": 207,
        api: 1,
        catId: 9977,
        catName: 'hand_accessories1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Платки и шарфы",
        "platform": 2,
        "parent": 193,
        "catalogId": 208,
        api: 1,
        catId: 9971,
        catName: 'clothes_accessories3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Религиозные",
        "platform": 2,
        "parent": 193,
        "catalogId": 209,
        api: 1,
        catId: 128331,
        catName: 'clothes_accessories2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Ремни и пояса",
        "platform": 2,
        "parent": 193,
        "catalogId": 210,
        api: 1,
        catId: 9970,
        catName: 'clothes_accessories3',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Сумки и рюкзаки",
        "platform": 2,
        "parent": 193,
        "catalogId": 211,
        api: 1,
        search: 'Сумки%20и%20рюкзаки',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Часы и ремешки",
        "platform": 2,
        "parent": 193,
        "catalogId": 212,
        api: 1,
        catId: 9976,
        catName: 'hand_accessories2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Чемоданы и защита багажа",
        "platform": 2,
        "parent": 193,
        "catalogId": 213,
        api: 1,
        catId: 62903,
        catName: 'bags1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 194}
        ]
    },
    {
        "name": "Электроника",
        "platform": 2,
        "parent": -1,
        "catalogId": 214,
        "up_name": "Электроника",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 214,
        "catalogId": 215,
    },
    {
        "name": "Автоэлектроника и навигация",
        "platform": 2,
        "parent": 214,
        "catalogId": 216,
        catId: 9835,
        catName: 'electronic14',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Гарнитуры и наушники",
        "platform": 2,
        "parent": 214,
        "catalogId": 217,
        catId: 9468,
        catName: 'electronic14',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Детская электроника",
        "platform": 2,
        "parent": 214,
        "catalogId": 218,
        catId: 58513,
        catName: 'electronic14',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Игровые консоли и игры",
        "platform": 2,
        "parent": 214,
        "catalogId": 219,
        catId: 15693,
        catName: 'electronic14',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Кабели и зарядные устройства",
        "platform": 2,
        "parent": 214,
        "catalogId": 220,
        catId: 59132,
        catName: 'electronic14',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Музыка и видео",
        "platform": 2,
        "parent": 214,
        "catalogId": 221,
        catId: 128516,
        catName: 'books3',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Ноутбуки и компьютеры",
        "platform": 2,
        "parent": 214,
        "catalogId": 222,
        catId: 9491,
        catName: 'electronic18',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Офисная техника",
        "platform": 2,
        "parent": 214,
        "catalogId": 223,
        catId: 58331,
        catName: 'electronic15',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Развлечения и гаджеты",
        "platform": 2,
        "parent": 214,
        "catalogId": 224,
        catId: 9497,
        catName: 'electronic15',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Сетевое оборудование",
        "platform": 2,
        "parent": 214,
        "catalogId": 225,
        catId: 9846,
        catName: 'electronic14',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Системы безопасности",
        "platform": 2,
        "parent": 214,
        "catalogId": 226,
        catId: 9746,
        catName: 'electronic17',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Cмартфоны и телефоны",
        "platform": 2,
        "parent": 214,
        "catalogId": 227,
        search: 'Смартфоны%20и%20телефоны',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Смарт-часы и браслеты",
        "platform": 2,
        "parent": 214,
        "catalogId": 228,
        catId: 9845,
        catName: 'electronic17',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Солнечные электростанции и комплектующие",
        "platform": 2,
        "parent": 214,
        "catalogId": 229,
        catId: 0,
        catName: 'electronic17',
        api: 1,
        subject: 8395,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "ТВ, Аудио, Фото, Видео техника",
        "platform": 2,
        "parent": 214,
        "catalogId": 230,
        catId: 9834,
        catName: 'electronic13',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Торговое оборудование",
        "platform": 2,
        "parent": 214,
        "catalogId": 231,
        catId: 0,
        catName: 'electronic14',
        api: 1,
        subject: 2479,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Умный дом",
        "platform": 2,
        "parent": 214,
        "catalogId": 232,
        catId: 7588,
        catName: 'electronic14',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Электротранспорт и аксессуары",
        "platform": 2,
        "parent": 214,
        "catalogId": 233,
        catId: 9240,
        catName: 'electronic14',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 215}
        ]
    },
    {
        "name": "Игрушки",
        "platform": 2,
        "parent": -1,
        "catalogId": 234,
        "up_name": "Игрушки",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 234,
        "catalogId": 235,
    },
    {
        "name": "Антистресс",
        "platform": 2,
        "parent": 234,
        "catalogId": 236,
        api: 1,
        catId: 9541,
        catName: 'toys5',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Для малышей",
        "platform": 2,
        "parent": 234,
        "catalogId": 237,
        api: 1,
        catId: 482,
        catName: 'toys1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Для песочницы",
        "platform": 2,
        "parent": 234,
        "catalogId": 238,
        api: 1,
        catId: 8274,
        catName: 'toys1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Игровые комплексы",
        "platform": 2,
        "parent": 234,
        "catalogId": 239,
        api: 1,
        catId: 8275,
        catName: 'toys1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Игровые наборы",
        "platform": 2,
        "parent": 234,
        "catalogId": 240,
        api: 1,
        catId: 8604,
        catName: 'toys1',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Игрушечное оружие и аксессуары",
        "platform": 2,
        "parent": 234,
        "catalogId": 241,
        api: 1,
        catId: 128562,
        catName: 'toys2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Игрушечный транспорт",
        "platform": 2,
        "parent": 234,
        "catalogId": 242,
        api: 1,
        catId: 8277,
        catName: 'toys2',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Игрушки для ванной",
        "platform": 2,
        "parent": 234,
        "catalogId": 243,
        api: 1,
        catId: 0,
        catName: 'toys2',
        subject: 227,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Интерактивные",
        "platform": 2,
        "parent": 234,
        "catalogId": 244,
        api: 1,
        catId: 0,
        catName: 'toys2',
        subject: 2095,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Кинетический песок",
        "platform": 2,
        "parent": 234,
        "catalogId": 245,
        api: 1,
        catId: 0,
        catName: 'toys2',
        subject: 1052,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Конструкторы",
        "platform": 2,
        "parent": 234,
        "catalogId": 246,
        api: 1,
        catId: 0,
        catName: 'toys2',
        subject: 117,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Конструкторы LEGO",
        "platform": 2,
        "parent": 234,
        "catalogId": 247,
        api: 1,
        catId: 128594,
        catName: 'toys2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Куклы и аксессуары",
        "platform": 2,
        "parent": 234,
        "catalogId": 248,
        api: 1,
        catId: 8281,
        catName: 'toys3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Музыкальные",
        "platform": 2,
        "parent": 234,
        "catalogId": 249,
        api: 1,
        catId: 8282,
        catName: 'toys3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "174. Мыльные пузыри",
        "platform": 2,
        "parent": 234,
        "catalogId": 250,
        api: 1,
        catId: 0,
        catName: 'toys3',
        subject: 1029,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Мягкие игрушки",
        "platform": 2,
        "parent": 234,
        "catalogId": 251,
        api: 1,
        catId: 0,
        catName: 'toys3',
        subject: 268,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Наборы для опытов",
        "platform": 2,
        "parent": 234,
        "catalogId": 252,
        api: 1,
        catId: 0,
        catName: 'toys3',
        subject: 2619,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Настольные игры",
        "platform": 2,
        "parent": 234,
        "catalogId": 253,
        api: 1,
        catId: 8285,
        catName: 'toys6',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Радиоуправляемые",
        "platform": 2,
        "parent": 234,
        "catalogId": 254,
        api: 1,
        catId: 0,
        catName: 'toys3',
        subject: 123,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Развивающие игрушки",
        "platform": 2,
        "parent": 234,
        "catalogId": 255,
        api: 1,
        catId: 8287,
        catName: 'toys4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Сборные модели",
        "platform": 2,
        "parent": 234,
        "catalogId": 256,
        api: 1,
        catId: 0,
        catName: 'toys3',
        subject: 2763,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Спортивные игры",
        "platform": 2,
        "parent": 234,
        "catalogId": 257,
        api: 1,
        catId: 8093,
        catName: 'toys3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Сюжетно-ролевые игры",
        "platform": 2,
        "parent": 234,
        "catalogId": 258,
        api: 1,
        catId: 16260,
        catName: 'toys3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Творчество и рукоделие",
        "platform": 2,
        "parent": 234,
        "catalogId": 259,
        api: 1,
        catId: 8288,
        catName: 'toys5',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Фигурки и роботы",
        "platform": 2,
        "parent": 234,
        "catalogId": 260,
        api: 1,
        catId: 8289,
        catName: 'toys6',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 235}
        ]
    },
    {
        "name": "Мебель",
        "platform": 2,
        "parent": -1,
        "catalogId": 261,
        "up_name": 'Мебель',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 261,
        "catalogId": 262,
        api: 1,
    },
    {
        "name": "Бескаркасная мебель",
        "platform": 2,
        "parent": 261,
        "catalogId": 263,
        api: 1,
        catId: 129026,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Детская мебель",
        "platform": 2,
        "parent": 261,
        "catalogId": 264,
        api: 1,
        catId: 129027,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Диваны и кресла",
        "platform": 2,
        "parent": 261,
        "catalogId": 265,
        api: 1,
        catId: 129028,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Столы и стулья",
        "platform": 2,
        "parent": 261,
        "catalogId": 266,
        api: 1,
        catId: 129169,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Компьютерная мебель",
        "platform": 2,
        "parent": 261,
        "catalogId": 267,
        api: 1,
        catId: 130734,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Мебель для геймеров",
        "platform": 2,
        "parent": 261,
        "catalogId": 268,
        api: 1,
        catId: 130731,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Мебель для гостиной",
        "platform": 2,
        "parent": 261,
        "catalogId": 269,
        api: 1,
        catId: 129029,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Мебель для кухни",
        "platform": 2,
        "parent": 261,
        "catalogId": 270,
        api: 1,
        catId: 129030,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Мебель для прихожей",
        "platform": 2,
        "parent": 261,
        "catalogId": 271,
        api: 1,
        catId: 129031,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Мебель для спальни",
        "platform": 2,
        "parent": 261,
        "catalogId": 272,
        api: 1,
        catId: 129032,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Гардеробная мебель",
        "platform": 2,
        "parent": 261,
        "catalogId": 273,
        api: 1,
        catId: 130759,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Офисная мебель",
        "platform": 2,
        "parent": 261,
        "catalogId": 274,
        api: 1,
        catId: 129033,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Торговая мебель",
        "platform": 2,
        "parent": 261,
        "catalogId": 275,
        api: 1,
        catId: 130694,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Зеркала",
        "platform": 2,
        "parent": 261,
        "catalogId": 276,
        api: 1,
        catId: 130727,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Мебельная фурнитура",
        "platform": 2,
        "parent": 261,
        "catalogId": 277,
        api: 1,
        catId: 129168,
        catName: 'rooms',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Товары для взрослых",
        "platform": 2,
        "parent": -1,
        "catalogId": 278,
        "up_name": "Товары для взрослых",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Белье и аксессуары",
        "platform": 2,
        "parent": 278,
        "catalogId": 279,
        api: 1,
        catId: 8174,
        catName: 'adult1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Игры и сувениры",
        "platform": 2,
        "parent": 278,
        "catalogId": 280,
        api: 1,
        catId: 62073,
        catName: 'adult1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
        ]
    },
    {
        "name": "Интимная косметика",
        "platform": 2,
        "parent": 278,
        "catalogId": 281,
        api: 1,
        catId: 10013,
        catName: 'adult1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
        ]
    },
    {
        "name": "Интимная съедобная косметика",
        "platform": 2,
        "parent": 278,
        "catalogId": 282,
        api: 1,
        catId: 128338,
        catName: 'adult1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
        ]
    },
    {
        "name": "Презервативы и лубриканты",
        "platform": 2,
        "parent": 278,
        "catalogId": 283,
        api: 1,
        catId: 62071,
        catName: 'adult1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Секс игрушки",
        "platform": 2,
        "parent": 278,
        "catalogId": 284,
        api: 1,
        catId: 62457,
        catName: 'adult1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Фетиш и БДСМ",
        "platform": 2,
        "parent": 278,
        "catalogId": 285,
        api: 1,
        catId: 62064,
        catName: 'adult1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 262}
        ]
    },
    {
        "name": "Продукты",
        "platform": 2,
        "parent": -1,
        "catalogId": 286,
        "up_name": "Продукты",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002}
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 286,
        "catalogId": 287,
        api: 1,
    },
    {
        "name": "Вкусные подарки",
        "platform": 2,
        "parent": 286,
        "catalogId": 288,
        api: 1,
        catId: 58757,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Чай и кофе",
        "platform": 2,
        "parent": 286,
        "catalogId": 289,
        api: 1,
        catId: 9510,
        catName: 'product1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Сладости и хлебобулочные изделия",
        "platform": 2,
        "parent": 286,
        "catalogId": 290,
        api: 1,
        catId: 10558,
        catName: 'product1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Бакалея",
        "platform": 2,
        "parent": 286,
        "catalogId": 291,
        api: 1,
        catId: 10411,
        catName: 'product2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Детское питание",
        "platform": 2,
        "parent": 286,
        "catalogId": 292,
        api: 1,
        catId: 0,
        catName: 'product3',
        subject: 2638,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Добавки пищевые",
        "platform": 2,
        "parent": 286,
        "catalogId": 293,
        api: 1,
        catId: 60125,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Здоровое питание",
        "platform": 2,
        "parent": 286,
        "catalogId": 294,
        api: 1,
        catId: 10299,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Мясная продукция",
        "platform": 2,
        "parent": 286,
        "catalogId": 295,
        api: 1,
        catId: 62466,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Молочные продукты и яйца",
        "platform": 2,
        "parent": 286,
        "catalogId": 296,
        api: 1,
        catId: 10305,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Напитки",
        "platform": 2,
        "parent": 286,
        "catalogId": 297,
        api: 1,
        catId: 10557,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Снеки",
        "platform": 2,
        "parent": 286,
        "catalogId": 298,
        api: 1,
        catId: 10297,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Замороженная продукция",
        "platform": 2,
        "parent": 286,
        "catalogId": 299,
        api: 1,
        catId: 128326,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Фрукты и ягоды",
        "platform": 2,
        "parent": 286,
        "catalogId": 300,
        api: 1,
        catId: 128327,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Овощи",
        "platform": 2,
        "parent": 286,
        "catalogId": 301,
        api: 1,
        catId: 128328,
        catName: 'product3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 287}
        ]
    },
    {
        "name": "Бытовая техника",
        "platform": 2,
        "parent": -1,
        "catalogId": 302,
        "up_name": "Бытовая техника",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 302,
        "catalogId": 303,
        api: 1,
    },
    {
        "name": "Климатическая техника",
        "platform": 2,
        "parent": 302,
        "catalogId": 304,
        api: 1,
        catId: 9808,
        catName: 'appliances1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 303}
        ]
    },
    {
        "name": "Красота и здоровье",
        "platform": 2,
        "parent": 302,
        "catalogId": 305,
        api: 1,
        catId: 5380,
        catName: 'appliances1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 303}
        ]
    },
    {
        "name": "Садовая техника",
        "platform": 2,
        "parent": 302,
        "catalogId": 306,
        api: 1,
        catId: 0,
        catName: 'appliances2',
        subject: 2240,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 303}
        ]
    },
    {
        "name": "Техника для дома",
        "platform": 2,
        "parent": 302,
        "catalogId": 307,
        api: 1,
        catId: 5364,
        catName: 'appliances2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 303}
        ]
    },
    {
        "name": "Техника для кухни",
        "platform": 2,
        "parent": 302,
        "catalogId": 308,
        api: 1,
        catId: 5351,
        catName: 'appliances3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 303}
        ]
    },
    {
        "name": "Крупная бытовая техника",
        "platform": 2,
        "parent": 302,
        "catalogId": 309,
        api: 1,
        catId: 62379,
        catName: 'appliances3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 303}
        ]
    },
    {
        "name": "Зоотовары",
        "platform": 2,
        "parent": -1,
        "catalogId": 310,
        "up_name": "Зоотовары",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 303}
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 310,
        "catalogId": 311,
        api: 1,
    },
    {
        "name": "Для кошек",
        "platform": 2,
        "parent": 310,
        "catalogId": 312,
        api: 1,
        catId: 16347,
        catName: 'zoo1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Для собак",
        "platform": 2,
        "parent": 310,
        "catalogId": 313,
        api: 1,
        catId: 16438,
        catName: 'zoo2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Для птиц",
        "platform": 2,
        "parent": 310,
        "catalogId": 314,
        api: 1,
        catId: 16449,
        catName: 'zoo1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Для грызунов и хорьков",
        "platform": 2,
        "parent": 310,
        "catalogId": 315,
        api: 1,
        catId: 16467,
        catName: 'zoo1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Для лошадей",
        "platform": 2,
        "parent": 310,
        "catalogId": 316,
        api: 1,
        catId: 58591,
        catName: 'zoo1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Аквариумистика",
        "platform": 2,
        "parent": 310,
        "catalogId": 317,
        api: 1,
        catId: 10540,
        catName: 'zoo1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Фермерство",
        "platform": 2,
        "parent": 310,
        "catalogId": 318,
        api: 1,
        catId: 128591,
        catName: 'zoo1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Корм и лакомства",
        "platform": 2,
        "parent": 310,
        "catalogId": 319,
        api: 1,
        catId: 130708,
        catName: 'zoo3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Аксессуары для кормления",
        "platform": 2,
        "parent": 310,
        "catalogId": 320,
        api: 1,
        catId: 130709,
        catName: 'zoo3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Лотки и наполнители",
        "platform": 2,
        "parent": 310,
        "catalogId": 321,
        api: 1,
        catId: 130710,
        catName: 'zoo3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Транспортировка",
        "platform": 2,
        "parent": 310,
        "catalogId": 322,
        api: 1,
        catId: 130711,
        catName: 'zoo4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Амуниция и дрессировка",
        "platform": 2,
        "parent": 310,
        "catalogId": 323,
        api: 1,
        catId: 130716,
        catName: 'zoo4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Игрушки",
        "platform": 2,
        "parent": 310,
        "catalogId": 324,
        api: 1,
        catId: 0,
        catName: 'zoo4',
        subject: 731,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Груминг и уход",
        "platform": 2,
        "parent": 310,
        "catalogId": 325,
        api: 1,
        catId: 130714,
        catName: 'zoo4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Одежда",
        "platform": 2,
        "parent": 310,
        "catalogId": 326,
        api: 1,
        catId: 130712,
        catName: 'zoo4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Ветаптека",
        "platform": 2,
        "parent": 310,
        "catalogId": 327,
        api: 1,
        catId: 130717,
        catName: 'zoo4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 311}
        ]
    },
    {
        "name": "Спорт",
        "platform": 2,
        "parent": -1,
        "catalogId": 328,
        "up_name": "Спорт",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002}
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 328,
        "catalogId": 329,
    },
    {
        "name": "Фитнес и тренажеры",
        "platform": 2,
        "parent": 328,
        "catalogId": 330,
        api: 1,
        catId: 58875,
        catName: 'sport13',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Фитнес и тренажеры",
        "platform": 2,
        "parent": 328,
        "catalogId": 331,
        api: 1,
        isWork: "none",
        catId: 58875,
        catName: 'sport13',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Велоспорт",
        "platform": 2,
        "parent": 328,
        "catalogId": 332,
        api: 1,
        search: 'Товары%20для%20велоспорта',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Йога/Пилатес",
        "platform": 2,
        "parent": 328,
        "catalogId": 333,
        api: 1,
        catId: 9098,
        catName: 'sport14',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Охота и рыбалка",
        "platform": 2,
        "parent": 328,
        "catalogId": 334,
        api: 1,
        catId: 9393,
        catName: 'sport20',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Самокаты/Ролики/Скейтборды",
        "platform": 2,
        "parent": 328,
        "catalogId": 335,
        api: 1,
        catId: 2204,
        catName: 'sport10',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Туризм/Походы",
        "platform": 2,
        "parent": 328,
        "catalogId": 336,
        api: 1,
        search: 'Товары%20для%20туризма%20и%20кемпинга',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Бег/Ходьба",
        "platform": 2,
        "parent": 328,
        "catalogId": 337,
        api: 1,
        search: 'Товары%20для%20бега%20и%20скандинавской%20ходьбы',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Командные виды спорта",
        "platform": 2,
        "parent": 328,
        "catalogId": 338,
        api: 1,
        catId: 58871,
        catName: 'sport22',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Командные виды спорта",
        "platform": 2,
        "parent": 328,
        "catalogId": 339,
        api: 1,
        catId: 58871,
        isWork: "none",
        catName: 'sport22',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Водные виды спорта",
        "platform": 2,
        "parent": 328,
        "catalogId": 340,
        api: 1,
        catId: 832,
        catName: 'sport22',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Зимние виды спорта",
        "platform": 2,
        "parent": 328,
        "catalogId": 341,
        api: 1,
        catId: 58797,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Поддержка и восстановление",
        "platform": 2,
        "parent": 328,
        "catalogId": 342,
        api: 1,
        catId: 59997,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Спортивное питание и косметика",
        "platform": 2,
        "parent": 328,
        "catalogId": 343,
        api: 1,
        catId: 8471,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Бадминтон/Теннис",
        "platform": 2,
        "parent": 328,
        "catalogId": 344,
        api: 1,
        catId: 58795,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Бильярд/Гольф/Дартс/Метание ножей",
        "platform": 2,
        "parent": 328,
        "catalogId": 345,
        api: 1,
        catId: 62547,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Единоборства",
        "platform": 2,
        "parent": 328,
        "catalogId": 346,
        api: 1,
        catId: 820,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Конный спорт",
        "platform": 2,
        "parent": 328,
        "catalogId": 347,
        api: 1,
        catId: 61005,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ],
    },
    {
        "name": "Мотоспорт",
        "platform": 2,
        "parent": 328,
        "catalogId": 348,
        api: 1,
        catId: 10405,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Парусный спорт",
        "platform": 2,
        "parent": 328,
        "catalogId": 349,
        api: 1,
        catId: 10020,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Скалолазание/Альпинизм",
        "platform": 2,
        "parent": 328,
        "catalogId": 350,
        api: 1,
        catId: 60193,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Страйкбол и пейнтбол",
        "platform": 2,
        "parent": 328,
        "catalogId": 351,
        api: 1,
        catId: 16103,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Танцы/Гимнастика",
        "platform": 2,
        "parent": 328,
        "catalogId": 352,
        api: 1,
        catId: 59617,
        catName: 'sport17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Для детей",
        "platform": 2,
        "parent": 328,
        "catalogId": 353,
        api: 1,
        catId: 962,
        catName: 'sport27',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Для женщин",
        "platform": 2,
        "parent": 328,
        "catalogId": 354,
        api: 1,
        catId: 971,
        catName: 'sport19',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Для мужчинам",
        "platform": 2,
        "parent": 328,
        "catalogId": 355,
        api: 1,
        search: 'Спортивная%20одежда%20и%20аксессуары%20для%20мужчин',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Спортивная обувь",
        "platform": 2,
        "parent": 328,
        "catalogId": 356,
        api: 1,
        catId: 998,
        catName: 'sport18',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Товары для самообороны",
        "platform": 2,
        "parent": 328,
        "catalogId": 357,
        api: 1,
        catId: 130664,
        catName: 'sport18',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Электроника",
        "platform": 2,
        "parent": 328,
        "catalogId": 358,
        api: 1,
        catId: 60859,
        catName: 'sport18',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 329}
        ]
    },
    {
        "name": "Автотовары",
        "platform": 2,
        "parent": -1,
        "catalogId": 359,
        "up_name": "Автотовары",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 359,
        "catalogId": 360,
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002}
        ]
    },
    {
        "name": "Запчасти на легковые автомобили",
        "platform": 2,
        "parent": 359,
        "catalogId": 361,
        api: 1,
        isWork: "none",
        search: 'Запчасти%20на%20легковые%20автомобили',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Масла и жидкости",
        "platform": 2,
        "parent": 359,
        "catalogId": 362,
        api: 1,
        catId: 128640,
        catName: 'autoproduct13',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Автокосметика и автохимия",
        "platform": 2,
        "parent": 359,
        "catalogId": 363,
        api: 1,
        catId: 17147,
        catName: 'autoproduct13',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Краски и грунтовки",
        "platform": 2,
        "parent": 359,
        "catalogId": 364,
        api: 1,
        search: 'Краски%20и%20грунтовки',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Автоэлектроника и навигация",
        "platform": 2,
        "parent": 359,
        "catalogId": 365,
        api: 1,
        catId: 9835,
        catName: 'electronic14',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Аксессуары в салон и багажник",
        "platform": 2,
        "parent": 359,
        "catalogId": 366,
        api: 1,
        search: 'Аксессуары%20в%20салон%20и%20багажник',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Коврики",
        "platform": 2,
        "parent": 359,
        "catalogId": 367,
        api: 1,
        catId: 129174,
        catName: 'autoproduct4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Внешний тюнинг",
        "platform": 2,
        "parent": 359,
        "catalogId": 368,
        api: 1,
        catId: 128664,
        catName: 'autoproduct9',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Другие аксессуары и доп. оборудование",
        "platform": 2,
        "parent": 359,
        "catalogId": 369,
        api: 1,
        search: 'Другие%20аксессуары%20и%20доп.%20оборудование',
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Шины и диски колесные",
        "platform": 2,
        "parent": 359,
        "catalogId": 370,
        api: 1,
        catId: 62554,
        catName: 'autoproduct9',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Инструменты",
        "platform": 2,
        "parent": 359,
        "catalogId": 371,
        api: 1,
        catId: 128858,
        catName: 'autoproduct19',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Мойки высокого давления",
        "platform": 2,
        "parent": 359,
        "catalogId": 372,
        api: 1,
        catId: 128767,
        catName: 'garden8',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Мототовары",
        "platform": 2,
        "parent": 359,
        "catalogId": 373,
        api: 1,
        catId: 58377,
        catName: 'autoproduct15',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "OFFroad",
        "platform": 2,
        "parent": 359,
        "catalogId": 374,
        api: 1,
        catId: 128669,
        catName: 'autoproduct19',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "OFFroad",
        "platform": 2,
        "parent": 359,
        "catalogId": 375,
        isWork: 'none',
        api: 1,
        catId: 128669,
        catName: 'autoproduct19',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Запчасти на силовую технику",
        "platform": 2,
        "parent": 359,
        "catalogId": 376,
        api: 1,
        catId: 128699,
        catName: 'autoproduct15',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Запчасти для лодок и катеров",
        "platform": 2,
        "parent": 359,
        "catalogId": 377,
        api: 1,
        catId: 0,
        catName: 'autoproduct15',
        subject: 6920,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 360}
        ]
    },
    {
        "name": "Книги",
        "platform": 2,
        "parent": -1,
        "catalogId": 378,
        "up_name": 'Книги',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 378,
        "catalogId": 379,
        api: 1,
    },
    {
        "name": "Художественная литература",
        "platform": 2,
        "parent": 378,
        "catalogId": 380,
        api: 1,
        catId: 9163,
        catName: 'books_fiction',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Комиксы и манга",
        "platform": 2,
        "parent": 378,
        "catalogId": 381,
        api: 1,
        catId: 9167,
        catName: 'books_fiction',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Книги для детей",
        "platform": 2,
        "parent": 378,
        "catalogId": 382,
        api: 1,
        catId: 9110,
        catName: 'books_children',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Воспитание и развитие ребенка",
        "platform": 2,
        "parent": 378,
        "catalogId": 383,
        api: 1,
        catId: 129287,
        catName: 'books_children',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Образование",
        "platform": 2,
        "parent": 378,
        "catalogId": 384,
        api: 1,
        catId: 9157,
        catName: 'books3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Самообразование и развитие",
        "platform": 2,
        "parent": 378,
        "catalogId": 385,
        api: 1,
        catId: 129275,
        catName: 'books3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Самообразование и развитие",
        "platform": 2,
        "parent": 378,
        "catalogId": 386,
        api: 1,
        catId: 9127,
        catName: 'books4',
        isWork: "none",
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Бизнес и менеджмент",
        "platform": 2,
        "parent": 378,
        "catalogId": 387,
        api: 1,
        catId: 9127,
        catName: 'books4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Хобби и досуг",
        "platform": 2,
        "parent": 378,
        "catalogId": 388,
        api: 1,
        catId: 129273,
        catName: 'books4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Астрология и эзотерика",
        "platform": 2,
        "parent": 378,
        "catalogId": 389,
        api: 1,
        catId: 9126,
        catName: 'books4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Дом, сад и огород",
        "platform": 2,
        "parent": 378,
        "catalogId": 390,
        api: 1,
        catId: 129269,
        catName: 'books4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Красота, здоровье и спорт",
        "platform": 2,
        "parent": 378,
        "catalogId": 391,
        api: 1,
        catId: 129268,
        catName: 'books4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Научно-популярная литература",
        "platform": 2,
        "parent": 378,
        "catalogId": 392,
        api: 1,
        catId: 9142,
        catName: 'books4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Интернет и технологии",
        "platform": 2,
        "parent": 378,
        "catalogId": 393,
        api: 1,
        catId: 9135,
        catName: 'books2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Литературоведение и публицистика",
        "platform": 2,
        "parent": 378,
        "catalogId": 394,
        api: 1,
        catId: 129286,
        catName: 'books_literary_criticism',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Философия",
        "platform": 2,
        "parent": 378,
        "catalogId": 395,
        api: 1,
        catId: 9235,
        catName: 'books4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Религия",
        "platform": 2,
        "parent": 378,
        "catalogId": 396,
        api: 1,
        catId: 9148,
        catName: 'books2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Политика и право",
        "platform": 2,
        "parent": 378,
        "catalogId": 397,
        api: 1,
        catId: 129277,
        catName: 'books2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Букинистика",
        "platform": 2,
        "parent": 378,
        "catalogId": 398,
        api: 1,
        catId: 10555,
        catName: 'books2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Книги на иностранных языках",
        "platform": 2,
        "parent": 378,
        "catalogId": 399,
        api: 1,
        catId: 0,
        catName: 'books2',
        subject: 5805,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Плакаты",
        "platform": 2,
        "parent": 378,
        "catalogId": 400,
        api: 1,
        catId: 0,
        catName: 'books2',
        subject: 1046,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Календари",
        "platform": 2,
        "parent": 378,
        "catalogId": 401,
        api: 1,
        catId: 130525,
        catName: 'books_printed_products',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Коллекционные издания",
        "platform": 2,
        "parent": 378,
        "catalogId": 402,
        api: 1,
        catId: 0,
        catName: 'books2',
        subject: 5322,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Репринтные издания",
        "platform": 2,
        "parent": 378,
        "catalogId": 403,
        api: 1,
        catId: 129274,
        catName: 'books_reprint_xviii',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Мультимедиа",
        "platform": 2,
        "parent": 378,
        "catalogId": 404,
        api: 1,
        catId: 8051,
        catName: 'books2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Аудиокниги",
        "platform": 2,
        "parent": 378,
        "catalogId": 405,
        api: 1,
        catId: 0,
        catName: 'books2',
        subject: 5768,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 379}
        ]
    },
    {
        "name": "Ювелирные изделия",
        "platform": 2,
        "parent": -1,
        "catalogId": 406,
        "up_name": 'Ювелирные изделия',
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002}
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 406,
        "catalogId": 407,
        api: 1,
    },
    {
        "name": "Кольца",
        "platform": 2,
        "parent": 406,
        "catalogId": 408,
        api: 1,
        catId: 0,
        catName: 'jewellery',
        subject: 54,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Серьги",
        "platform": 2,
        "parent": 406,
        "catalogId": 409,
        api: 1,
        catId: 0,
        catName: 'jewellery',
        subject: 207,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Браслеты",
        "platform": 2,
        "parent": 406,
        "catalogId": 410,
        api: 1,
        catId: 0,
        catName: 'jewellery',
        subject: 205,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Подвески и шармы",
        "platform": 2,
        "parent": 406,
        "catalogId": 411,
        api: 1,
        catId: 63069,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Комплекты",
        "platform": 2,
        "parent": 406,
        "catalogId": 412,
        api: 1,
        catId: 60289,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Колье, цепи, шнурки",
        "platform": 2,
        "parent": 406,
        "catalogId": 413,
        api: 1,
        catId: 63070,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Броши",
        "platform": 2,
        "parent": 406,
        "catalogId": 414,
        api: 1,
        catId: 0,
        catName: 'jewellery',
        subject: 452,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Пирсинг",
        "platform": 2,
        "parent": 406,
        "catalogId": 415,
        api: 1,
        catId: 0,
        catName: 'jewellery',
        subject: 5369,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Часы",
        "platform": 2,
        "parent": 406,
        "catalogId": 416,
        api: 1,
        catId: 9369,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Зажимы, запонки, ремни",
        "platform": 2,
        "parent": 406,
        "catalogId": 417,
        api: 1,
        catId: 63071,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Четки",
        "platform": 2,
        "parent": 406,
        "catalogId": 418,
        api: 1,
        catId: 0,
        catName: 'jewellery',
        subject: 2979,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Сувениры и столовое серебро",
        "platform": 2,
        "parent": 406,
        "catalogId": 419,
        api: 1,
        catId: 63072,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Украшения из золота",
        "platform": 2,
        "parent": 406,
        "catalogId": 420,
        api: 1,
        catId: 1024,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Украшения из серебра",
        "platform": 2,
        "parent": 406,
        "catalogId": 421,
        api: 1,
        catId: 1031,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Украшения из керамики",
        "platform": 2,
        "parent": 406,
        "catalogId": 422,
        api: 1,
        catId: 9236,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Украшения из керамики",
        "platform": 2,
        "parent": 406,
        "catalogId": 423,
        api: 1,
        catId: 9236,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Аксессуары для украшений",
        "platform": 2,
        "parent": 406,
        "catalogId": 424,
        api: 1,
        catId: 63073,
        catName: 'jewellery',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 407}
        ]
    },
    {
        "name": "Для ремонта",
        "platform": 2,
        "parent": -1,
        "catalogId": 425,
        "up_name": "Для ремонта",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002}
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 425,
        "catalogId": 426,
        api: 1,
    },
    {
        "name": "Двери, окна и фурнитура",
        "platform": 2,
        "parent": 425,
        "catalogId": 427,
        api: 1,
        catId: 128904,
        catName: 'repair5',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Отделочные материалы",
        "platform": 2,
        "parent": 425,
        "catalogId": 428,
        api: 1,
        catId: 16798,
        catName: 'repair7',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Электрика",
        "platform": 2,
        "parent": 425,
        "catalogId": 429,
        api: 1,
        catId: 17024,
        catName: 'repair4',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Лакокрасочные материалы",
        "platform": 2,
        "parent": 425,
        "catalogId": 430,
        api: 1,
        catId: 128907,
        catName: 'repair9',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Сантехника, отопление и газоснабжение",
        "platform": 2,
        "parent": 425,
        "catalogId": 431,
        api: 1,
        catId: 128917,
        catName: 'repair9',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Вентиляция",
        "platform": 2,
        "parent": 425,
        "catalogId": 432,
        api: 1,
        catId: 128918,
        catName: 'repair9',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Крепеж",
        "platform": 2,
        "parent": 442506,
        "catalogId": 433,
        api: 1,
        catId: 128919,
        catName: 'repair9',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Стройматериалы",
        "platform": 2,
        "parent": 425,
        "catalogId": 434,
        api: 1,
        catId: 128920,
        catName: 'repair9',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Сборные конструкции",
        "platform": 2,
        "parent": 425,
        "catalogId": 435,
        api: 1,
        catId: 129017,
        catName: 'repair9',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Сад и дача",
        "platform": 2,
        "parent": -1,
        "catalogId": 436,
        "up_name": "Сад и дача",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 426}
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 436,
        "catalogId": 437,
        api: 1,
    },
    {
        "name": "Бассейны",
        "platform": 2,
        "parent": 436,
        "catalogId": 438,
        api: 1,
        catId: 9038,
        catName: 'garden7',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Горшки, опоры и все для рассады",
        "platform": 2,
        "parent": 436,
        "catalogId": 439,
        api: 1,
        catId: 128740,
        catName: 'garden8',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Грили, мангалы и барбекю",
        "platform": 2,
        "parent": 436,
        "catalogId": 440,
        api: 1,
        catId: 128745,
        catName: 'garden8',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Дачные умывальники, души и туалеты",
        "platform": 2,
        "parent": 436,
        "catalogId": 441,
        api: 1,
        catId: 128766,
        catName: 'garden8',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Мойки высокого давления",
        "platform": 2,
        "parent": 436,
        "catalogId": 442,
        api: 1,
        catId: 128767,
        catName: 'garden8',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Полив и водоснабжение",
        "platform": 2,
        "parent": 436,
        "catalogId": 443,
        api: 1,
        catId: 128768,
        catName: 'garden6',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Растения, семена и грунты",
        "platform": 2,
        "parent": 436,
        "catalogId": 444,
        api: 1,
        catId: 128760,
        catName: 'garden5',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Садовая мебель",
        "platform": 2,
        "parent": 436,
        "catalogId": 445,
        api: 1,
        catId: 128769,
        catName: 'garden6',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Садовая техника",
        "platform": 2,
        "parent": 436,
        "catalogId": 446,
        api: 1,
        catId: 58530,
        catName: 'garden6',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Садовый декор",
        "platform": 2,
        "parent": 436,
        "catalogId": 447,
        api: 1,
        catId: 128770,
        catName: 'garden6',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Садовый инструмент",
        "platform": 2,
        "parent": 436,
        "catalogId": 448,
        api: 1,
        catId: 128771,
        catName: 'garden7',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Теплицы, парники, укрывной материал",
        "platform": 2,
        "parent": 436,
        "catalogId": 449,
        api: 1,
        catId: 128772,
        catName: 'garden7',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Товары для бани и сауны",
        "platform": 2,
        "parent": 436,
        "catalogId": 450,
        api: 1,
        catId: 8744,
        catName: 'garden7',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Товары для кемпинга, пикника и отдыха",
        "platform": 2,
        "parent": 436,
        "catalogId": 451,
        api: 1,
        catId: 128774,
        catName: 'garden7',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Удобрения, химикаты и средства защиты",
        "platform": 2,
        "parent": 436,
        "catalogId": 452,
        api: 1,
        catId: 128773,
        catName: 'garden3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Здоровье",
        "platform": 2,
        "parent": -1,
        "catalogId": 453,
        "up_name": "Здоровье",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 437}
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 453,
        "catalogId": 454,
        api: 1,
    },
    {
        "name": "БАДы",
        "platform": 2,
        "parent": 453,
        "catalogId": 455,
        api: 1,
        catId: 10327,
        catName: 'shealth2t1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Грибы сушеные и капсулированные",
        "platform": 2,
        "parent": 453,
        "catalogId": 456,
        api: 1,
        catId: 0,
        catName: 'shealth2t1',
        subject: 8107,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Дезинфекция, стерилизация и утилизация",
        "platform": 2,
        "parent": 453,
        "catalogId": 457,
        api: 1,
        catId: 10331,
        catName: 'shealth1t1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Ухо, горло, нос",
        "platform": 2,
        "parent": 453,
        "catalogId": 458,
        api: 1,
        catId: 130696,
        catName: 'shealth6',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Контрацептивы и лубриканты",
        "platform": 2,
        "parent": 453,
        "catalogId": 459,
        api: 1,
        catId: 10328,
        catName: 'shealth1t1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Лечебное питание",
        "platform": 2,
        "parent": 453,
        "catalogId": 460,
        api: 1,
        catId: 0,
        catName: 'shealth5',
        subject: 5520,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Маски защитные",
        "platform": 2,
        "parent": 453,
        "catalogId": 461,
        api: 1,
        catId: 17114,
        catName: 'shealth2t1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Медицинские изделия",
        "platform": 2,
        "parent": 453,
        "catalogId": 462,
        api: 1,
        catId: 10329,
        catName: 'shealth2t1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Медицинские приборы",
        "platform": 2,
        "parent": 453,
        "catalogId": 463,
        api: 1,
        catId: 62257,
        catName: 'shealth5',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Оздоровление",
        "platform": 2,
        "parent": 453,
        "catalogId": 464,
        api: 1,
        catId: 63007,
        catName: 'shealth5',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Оптика",
        "platform": 2,
        "parent": 453,
        "catalogId": 465,
        api: 1,
        catId: 10364,
        catName: 'shealth6',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Ортопедия",
        "platform": 2,
        "parent": 453,
        "catalogId": 466,
        api: 1,
        catId: 5515,
        catName: 'shealth5',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Реабилитация",
        "platform": 2,
        "parent": 453,
        "catalogId": 467,
        api: 1,
        catId: 61809,
        catName: 'shealth5',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Сиропы и бальзамы",
        "platform": 2,
        "parent": 453,
        "catalogId": 468,
        api: 1,
        catId: 130371,
        catName: 'shealth5',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Уход за полостью рта",
        "platform": 2,
        "parent": 453,
        "catalogId": 469,
        api: 1,
        catId: 63058,
        catName: 'shealth1t1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 454}
        ]
    },
    {
        "name": "Канцтовары",
        "platform": 2,
        "parent": -1,
        "catalogId": 470,
        "up_name": "Канцтовары",
        api: 1,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
        ]
    },
    {
        "name": "Все подкатегории",
        "platform": 2,
        "parent": 470,
        "catalogId": 471,
        api: 1,
        catId: 17148,
        catName: 'stationery1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
        ]
    },
    {
        "name": "Бумажная продукция",
        "platform": 2,
        "parent": 470,
        "catalogId": 472,
        api: 1,
        catId: 17148,
        catName: 'stationery1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 471}
        ]
    },
    {
        "name": "Карты и глобусы",
        "platform": 2,
        "parent": 470,
        "catalogId": 473,
        api: 1,
        catId: 17152,
        catName: 'stationery2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 471}
        ]
    },
    {
        "name": "Офисные принадлежности",
        "platform": 2,
        "parent": 470,
        "catalogId": 474,
        api: 1,
        catId: 17153,
        catName: 'stationery2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 471}
        ]
    },
    {
        "name": "Письменные принадлежности",
        "platform": 2,
        "parent": 470,
        "catalogId": 475,
        api: 1,
        catId: 17159,
        catName: 'stationery3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 471}
        ]
    },
    {
        "name": "Рисование и лепка",
        "platform": 2,
        "parent": 470,
        "catalogId": 476,
        api: 1,
        catId: 17164,
        catName: 'creativity17',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 471}
        ]
    },
    {
        "name": "Счетный материал",
        "platform": 2,
        "parent": 470,
        "catalogId": 477,
        api: 1,
        catId: 16992,
        catName: 'stationery2',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 471}
        ]
    },
    {
        "name": "Торговые принадлежности",
        "platform": 2,
        "parent": 470,
        "catalogId": 478,
        api: 1,
        catId: 61872,
        catName: 'stationery3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 471}
        ]
    },
    {
        "name": "Чертежные принадлежности",
        "platform": 2,
        "parent": 470,
        "catalogId": 479,
        api: 1,
        catId: 17165,
        catName: 'stationery3',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            {catalogId: 471}
        ]
    },
    {
        "name": "Сделано в Москве",
        "platform": 2,
        "parent": -1,
        "catalogId": 480,
        api: 1,
        catId: 130255,
        catName: 'moscow1',
        subject: 0,
        publications: [
            {channel: '-1817408131', catalogId: 1002},
            
        ]
    },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B6%D0%B5%D0%BD%D1%89%D0%B8%D0%BD%D0%B0%D0%BC",
    //     "name": "2. Женщинам",
    //     "channel": "-1744099919",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 66,
    //     "link": "https://t.me/+G-AvGtIXtPJlNGYy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BE%D0%B1%D1%83%D0%B2%D1%8C",
    //     "name": "3. Все категории обувь",
    //     "channel": "-1896018971",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 67,
    //     "up_name": "Обувь",
    //     "link": "https://t.me/+LEJYDntPiGBmMmIy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BE%D0%B1%D1%83%D0%B2%D1%8C+%D0%B6%D0%B5%D0%BD%D1%81%D0%BA%D0%B0%D1%8F",
    //     "name": "4. Женская",
    //     "channel": "-1889007919",
    //     "platform": 2,
    //     "catalogId": 68,
    //     "parent": 67,
    //     "link": "https://t.me/+xkCp3I_tRy45NGU6"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BE%D0%B1%D1%83%D0%B2%D1%8C+%D0%BC%D1%83%D0%B6%D1%81%D0%BA%D0%B0%D1%8F",
    //     "name": "5. Мужская",
    //     "channel": "-1888704981",
    //     "platform": 2,
    //     "parent": 67,
    //     "catalogId": 69,
    //     "link": "https://t.me/+KukEN2GI_-Q4YTZi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BE%D0%B1%D1%83%D0%B2%D1%8C+%D0%B4%D0%B5%D1%82%D1%81%D0%BA%D0%B0%D1%8F",
    //     "name": "6. Детская",
    //     "channel": "-1691821331",
    //     "platform": 2,
    //     "parent": 67,
    //     "catalogId": 70,
    //     "link": "https://t.me/+UtFnHqxI8fcyYWJi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/obuv/ortopedicheskaya-obuv?sort=newly&cardsize=c516x688&page=1",
    //     "name": "7. Ортопедическая",
    //     "channel": "-1855496776",
    //     "platform": 2,
    //     "parent": 67,
    //     "catalogId": 71,
    //     "link": "https://t.me/+6342XBQj2H83NDMy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
    //     "name": "8. Аксессуары для обуви",
    //     "channel": "-1779369810",
    //     "platform": 2,
    //     "parent": 67,
    //     "catalogId": 72,
    //     "link": "https://t.me/+oI-KJJ2twrw5YTdi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B4%D0%B5%D1%82%D1%8F%D0%BC",
    //     "name": "9. Детям",
    //     "channel": "-1701944708",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 73,
    //     "link": "https://t.me/+b4mNq08Ml583NGIy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BC%D1%83%D0%B6%D1%87%D0%B8%D0%BD%D0%B0%D0%BC",
    //     "name": "10. Мужчинам",
    //     "channel": "-1500675563",
    //     "parent": -1,
    //     "platform": 2,
    //     "catalogId": 74,
    //     "link": "https://t.me/+nO3H3MrvIsowOTAy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B4%D0%BE%D0%BC",
    //     "name": "11. Дом",
    //     "channel": "-1820483138",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 75,
    //     "link": "https://t.me/+tPSEk79mr18wMGEy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?sort=popular&search=%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9+%D0%B3%D0%BE%D0%B4",
    //     "name": "12. Новый год",
    //     "channel": "-1707003447",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 76,
    //     "link": "https://t.me/+p18JDkd558thY2Uy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BA%D1%80%D0%B0%D1%81%D0%BE%D1%82%D0%B0",
    //     "name": "13. Красота",
    //     "channel": "-1812760548",
    //     "platform": 2,
    //     "catalogId": 77,
    //     "parent": -1,
    //     "link": "https://t.me/+ZwaXgR8eFe4zNjAy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B0%D0%BA%D1%81%D0%B5%D1%81%D1%81%D1%83%D0%B0%D1%80%D1%8B",
    //     "name": "14. Аксессуары",
    //     "channel": "-1865754064",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 78,
    //     "link": "https://t.me/+zvA0UcR2FBMyOWUy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%BD%D0%B8%D0%BA%D0%B0",
    //     "name": "15. Электроника",
    //     "channel": "-1823876655",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 79,
    //     "link": "https://t.me/+uolsaci8hvIyNGUy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B8%D0%B3%D1%80%D1%83%D1%88%D0%BA%D0%B8",
    //     "name": "16. Игрушки",
    //     "channel": "-1862287716",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 80,
    //     "link": "https://t.me/+ecWCpyE6Rs0wOTk6"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BC%D0%B5%D0%B1%D0%B5%D0%BB%D1%8C",
    //     "name": "17. Мебель",
    //     "channel": "-1815051931",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 81,
    //     "link": "https://t.me/+obgSLCaoTakwMjdi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B+%D0%B4%D0%BB%D1%8F+%D0%B2%D0%B7%D1%80%D0%BE%D1%81%D0%BB%D1%8B%D1%85",
    //     "name": "18. Товары для взрослых +18",
    //     "channel": "-1197951656",
    //     "parent": -1,
    //     "platform": 2,
    //     "catalogId": 82,
    //     "link": "https://t.me/+24xrhDIWaz43MmMy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D1%8B",
    //     "name": "19. Продукты",
    //     "parent": -1,
    //     "channel": "-1578615405",
    //     "platform": 2,
    //     "catalogId": 83,
    //     "link": "https://t.me/+swID6_CmzlEwMDNi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%91%D1%8B%D1%82%D0%BE%D0%B2%D0%B0%D1%8F+%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D0%BA%D0%B0",
    //     "name": "20. Бытовая техника",
    //     "channel": "-1783009994",
    //     "parent": -1,
    //     "platform": 2,
    //     "catalogId": 84,
    //     "link": "https://t.me/+rnpYN0NYwXk3ZGMy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B7%D0%BE%D0%BE%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B",
    //     "name": "21. Зоотовары",
    //     "channel": "-1887058201",
    //     "parent": -1,
    //     "platform": 2,
    //     "catalogId": 85,
    //     "link": "https://t.me/+pAxDbS88RTY1Nzdi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D1%81%D0%BF%D0%BE%D1%80%D1%82",
    //     "name": "22. Спорт",
    //     "channel": "-1783991194",
    //     "parent": -1,
    //     "platform": 2,
    //     "catalogId": 86,
    //     "link": "https://t.me/+-fqx9PdEAu82NmY6"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B0%D0%B2%D1%82%D0%BE%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B",
    //     "name": "23. Автотовары",
    //     "channel": "-1661795300",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 87,
    //     "link": "https://t.me/+8jTb_7rlva83ZmYy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BA%D0%BD%D0%B8%D0%B3%D0%B8",
    //     "name": "24. Книги",
    //     "channel": "-1561913282",
    //     "parent": -1,
    //     "platform": 2,
    //     "catalogId": 88,
    //     "link": "https://t.me/+wU4PoHKlUncwZGVi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=premium",
    //     "name": "25. Все категории Premium",
    //     "parent": -1,
    //     "channel": "-1704683051",
    //     "platform": 2,
    //     "catalogId": 89,
    //     "up_name": "25. Premium",
    //     "link": "https://t.me/+qBF7C6HjlbwyNGE6"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/premium/zhenshchinam?sort=newly&cardsize=c516x688&page=1&bid=99071413-849a-4d5f-8bfe-38e51f6675e7",
    //     "name": "26. Premium Женщинам",
    //     "channel": "-1855001281",
    //     "parent": 89,
    //     "platform": 2,
    //     "catalogId": 90,
    //     "link": "https://t.me/+BGG9xetCbVI5YWMy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/premium/muzhchinam?sort=newly&cardSize=c516x688&page=1",
    //     "name": "27. Premium Мужчинам",
    //     "channel": "-1683117044",
    //     "platform": 2,
    //     "parent": 89,
    //     "catalogId": 91,
    //     "link": "https://t.me/+7rPFdmVToeU5N2Ey"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/premium/detyam?sort=newly&cardSize=c516x688&page=1",
    //     "name": "28. Premium Детям",
    //     "channel": "-1704043285",
    //     "platform": 2,
    //     "catalogId": 92,
    //     "parent": 89,
    //     "link": "https://t.me/+yt1ZkFXZcKFlMDEy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/premium/obuv-i-aksessuary?sort=newly&cardSize=c516x688&page=1",
    //     "name": "29. Premium Обувь и аксессуары",
    //     "channel": "-1865833073",
    //     "platform": 2,
    //     "catalogId": 93,
    //     "parent": -1,
    //     "link": "https://t.me/+FjAkF-O2od04NWVi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D1%8E%D0%B2%D0%B5%D0%BB%D0%B8%D1%80%D0%BD%D1%8B%D0%B5+%D0%B8%D0%B7%D0%B4%D0%B5%D0%BB%D0%B8%D1%8F",
    //     "name": "Ювелирные изделия WB",
    //     "channel": "-1894857469",
    //     "platform": 2,
    //     "catalogId": 94,
    //     "parent": -1,
    //     "link": "https://t.me/+qNAtRpuINeg3NWQy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%94%D0%BB%D1%8F+%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%D0%B0",
    //     "name": "31. Для ремонта",
    //     "channel": "-1755403764",
    //     "platform": 2,
    //     "catalogId": 95,
    //     "parent": -1,
    //     "link": "https://t.me/+wzcCJ0t3iI1lNjQy"
    // },
    // {
    //     "hide": true,
    //     "catalogId": 96,
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%94%D0%BB%D1%8F+%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%D0%B0",
    //     "name": "32. Сад и дача",
    //     "channel": "-1854371294",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 97,
    //     "link": "https://t.me/+_VFUqVaPzxI2YTcy"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%97%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%D1%8C%D0%B5",
    //     "name": "33. Здоровье WB",
    //     "channel": "-1861120998",
    //     "parent": -1,
    //     "platform": 2,
    //     "catalogId": 98,
    //     "link": "https://t.me/+-ymLX3Z-5CozMTli"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B2%D1%8B%D0%BA%D1%80%D0%BE%D0%B9%D0%BA%D0%B8&targetUrl=ST",
    //     "name": "34. Цифровые товары",
    //     "channel": "-1851373810",
    //     "platform": 2,
    //     "catalogId": 99,
    //     "parent": -1,
    //     "link": "https://t.me/+XQEgTr-zizxiMjdi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%9A%D0%B0%D0%BD%D1%86%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B",
    //     "name": "35. Канцтовары WB",
    //     "channel": "-1425164509",
    //     "platform": 2,
    //     "catalogId": 100,
    //     "parent": -1,
    //     "link": "https://t.me/+2gV6IN3mnmg3NTFi"
    // },
    // {
    //     "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D1%81%D0%B4%D0%B5%D0%BB%D0%B0%D0%BD%D0%BE+%D0%B2+%D0%BC%D0%BE%D1%81%D0%BA%D0%B2%D0%B5",
    //     "name": "36. Сделано в Москве",
    //     "channel": "-1769364716",
    //     "platform": 2,
    //     "parent": -1,
    //     "catalogId": 101,
    //     "link": "https://t.me/+uUPHbOHelCpmNGNi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/355/clothes-zhenskaya-odezhda/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
    //     "name": "2. Все категории Женщинам",
    //     "channel": "-1897981526",
    //     "platform": 3,
    //     "parent": -1,
    //     "catalogId": 102,
    //     "up_name": "2. Женщинам",
    //     "link": "https://t.me/+iH4Q_QMd6Gg5MGMy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/355/clothes-zhenskaya-odezhda/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
    //     "name": "3. Одежда",
    //     "channel": "-1812285138",
    //     "platform": 3,
    //     "parent": 102,
    //     "catalogId": 103,
    //     "link": "https://t.me/+Q9uwfn3oTyhkYjAy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/355/clothes-zhenskaya-odezhda/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
    //     "name": "4. Обувь",
    //     "channel": "-1899916025",
    //     "platform": 3,
    //     "catalogId": 104,
    //     "parent":  102,
    //     "link": "https://t.me/+lrigS9rV2yZjYzNi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/557/accs-zhenskieaksessuary/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
    //     "name": "5. Аксессуары",
    //     "channel": "-1822766845",
    //     "parent": 102,
    //     "platform": 3,
    //     "catalogId": 105,
    //     "link": "https://t.me/+M2ibpyx0Ub05ZDky"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1262/default-premium-women/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
    //     "name": "6. Все категории Premium",
    //     "channel": "-1885115343",
    //     "platform": 3,
    //     "parent": 102,
    //     "catalogId": 106,
    //     "up_name": "6. Premium",
    //     "link": "https://t.me/+iSe8o4YoMH0wMzhi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1303/clothes-premium-odezda/?sitelink=topmenuW&l=2&sort=new&is_sale=1",
    //     "name": "7. Одежда",
    //     "parent": 106,
    //     "channel": "-1611356175",
    //     "platform": 3,
    //     "catalogId": 107,
    //     "link": "https://t.me/+gqx9pXce2pc3MWQy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1265/shoes-premium-obuv/?sitelink=topmenuW&l=3&sort=new&is_sale=1",
    //     "parent": 106,
    //     "name": "8. Обувь",
    //     "channel": "-1690001519",
    //     "platform": 3,
    //     "catalogId": 108,
    //     "link": "https://t.me/+FLyyE8HrsR80NGNi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1352/accs-premium-accs/?sitelink=topmenuW&l=4&sort=new&is_sale=1",
    //     "parent": 106,
    //     "name": "9. Аксессуары, сумки, красота и косметика",
    //     "channel": "-1841822908",
    //     "platform": 3,
    //     "catalogId": 109,
    //     "link": "https://t.me/+EAIMzElnzfAyZGEy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/4308/default-krasotawoman/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
    //     "name": "10. Красота",
    //     "channel": "-1642295380",
    //     "parent": 102,
    //     "platform": 3,
    //     "catalogId": 110,
    //     "link": "https://t.me/+lWdVeA1uDUhmN2Yy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/477/clothes-muzhskaya-odezhda/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
    //     "name": "11. Все категории Мужчинам",
    //     "channel": "-1814246393",
    //     "parent": -1,
    //     "up_name": "11. Мужчинам",
    //     "platform": 3,
    //     "catalogId": 111,
    //     "link": "https://t.me/+hB4GkVwW9M9lOTgy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/477/clothes-muzhskaya-odezhda/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
    //     "name": "12. Одежда",
    //     "channel": "-1697247088",
    //     "parent": 111,
    //     "platform": 3,
    //     "catalogId": 112,
    //     "link": "https://t.me/+vjUiueFTk71kYjgy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/17/shoes-men/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
    //     "name": "13. Обувь",
    //     "channel": "-1709456958",
    //     "parent": 111,
    //     "platform": 3,
    //     "catalogId": 113,
    //     "link": "https://t.me/+CeMMuTtW3K0wNTgy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/559/accs-muzhskieaksessuary/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
    //     "name": "14. Аксессуары",
    //     "channel": "-1798066703",
    //     "parent": 111,
    //     "platform": 3,
    //     "catalogId": 114,
    //     "link": "https://t.me/+lRIZk-GUgzBmZGJi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1263/default-premium-men/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
    //     "name": "15. Все категории Premium",
    //     "channel": "-1809884096",
    //     "platform": 3,
    //     "parent": 111,
    //     "catalogId": 115,
    //     "up_name": "15. Premium",
    //     "link": "https://t.me/+mVgrSoamMM01YWE6"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1263/default-premium-men/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
    //     "name": "16. Одежда",
    //     "channel": "-1737478081",
    //     "parent": 115,
    //     "platform": 3,
    //     "catalogId": 116,
    //     "link": "https://t.me/+hSVRPvz50rg0NGYy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1386/shoes-premium-men-obuv/?sitelink=topmenuM&l=3&sort=new&is_sale=1",
    //     "name": "17. Обувь",
    //     "channel": "-1848507884",
    //     "parent": 115,
    //     "platform": 3,
    //     "catalogId": 117,
    //     "link": "https://t.me/+9Jd9chELxys3ZDVi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1453/accs-premium-men-accs/?sitelink=topmenuM&l=4&sort=new&is_sale=1",
    //     "name": "18. Аксессуары, косметика и парфюмерия",
    //     "channel": "-1630871311",
    //     "parent": 115,
    //     "platform": 3,
    //     "catalogId": 118,
    //     "link": "https://t.me/+W2TEaeWAh_kyYjcy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/4288/beauty_accs_ns-menbeauty/?sitelink=topmenuM&l=12",
    //     "name": "19. Красота",
    //     "channel": "-1831031674",
    //     "parent": 111,
    //     "platform": 3,
    //     "catalogId": 119,
    //     "link": "https://t.me/+MczcsP-13IUzMDRi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/4154/default-kids/?display_locations=outlet&is_sale=1&sitelink=topmenuK&l=11&sort=new&is_sale=1",
    //     "name": "20. Все категории детям",
    //     "parent": -1,
    //     "channel": "-1547308349",
    //     "platform": 3,
    //     "catalogId": 120,
    //     "up_name": "20. Детям",
    //     "link": "https://t.me/+O1plXdsAbrI3OTc6"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/5379/default-devochkam/?genders=girls&sitelink=topmenuK&l=2&sort=new&is_sale=1",
    //     "name": "21. Все категории Девочкам",
    //     "channel": "-1798563735",
    //     "platform": 3,
    //     "catalogId": 121,
    //     "parent": 120,
    //     "up_name": "21. Девочкам",
    //     "link": "https://t.me/+ngqqbY-usZA5ZDky"
        
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1590/clothes-dlia-devochek/?sitelink=topmenuK&l=13&sort=new&is_sale=1",
    //     "name": "22. Одежда",
    //     "channel": "-1660984811",
    //     "platform": 3,
    //     "parent": 121,
    //     "catalogId": 122,
    //     "link": "https://t.me/+W2r2VMbfiolmYWRi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/203/shoes-girls/?sitelink=topmenuK&l=12&sort=new&is_sale=1",
    //     "name": "23. Обувь",
    //     "channel": "-1800431215",
    //     "parent": 121,
    //     "platform": 3,
    //     "catalogId": 123,
    //     "link": "https://t.me/+5zBCiOY0lAtmOTVi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/561/accs-detskieaksessuary/?sitelink=topmenuK&l=1&sort=new&is_sale=1",
    //     "name": "24. Аксессуары",
    //     "parent": 121,
    //     "channel": "-1554136895",
    //     "platform": 3,
    //     "catalogId": 124,
    //     "link": "https://t.me/+0fbCWrpat2liYTAy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1589/clothes-dlia-malchikov/?sitelink=topmenuK&l=13&sort=new&is_sale=1",
    //     "name": "25. Все категории мальчикам",
    //     "channel": "-1836351147",
    //     "parent": 120,
    //     "platform": 3,
    //     "catalogId": 125,
    //     "up_name": "25. Мальчикам",
    //     "link": "https://t.me/+bk78oD8OlRkzMTRi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1589/clothes-dlia-malchikov/?sitelink=topmenuK&l=13&sort=new&is_sale=1",
    //     "name": "26. Одежда",
    //     "channel": "-1865144723",
    //     "platform": 3,
    //     "catalogId": 126,
    //     "parent": 125,
    //     "link": "https://t.me/+zb6dlz8h93pmNzdi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/205/shoes-boys/?sitelink=topmenuK&l=10&sort=new&is_sale=1",
    //     "name": "27. Обувь",
    //     "channel": "-1807563709",
    //     "platform": 3,
    //     "catalogId": 127,
    //     "parent": 125,
    //     "link": "https://t.me/+OQXGbkTryN1iYWQy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/5381/default-aksydlyamalchikov/?sitelink=topmenuK&l=1&sort=new&is_sale=1",
    //     "name": "28. Аксессуары",
    //     "channel": "-1820763612",
    //     "platform": 3,
    //     "parent": 125,
    //     "catalogId": 128,
    //     "link": "https://t.me/+78UFC4zr4v03YWI6"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/5598/clothes-newbornclothes/?sitelink=topmenuK&l=5&sort=new&is_sale=1",
    //     "name": "29. Малышам",
    //     "channel": "-1869172899",
    //     "platform": 3,
    //     "parent": 120,
    //     "catalogId": 129,
    //     "link": "https://t.me/+uMNdpEhRBu0wNzYy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1263/default-premium-men/?is_new=1&sitelink=topmenuM&l=6&sort=new&is_sale=1",
    //     "name": "30. Все категории Premium",
    //     "channel": "-1732049484",
    //     "parent": 120,
    //     "platform": 3,
    //     "catalogId": 130,
    //     "up_name": "Premium",
    //     "link": "https://t.me/+qAJYTSWgcAM1NzY6"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/5379/default-devochkam/?labels=32243&sitelink=topmenuK&l=1&sort=new&is_sale=1",
    //     "name": "31. Девочкам",
    //     "channel": "-1555937669",
    //     "platform": 3,
    //     "parent": 130,
    //     "catalogId": 131,
    //     "link": "https://t.me/+OyQlyRFau69hMzEy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/5378/default-malchikam/?labels=32243&sitelink=topmenuK&l=1&sort=new&is_sale=1",
    //     "name": "32. Мальчикам",
    //     "channel": "-1637503789",
    //     "platform": 3,
    //     "parent": 130,
    //     "catalogId": 132,
    //     "link": "https://t.me/+TzEB25j9TP4xNjVi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/831/default-sports-women/?sitelink=topmenuW&l=13&sort=new&is_sale=1",
    //     "name": "33. Все категории Спорт",
    //     "channel": "-1827333464",
    //     "platform": 3,
    //     "parent": 120,
    //     "catalogId": 133,
    //     "up_name": "Спорт",
    //     "link": "https://t.me/+yeFla62TsJtiZjFi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1874/default-sports-forgirls/?sitelink=topmenuK&l=1&sort=new&is_sale=1",
    //     "name": "34. Девочкам",
    //     "channel": "-1874676771",
    //     "platform": 3,
    //     "catalogId": 134,
    //     "parent": 133,
    //     "link": "https://t.me/+2XXvBbpvnUEzY2Ni"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/1875/default-sports-forboys/?sitelink=topmenuK&l=1&sort=new&is_sale=1",
    //     "name": "35. Мальчикам",
    //     "channel": "-1870285717",
    //     "platform": 3,
    //     "parent": 133,
    //     "catalogId": 135,
    //     "link": "https://t.me/+bmg80Wn9yhk5NjFi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/6327/default-detskieigrushki/?sitelink=topmenuK&l=7&sort=new&is_sale=1",
    //     "name": "36. Игрушки",
    //     "channel": "-1593154782",
    //     "platform": 3,
    //     "parent": 120,
    //     "catalogId": 136,
    //     "link": "https://t.me/+Bd_UioPH2rNiZWNi"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/6815/default-uhod_za_rebenkom/?sitelink=topmenuK&l=9&sort=new&is_sale=1",
    //     "name": "37. Уход",
    //     "channel": "-1684149524",
    //     "platform": 3,
    //     "parent": 120,
    //     "catalogId": 137,
    //     "link": "https://t.me/+0UcN45UBifFmM2My"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/4154/default-kids/?property_school=37830,37828,36045,37833,37831,37832,37829&keep_filters=property_school&sitelink=topmenuK&l=10&sort=new&is_sale=1",
    //     "name": "38. Все категории Школа",
    //     "channel": "-1580301925",
    //     "platform": 3,
    //     "parent": 120,
    //     "catalogId": 138,
    //     "up_name": "Школа",
    //     "link": "https://t.me/+Wq2fP5ux92I0ZmUy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/4154/default-kids/?property_school=37830,37828,36045,37833,37831,37832,37829&keep_filters=property_school&sitelink=topmenuK&l=10&sort=new&is_sale=1",
    //     "name": "39. Девочкам",
    //     "channel": "-1848593037",
    //     "platform": 3,
    //     "parent": 138,
    //     "catalogId": 139,
    //     "link": "https://t.me/+htxfGkoxSQM4MGMy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/4154/default-kids/?property_school=37830,37828,36045,37833,37831,37832,37829&keep_filters=property_school&sitelink=topmenuK&l=10&sort=new&is_sale=1",
    //     "name": "40. Мальчикам",
    //     "channel": "-1764991622",
    //     "platform": 3,
    //     "parent": 138,
    //     "catalogId": 140,
    //     "link": "https://t.me/+oIH5mUpEMb5lZDQy"
    // },
    // {
    //     "url": "https://www.lamoda.ru/c/6647/home_accs-tovarydlyadoma/?multigender_page=1&q=%D0%B4%D0%BE%D0%BC&submit=y&sort=new&is_sale=1",
    //     "name": "41. Дом",
    //     "channel": "-1614926393",
    //     "platform": 3,
    //     "parent": -1,
    //     "catalogId": 141,
    //     "link": "https://t.me/+0trxHE_N9_5jYzky"
    // }
]
