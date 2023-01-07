//

let tg = window.Telegram.WebApp; //получаем объект webapp телеграма 
// const URL = 'https://e143-89-31-104-182.ngrok.io/';
const URL = 'https://124699124.online:85/';
// let URL = 'http://176.99.11.95:85/';
tg.expand(); //расширяем на все окно  
let backPage = '';

const firstSection = document.querySelector('.main-select');
const categorySection = document.querySelector('.main-category');
const catalogElement = document.querySelector('.main-category .category_list');

function log(str) {
    document.querySelector('#log').textContent = str;
}

let user = {};

const start = async () => {

    
    try {
        const data = await fetch(URL + 'get_user?' + new URLSearchParams({
            id: tg.initDataUnsafe.user.id
        }), {mode: 'cors'})
        user = await data.json();
    } catch (e) {
        console.log(e);
        log(JSON.stringify(e));
    }
    
    try {
        const quest = await fetch(URL + 'quest', {mode: 'cors'})
        const answers = await quest.json();
        answers.forEach(answ => {
            const element = document.querySelector('.main-buy__item.none').cloneNode(true);
            element.querySelector('.main-buy__item__title').textContent = answ.vopros;
            element.querySelector('.main-buy__item__descr').textContent = answ.otvet;
            document.querySelector('.main-buy__quest').appendChild(element);
            element.classList.remove('none');
        })

        
        document.querySelectorAll('.main-buy__item').forEach(item => item.addEventListener('click', () => {
            const descr = item.querySelector('.main-buy__item__descr');
            if(descr.classList.contains('none')) {
                descr.classList.remove('none');
            } else {
                descr.classList.add('none');
            }
        }))
    } catch(e) {
        console.log(e);
    }


    if(user.demo == false || user.demo == 0 || user.end*1000 < Date.now()) {
        
        openPanel('start');
        document.querySelector('#firstButton').textContent = `7 дней подписки бесплатно`;
    } else {
        openPanel('medium', user.end);
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
}, 300);

let 
currentPlatform, 
currentCatalog;

window.addEventListener('click', async event => {
    console.log(event.target);
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
            if(user.end*1000 < Date.now()) {
                await fetch(URL + 'message?' + new URLSearchParams({
                    user: JSON.stringify(tg.initDataUnsafe.user),
                    message: 'Для просмотра каталога приобретите подписку или возьми пробный *период 7 дней*'
                }));
                tg.close();
                return;
            }
            openCatalog(event.target.getAttribute('step'), event.target.getAttribute('platform'));
        } else {
            openCatalog(event.target.getAttribute('step'));
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

    if(currentPage().classList.contains('main-select')) {
        document.body.classList.remove('two');
    } else {
        document.body.classList.add('two');
    }

    if(currentPage().classList.contains('main-pay')) {
        fetch(URL + 'notification?' + new URLSearchParams({
            userid: user.id,
            type: 0,
            date: parseInt(Date.now()/1000)
        }), {mode: 'cors'})
    }

}

function openCatalog(catalogid, platformid) {
    hidePanel();
    currentCatalog = catalogid;
    currentPlatform = platformid;

    document.querySelectorAll('.category_list-item').forEach(cat => {
        catalogElement.removeChild(cat);
    })

    // firstSection.classList.add('none');
    // categorySection.classList.remove('none');

    openPage('main-category');

    const catalog = catalogs[catalogid];
    console.log(catalog);
    try {
        catalogElement.querySelector('.category_up span').textContent = catalog?.up_name || catalog.name;
    } catch {
        catalogElement.querySelector('.category_up span').textContent = 'Категории'
    }
    
    createList(catalogid);
    
    
}

function createList(catalogid) {
    const filterCatalogs = catalogs.filter(catalog => ((catalog.parent == catalogid || catalog.catalogId == currentCatalog) && catalog.platform == currentPlatform));
    
    
    filterCatalogs.forEach(catalog => {
        let tag = 'div';
        const isHaveChild = !!(catalog.up_name && catalog.catalogId != currentCatalog);
        const catalogBlock = document.createElement(isHaveChild ? 'div' : 'a');
        catalogBlock.classList.add('category_list-item');
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
            catalogBlock.href = catalog.link;
        } else {
            catalogBlock.setAttribute('step', catalog.catalogId);
            catalogBlock.setAttribute('platform', catalog.platform);
        }
        console.log(isHaveChild);

        catalogElement.appendChild(catalogBlock);
    })

    const catalogBlock = document.createElement('div');
    catalogBlock.classList.add('category_list-item', 'center');
    catalogBlock.textContent = 'Назад';

    try {
        catalogBlock.setAttribute('step', catalogs[catalogid].parent);
        catalogBlock.setAttribute('platform', catalogs[catalogid].platform);
    } catch {
        catalogBlock.setAttribute('return', currentPlatform);
    }

    catalogElement.appendChild(catalogBlock);
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
//         message: '❗️ 7 дней подписки бесплатно'
//     }));
//     tg.close();
// });

// document.querySelector('#promo').addEventListener('click', async () => {
//     await fetch(URL + 'onmessage?' + new URLSearchParams({
//         user: JSON.stringify(tg.initDataUnsafe.user),
//         message: '👥 Пригласить друга'
//     }));
//     tg.close();
// });

document.querySelector('#firstButton').addEventListener('click', async () => {
    await fetch(URL + 'onmessage?' + new URLSearchParams({
        user: JSON.stringify(tg.initDataUnsafe.user),
        message: '❗️ 7 дней подписки бесплатно'
    }));
    tg.close();
});

async function openPayment(price, m) {
    openPage('main-pay');
    tg.MainButton.text = "Оплатить"; //изменяем текст кнопки 
    tg.MainButton.setText("Оплатить"); //изменяем текст кнопки иначе
    tg.MainButton.textColor = "#FFFFFF"; //изменяем цвет текста кнопки
    tg.MainButton.color = "#5CB253"; //изменяем цвет бэкграунда кнопки
    tg.MainButton.setParams({"color": "#5CB253"}); //так изменяются все параметры
    tg.MainButton.show()


    document.querySelector('#price').textContent = price;
    document.querySelector('#m').textContent = m;
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
            mail: mail.value
        }))
        tg.close();
    }
});

Telegram.WebApp.onEvent('backButtonClicked', function(){
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
        "name": "29. Аксессуары]",
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
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B6%D0%B5%D0%BD%D1%89%D0%B8%D0%BD%D0%B0%D0%BC",
        "name": "2. Женщинам",
        "channel": "-1744099919",
        "platform": 2,
        "parent": -1,
        "catalogId": 66,
        "link": "https://t.me/+G-AvGtIXtPJlNGYy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BE%D0%B1%D1%83%D0%B2%D1%8C",
        "name": "3. Все категории обувь",
        "channel": "-1896018971",
        "platform": 2,
        "parent": -1,
        "catalogId": 67,
        "up_name": "Обувь",
        "link": "https://t.me/+LEJYDntPiGBmMmIy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BE%D0%B1%D1%83%D0%B2%D1%8C+%D0%B6%D0%B5%D0%BD%D1%81%D0%BA%D0%B0%D1%8F",
        "name": "4. Женская",
        "channel": "-1889007919",
        "platform": 2,
        "catalogId": 68,
        "parent": 67,
        "link": "https://t.me/+xkCp3I_tRy45NGU6"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BE%D0%B1%D1%83%D0%B2%D1%8C+%D0%BC%D1%83%D0%B6%D1%81%D0%BA%D0%B0%D1%8F",
        "name": "5. Мужская",
        "channel": "-1888704981",
        "platform": 2,
        "parent": 67,
        "catalogId": 69,
        "link": "https://t.me/+KukEN2GI_-Q4YTZi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BE%D0%B1%D1%83%D0%B2%D1%8C+%D0%B4%D0%B5%D1%82%D1%81%D0%BA%D0%B0%D1%8F",
        "name": "6. Детская",
        "channel": "-1691821331",
        "platform": 2,
        "parent": 67,
        "catalogId": 70,
        "link": "https://t.me/+UtFnHqxI8fcyYWJi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/ortopedicheskaya-obuv?sort=newly&cardsize=c516x688&page=1",
        "name": "7. Ортопедическая",
        "channel": "-1855496776",
        "platform": 2,
        "parent": 67,
        "catalogId": 71,
        "link": "https://t.me/+6342XBQj2H83NDMy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/obuv/aksessuary-dlya-obuvi?sort=newly&cardSize=c516x688&page=1",
        "name": "8. Аксессуары для обуви",
        "channel": "-1779369810",
        "platform": 2,
        "parent": 67,
        "catalogId": 72,
        "link": "https://t.me/+oI-KJJ2twrw5YTdi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B4%D0%B5%D1%82%D1%8F%D0%BC",
        "name": "9. Детям",
        "channel": "-1701944708",
        "platform": 2,
        "parent": -1,
        "catalogId": 73,
        "link": "https://t.me/+b4mNq08Ml583NGIy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BC%D1%83%D0%B6%D1%87%D0%B8%D0%BD%D0%B0%D0%BC",
        "name": "10. Мужчинам",
        "channel": "-1500675563",
        "parent": -1,
        "platform": 2,
        "catalogId": 74,
        "link": "https://t.me/+nO3H3MrvIsowOTAy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B4%D0%BE%D0%BC",
        "name": "11. Дом",
        "channel": "-1820483138",
        "platform": 2,
        "parent": -1,
        "catalogId": 75,
        "link": "https://t.me/+tPSEk79mr18wMGEy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?sort=popular&search=%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9+%D0%B3%D0%BE%D0%B4",
        "name": "12. Новый год",
        "channel": "-1707003447",
        "platform": 2,
        "parent": -1,
        "catalogId": 76,
        "link": "https://t.me/+p18JDkd558thY2Uy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BA%D1%80%D0%B0%D1%81%D0%BE%D1%82%D0%B0",
        "name": "13. Красота",
        "channel": "-1812760548",
        "platform": 2,
        "catalogId": 77,
        "parent": -1,
        "link": "https://t.me/+ZwaXgR8eFe4zNjAy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B0%D0%BA%D1%81%D0%B5%D1%81%D1%81%D1%83%D0%B0%D1%80%D1%8B",
        "name": "14. Аксессуары",
        "channel": "-1865754064",
        "platform": 2,
        "parent": -1,
        "catalogId": 78,
        "link": "https://t.me/+zvA0UcR2FBMyOWUy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%BD%D0%B8%D0%BA%D0%B0",
        "name": "15. Электроника",
        "channel": "-1823876655",
        "platform": 2,
        "parent": -1,
        "catalogId": 79,
        "link": "https://t.me/+uolsaci8hvIyNGUy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B8%D0%B3%D1%80%D1%83%D1%88%D0%BA%D0%B8",
        "name": "16. Игрушки",
        "channel": "-1862287716",
        "platform": 2,
        "parent": -1,
        "catalogId": 80,
        "link": "https://t.me/+ecWCpyE6Rs0wOTk6"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BC%D0%B5%D0%B1%D0%B5%D0%BB%D1%8C",
        "name": "17. Мебель",
        "channel": "-1815051931",
        "platform": 2,
        "parent": -1,
        "catalogId": 81,
        "link": "https://t.me/+obgSLCaoTakwMjdi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B+%D0%B4%D0%BB%D1%8F+%D0%B2%D0%B7%D1%80%D0%BE%D1%81%D0%BB%D1%8B%D1%85",
        "name": "18. Товары для взрослых +18",
        "channel": "-1197951656",
        "parent": -1,
        "platform": 2,
        "catalogId": 82,
        "link": "https://t.me/+24xrhDIWaz43MmMy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D1%8B",
        "name": "19. Продукты",
        "parent": -1,
        "channel": "-1578615405",
        "platform": 2,
        "catalogId": 83,
        "link": "https://t.me/+swID6_CmzlEwMDNi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%91%D1%8B%D1%82%D0%BE%D0%B2%D0%B0%D1%8F+%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D0%BA%D0%B0",
        "name": "20. Бытовая техника",
        "channel": "-1783009994",
        "parent": -1,
        "platform": 2,
        "catalogId": 84,
        "link": "https://t.me/+rnpYN0NYwXk3ZGMy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B7%D0%BE%D0%BE%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B",
        "name": "21. Зоотовары",
        "channel": "-1887058201",
        "parent": -1,
        "platform": 2,
        "catalogId": 85,
        "link": "https://t.me/+pAxDbS88RTY1Nzdi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D1%81%D0%BF%D0%BE%D1%80%D1%82",
        "name": "22. Спорт",
        "channel": "-1783991194",
        "parent": -1,
        "platform": 2,
        "catalogId": 86,
        "link": "https://t.me/+-fqx9PdEAu82NmY6"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B0%D0%B2%D1%82%D0%BE%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B",
        "name": "23. Автотовары",
        "channel": "-1661795300",
        "platform": 2,
        "parent": -1,
        "catalogId": 87,
        "link": "https://t.me/+8jTb_7rlva83ZmYy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%BA%D0%BD%D0%B8%D0%B3%D0%B8",
        "name": "24. Книги",
        "channel": "-1561913282",
        "parent": -1,
        "platform": 2,
        "catalogId": 88,
        "link": "https://t.me/+wU4PoHKlUncwZGVi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=premium",
        "name": "25. Все категории Premium",
        "parent": -1,
        "channel": "-1704683051",
        "platform": 2,
        "catalogId": 89,
        "up_name": "25. Premium",
        "link": "https://t.me/+qBF7C6HjlbwyNGE6"
    },
    {
        "url": "https://www.wildberries.ru/catalog/premium/zhenshchinam?sort=newly&cardsize=c516x688&page=1&bid=99071413-849a-4d5f-8bfe-38e51f6675e7",
        "name": "26. Premium Женщинам",
        "channel": "-1855001281",
        "parent": 89,
        "platform": 2,
        "catalogId": 90,
        "link": "https://t.me/+BGG9xetCbVI5YWMy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/premium/muzhchinam?sort=newly&cardSize=c516x688&page=1",
        "name": "27. Premium Мужчинам",
        "channel": "-1683117044",
        "platform": 2,
        "parent": 89,
        "catalogId": 91,
        "link": "https://t.me/+7rPFdmVToeU5N2Ey"
    },
    {
        "url": "https://www.wildberries.ru/catalog/premium/detyam?sort=newly&cardSize=c516x688&page=1",
        "name": "28. Premium Детям",
        "channel": "-1704043285",
        "platform": 2,
        "catalogId": 92,
        "parent": 89,
        "link": "https://t.me/+yt1ZkFXZcKFlMDEy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/premium/obuv-i-aksessuary?sort=newly&cardSize=c516x688&page=1",
        "name": "29. Premium Обувь и аксессуары",
        "channel": "-1865833073",
        "platform": 2,
        "catalogId": 93,
        "parent": -1,
        "link": "https://t.me/+FjAkF-O2od04NWVi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D1%8E%D0%B2%D0%B5%D0%BB%D0%B8%D1%80%D0%BD%D1%8B%D0%B5+%D0%B8%D0%B7%D0%B4%D0%B5%D0%BB%D0%B8%D1%8F",
        "name": "Ювелирные изделия WB [30]",
        "channel": "-1894857469",
        "platform": 2,
        "catalogId": 94,
        "parent": -1,
        "link": "https://t.me/+qNAtRpuINeg3NWQy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%94%D0%BB%D1%8F+%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%D0%B0",
        "name": "31. Для ремонта",
        "channel": "-1755403764",
        "platform": 2,
        "catalogId": 95,
        "parent": -1,
        "link": "https://t.me/+wzcCJ0t3iI1lNjQy"
    },
    {
        "hide": true,
        "catalogId": 96,
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%94%D0%BB%D1%8F+%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%D0%B0",
        "name": "32. Сад и дача",
        "channel": "-1854371294",
        "platform": 2,
        "parent": -1,
        "catalogId": 97,
        "link": "https://t.me/+_VFUqVaPzxI2YTcy"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%97%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%D1%8C%D0%B5",
        "name": "33. Здоровье WB",
        "channel": "-1861120998",
        "parent": -1,
        "platform": 2,
        "catalogId": 98,
        "link": "https://t.me/+-ymLX3Z-5CozMTli"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%B2%D1%8B%D0%BA%D1%80%D0%BE%D0%B9%D0%BA%D0%B8&targetUrl=ST",
        "name": "34. Цифровые товары",
        "channel": "-1851373810",
        "platform": 2,
        "catalogId": 99,
        "parent": -1,
        "link": "https://t.me/+XQEgTr-zizxiMjdi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D0%9A%D0%B0%D0%BD%D1%86%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B",
        "name": "35. Канцтовары WB",
        "channel": "-1425164509",
        "platform": 2,
        "catalogId": 100,
        "parent": -1,
        "link": "https://t.me/+2gV6IN3mnmg3NTFi"
    },
    {
        "url": "https://www.wildberries.ru/catalog/0/search.aspx?page=1&sort=newly&search=%D1%81%D0%B4%D0%B5%D0%BB%D0%B0%D0%BD%D0%BE+%D0%B2+%D0%BC%D0%BE%D1%81%D0%BA%D0%B2%D0%B5",
        "name": "36. Сделано в Москве",
        "channel": "-1769364716",
        "platform": 2,
        "parent": -1,
        "catalogId": 101,
        "link": "https://t.me/+uUPHbOHelCpmNGNi"
    },
    {
        "url": "https://www.lamoda.ru/c/355/clothes-zhenskaya-odezhda/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
        "name": "2. Все категории Женщинам",
        "channel": "-1897981526",
        "platform": 3,
        "parent": -1,
        "catalogId": 102,
        "up_name": "2. Женщинам",
        "link": "https://t.me/+iH4Q_QMd6Gg5MGMy"
    },
    {
        "url": "https://www.lamoda.ru/c/355/clothes-zhenskaya-odezhda/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
        "name": "3. Одежда",
        "channel": "-1812285138",
        "platform": 3,
        "parent": 102,
        "catalogId": 103,
        "link": "https://t.me/+Q9uwfn3oTyhkYjAy"
    },
    {
        "url": "https://www.lamoda.ru/c/355/clothes-zhenskaya-odezhda/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
        "name": "4. Обувь",
        "channel": "-1899916025",
        "platform": 3,
        "catalogId": 104,
        "parent":  102,
        "link": "https://t.me/+lrigS9rV2yZjYzNi"
    },
    {
        "url": "https://www.lamoda.ru/c/557/accs-zhenskieaksessuary/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
        "name": "5. Аксессуары",
        "channel": "-1822766845",
        "parent": 102,
        "platform": 3,
        "catalogId": 105,
        "link": "https://t.me/+M2ibpyx0Ub05ZDky"
    },
    {
        "url": "https://www.lamoda.ru/c/1262/default-premium-women/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
        "name": "6. Все категории Premium",
        "channel": "-1885115343",
        "platform": 3,
        "parent": 102,
        "catalogId": 106,
        "up_name": "6. Premium",
        "link": "https://t.me/+iSe8o4YoMH0wMzhi"
    },
    {
        "url": "https://www.lamoda.ru/c/1303/clothes-premium-odezda/?sitelink=topmenuW&l=2&sort=new&is_sale=1",
        "name": "7. Одежда",
        "parent": 106,
        "channel": "-1611356175",
        "platform": 3,
        "catalogId": 107,
        "link": "https://t.me/+gqx9pXce2pc3MWQy"
    },
    {
        "url": "https://www.lamoda.ru/c/1265/shoes-premium-obuv/?sitelink=topmenuW&l=3&sort=new&is_sale=1",
        "parent": 106,
        "name": "8. Обувь",
        "channel": "-1690001519",
        "platform": 3,
        "catalogId": 108,
        "link": "https://t.me/+FLyyE8HrsR80NGNi"
    },
    {
        "url": "https://www.lamoda.ru/c/1352/accs-premium-accs/?sitelink=topmenuW&l=4&sort=new&is_sale=1",
        "parent": 106,
        "name": "9. Аксессуары, сумки, красота и косметика",
        "channel": "-1841822908",
        "platform": 3,
        "catalogId": 109,
        "link": "https://t.me/+EAIMzElnzfAyZGEy"
    },
    {
        "url": "https://www.lamoda.ru/c/4308/default-krasotawoman/?sitelink=topmenuW&l=1&sort=new&is_sale=1",
        "name": "10. Красота",
        "channel": "-1642295380",
        "parent": 102,
        "platform": 3,
        "catalogId": 110,
        "link": "https://t.me/+lWdVeA1uDUhmN2Yy"
    },
    {
        "url": "https://www.lamoda.ru/c/477/clothes-muzhskaya-odezhda/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
        "name": "11. Все категории Мужчинам",
        "channel": "-1814246393",
        "parent": -1,
        "up_name": "11. Мужчинам",
        "platform": 3,
        "catalogId": 111,
        "link": "https://t.me/+hB4GkVwW9M9lOTgy"
    },
    {
        "url": "https://www.lamoda.ru/c/477/clothes-muzhskaya-odezhda/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
        "name": "12. Одежда",
        "channel": "-1697247088",
        "parent": 111,
        "platform": 3,
        "catalogId": 112,
        "link": "https://t.me/+vjUiueFTk71kYjgy"
    },
    {
        "url": "https://www.lamoda.ru/c/17/shoes-men/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
        "name": "13. Обувь",
        "channel": "-1709456958",
        "parent": 111,
        "platform": 3,
        "catalogId": 113,
        "link": "https://t.me/+CeMMuTtW3K0wNTgy"
    },
    {
        "url": "https://www.lamoda.ru/c/559/accs-muzhskieaksessuary/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
        "name": "14. Аксессуары",
        "channel": "-1798066703",
        "parent": 111,
        "platform": 3,
        "catalogId": 114,
        "link": "https://t.me/+lRIZk-GUgzBmZGJi"
    },
    {
        "url": "https://www.lamoda.ru/c/1263/default-premium-men/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
        "name": "15. Все категории Premium",
        "channel": "-1809884096",
        "platform": 3,
        "parent": 111,
        "catalogId": 115,
        "up_name": "15. Premium",
        "link": "https://t.me/+mVgrSoamMM01YWE6"
    },
    {
        "url": "https://www.lamoda.ru/c/1263/default-premium-men/?sitelink=topmenuM&l=1&sort=new&is_sale=1",
        "name": "16. Одежда",
        "channel": "-1737478081",
        "parent": 115,
        "platform": 3,
        "catalogId": 116,
        "link": "https://t.me/+hSVRPvz50rg0NGYy"
    },
    {
        "url": "https://www.lamoda.ru/c/1386/shoes-premium-men-obuv/?sitelink=topmenuM&l=3&sort=new&is_sale=1",
        "name": "17. Обувь",
        "channel": "-1848507884",
        "parent": 115,
        "platform": 3,
        "catalogId": 117,
        "link": "https://t.me/+9Jd9chELxys3ZDVi"
    },
    {
        "url": "https://www.lamoda.ru/c/1453/accs-premium-men-accs/?sitelink=topmenuM&l=4&sort=new&is_sale=1",
        "name": "18. Аксессуары, косметика и парфюмерия",
        "channel": "-1630871311",
        "parent": 115,
        "platform": 3,
        "catalogId": 118,
        "link": "https://t.me/+W2TEaeWAh_kyYjcy"
    },
    {
        "url": "https://www.lamoda.ru/c/4288/beauty_accs_ns-menbeauty/?sitelink=topmenuM&l=12",
        "name": "19. Красота",
        "channel": "-1831031674",
        "parent": 111,
        "platform": 3,
        "catalogId": 119,
        "link": "https://t.me/+MczcsP-13IUzMDRi"
    },
    {
        "url": "https://www.lamoda.ru/c/4154/default-kids/?display_locations=outlet&is_sale=1&sitelink=topmenuK&l=11&sort=new&is_sale=1",
        "name": "20. Все категории детям",
        "parent": -1,
        "channel": "-1547308349",
        "platform": 3,
        "catalogId": 120,
        "up_name": "20. Детям",
        "link": "https://t.me/+O1plXdsAbrI3OTc6"
    },
    {
        "url": "https://www.lamoda.ru/c/5379/default-devochkam/?genders=girls&sitelink=topmenuK&l=2&sort=new&is_sale=1",
        "name": "21. Все категории Девочкам",
        "channel": "-1798563735",
        "platform": 3,
        "catalogId": 121,
        "parent": 120,
        "up_name": "21. Девочкам",
        "link": "https://t.me/+ngqqbY-usZA5ZDky"
        
    },
    {
        "url": "https://www.lamoda.ru/c/1590/clothes-dlia-devochek/?sitelink=topmenuK&l=13&sort=new&is_sale=1",
        "name": "22. Одежда",
        "channel": "-1660984811",
        "platform": 3,
        "parent": 121,
        "catalogId": 122,
        "link": "https://t.me/+W2r2VMbfiolmYWRi"
    },
    {
        "url": "https://www.lamoda.ru/c/203/shoes-girls/?sitelink=topmenuK&l=12&sort=new&is_sale=1",
        "name": "23. Обувь",
        "channel": "-1800431215",
        "parent": 121,
        "platform": 3,
        "catalogId": 123,
        "link": "https://t.me/+5zBCiOY0lAtmOTVi"
    },
    {
        "url": "https://www.lamoda.ru/c/561/accs-detskieaksessuary/?sitelink=topmenuK&l=1&sort=new&is_sale=1",
        "name": "24. Аксессуары",
        "parent": 121,
        "channel": "-1554136895",
        "platform": 3,
        "catalogId": 124,
        "link": "https://t.me/+0fbCWrpat2liYTAy"
    },
    {
        "url": "https://www.lamoda.ru/c/1589/clothes-dlia-malchikov/?sitelink=topmenuK&l=13&sort=new&is_sale=1",
        "name": "25. Все категории мальчикам",
        "channel": "-1836351147",
        "parent": 120,
        "platform": 3,
        "catalogId": 125,
        "up_name": "25. Мальчикам",
        "link": "https://t.me/+bk78oD8OlRkzMTRi"
    },
    {
        "url": "https://www.lamoda.ru/c/1589/clothes-dlia-malchikov/?sitelink=topmenuK&l=13&sort=new&is_sale=1",
        "name": "26. Одежда",
        "channel": "-1865144723",
        "platform": 3,
        "catalogId": 126,
        "parent": 125,
        "link": "https://t.me/+zb6dlz8h93pmNzdi"
    },
    {
        "url": "https://www.lamoda.ru/c/205/shoes-boys/?sitelink=topmenuK&l=10&sort=new&is_sale=1",
        "name": "27. Обувь",
        "channel": "-1807563709",
        "platform": 3,
        "catalogId": 127,
        "parent": 125,
        "link": "https://t.me/+OQXGbkTryN1iYWQy"
    },
    {
        "url": "https://www.lamoda.ru/c/5381/default-aksydlyamalchikov/?sitelink=topmenuK&l=1&sort=new&is_sale=1",
        "name": "28. Аксессуары",
        "channel": "-1820763612",
        "platform": 3,
        "parent": 125,
        "catalogId": 128,
        "link": "https://t.me/+78UFC4zr4v03YWI6"
    },
    {
        "url": "https://www.lamoda.ru/c/5598/clothes-newbornclothes/?sitelink=topmenuK&l=5&sort=new&is_sale=1",
        "name": "29. Малышам",
        "channel": "-1869172899",
        "platform": 3,
        "parent": 120,
        "catalogId": 129,
        "link": "https://t.me/+uMNdpEhRBu0wNzYy"
    },
    {
        "url": "https://www.lamoda.ru/c/1263/default-premium-men/?is_new=1&sitelink=topmenuM&l=6&sort=new&is_sale=1",
        "name": "30. Все категории Premium",
        "channel": "-1732049484",
        "parent": 120,
        "platform": 3,
        "catalogId": 130,
        "up_name": "Premium",
        "link": "https://t.me/+qAJYTSWgcAM1NzY6"
    },
    {
        "url": "https://www.lamoda.ru/c/5379/default-devochkam/?labels=32243&sitelink=topmenuK&l=1&sort=new&is_sale=1",
        "name": "31. Девочкам",
        "channel": "-1555937669",
        "platform": 3,
        "parent": 130,
        "catalogId": 131,
        "link": "https://t.me/+OyQlyRFau69hMzEy"
    },
    {
        "url": "https://www.lamoda.ru/c/5378/default-malchikam/?labels=32243&sitelink=topmenuK&l=1&sort=new&is_sale=1",
        "name": "32. Мальчикам",
        "channel": "-1637503789",
        "platform": 3,
        "parent": 130,
        "catalogId": 132,
        "link": "https://t.me/+TzEB25j9TP4xNjVi"
    },
    {
        "url": "https://www.lamoda.ru/c/831/default-sports-women/?sitelink=topmenuW&l=13&sort=new&is_sale=1",
        "name": "33. Все категории Спорт",
        "channel": "-1827333464",
        "platform": 3,
        "parent": 120,
        "catalogId": 133,
        "up_name": "Спорт",
        "link": "https://t.me/+yeFla62TsJtiZjFi"
    },
    {
        "url": "https://www.lamoda.ru/c/1874/default-sports-forgirls/?sitelink=topmenuK&l=1&sort=new&is_sale=1",
        "name": "34. Девочкам",
        "channel": "-1874676771",
        "platform": 3,
        "catalogId": 134,
        "parent": 133,
        "link": "https://t.me/+2XXvBbpvnUEzY2Ni"
    },
    {
        "url": "https://www.lamoda.ru/c/1875/default-sports-forboys/?sitelink=topmenuK&l=1&sort=new&is_sale=1",
        "name": "35. Мальчикам",
        "channel": "-1870285717",
        "platform": 3,
        "parent": 133,
        "catalogId": 135,
        "link": "https://t.me/+bmg80Wn9yhk5NjFi"
    },
    {
        "url": "https://www.lamoda.ru/c/6327/default-detskieigrushki/?sitelink=topmenuK&l=7&sort=new&is_sale=1",
        "name": "36. Игрушки",
        "channel": "-1593154782",
        "platform": 3,
        "parent": 120,
        "catalogId": 136,
        "link": "https://t.me/+Bd_UioPH2rNiZWNi"
    },
    {
        "url": "https://www.lamoda.ru/c/6815/default-uhod_za_rebenkom/?sitelink=topmenuK&l=9&sort=new&is_sale=1",
        "name": "37. Уход",
        "channel": "-1684149524",
        "platform": 3,
        "parent": 120,
        "catalogId": 137,
        "link": "https://t.me/+0UcN45UBifFmM2My"
    },
    {
        "url": "https://www.lamoda.ru/c/4154/default-kids/?property_school=37830,37828,36045,37833,37831,37832,37829&keep_filters=property_school&sitelink=topmenuK&l=10&sort=new&is_sale=1",
        "name": "38. Все категории Школа",
        "channel": "-1580301925",
        "platform": 3,
        "parent": 120,
        "catalogId": 138,
        "up_name": "Школа",
        "link": "https://t.me/+Wq2fP5ux92I0ZmUy"
    },
    {
        "url": "https://www.lamoda.ru/c/4154/default-kids/?property_school=37830,37828,36045,37833,37831,37832,37829&keep_filters=property_school&sitelink=topmenuK&l=10&sort=new&is_sale=1",
        "name": "39. Девочкам",
        "channel": "-1848593037",
        "platform": 3,
        "parent": 138,
        "catalogId": 139,
        "link": "https://t.me/+htxfGkoxSQM4MGMy"
    },
    {
        "url": "https://www.lamoda.ru/c/4154/default-kids/?property_school=37830,37828,36045,37833,37831,37832,37829&keep_filters=property_school&sitelink=topmenuK&l=10&sort=new&is_sale=1",
        "name": "40. Мальчикам",
        "channel": "-1764991622",
        "platform": 3,
        "parent": 138,
        "catalogId": 140,
        "link": "https://t.me/+oIH5mUpEMb5lZDQy"
    },
    {
        "url": "https://www.lamoda.ru/c/6647/home_accs-tovarydlyadoma/?multigender_page=1&q=%D0%B4%D0%BE%D0%BC&submit=y&sort=new&is_sale=1",
        "name": "41. Дом",
        "channel": "-1614926393",
        "platform": 3,
        "parent": -1,
        "catalogId": 141,
        "link": "https://t.me/+0trxHE_N9_5jYzky"
    }
]
