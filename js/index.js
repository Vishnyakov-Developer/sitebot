


// ⬇️ Объекты с HTML элементы секциями
const sections = {
    shops: document.querySelector('section[name="shops"]'),
    favor: document.querySelector('section[name="favor"]'),
    main: document.querySelector('section[name="main"]'),
    helper: document.querySelector('section[name="helper"]'),
    promocode: document.querySelector('section[name="promocode"]'),
    activesub: document.querySelector('section[name="activesub"]'),
    gosub: document.querySelector('section[name="gosub"]'),
    search: document.querySelector('section[name="search"]'),
    wallet: document.querySelector('section[name="wallet"]')
}
var currentSection = sections.shops;
var backButtonHandl = {
    favor: () => {
        openSection(sections.shops);
        tg.BackButton.hide();
    },
    promocode: () => {
        openSection(sections.main);
    },
    activesub: () => {
        openSection(sections.main);
    },
    helper: () => {
        openSection(sections.main)
    },
    gosub: () => {
        openSection(sections.main)
    },
    main: () => {
        openSection(sections.shops);
        tg.BackButton.hide();
    },
    wallet: () => {
        openSection(sections.gosub)
    },
    search: () => {
        openSection(sections.shops)
    }
    // shops: () => {
    //     tg.BackButton.hide();
    // }
}

// ⬇️ Открыть секцию в аргументе и скрыть остальные
const openSection = async function (section, argObject = {}) {
    for(let section in sections) {
        sections[section].classList.add('none');
    }

    if(section != sections.shops) {
        document.body.classList.remove('two');
    } else {
        
        if(currentPage().classList.contains('main-category')) {
            document.body.classList.add('two');
        }
    }
    tg.BackButton.show();

    section.classList.remove('none');

    document.querySelectorAll('[currentSection]').forEach(element => {
        const attributeSection = element.getAttribute('currentSection');
        element.classList.remove('active');
        if(sections[attributeSection] == section) {
            element.classList.add('active');
        }
    })
    const prevSection = currentSection;
    currentSection = section;
    handlerSection(section, prevSection, argObject);
    closeModal();
}

let timerActiveOpacity = undefined;
const elementOpacity   = document.querySelector('.products__date');
window.onscroll = () => {
    
    elementOpacity.classList.add('active');
    clearTimeout(timerActiveOpacity);
    timerActiveOpacity = setTimeout(() => {
        elementOpacity.classList.remove('active');
    }, 100)
}

const sendCloseMessage = async function (message) {
    const link = CATALOG_URL + 'message';
    await axios({
        method: 'GET',
        url: link,
        params: {
            user: JSON.stringify(tg.initDataUnsafe.user),
            message: message
        }
    });
    tg.close();
    return true;
}

const closeMessage = async function (nameMessage) {
    const link = CATALOG_URL + 'close_message';

    await axios({
        method: 'GET',
        url: link,
        params: {
            userid: USER_ID,
            message: nameMessage
        }
    });
    tg.close();
    return true;
}

const getCurrentDate = (time = true) => {
    if(time == false) {
      const date = moment(
        new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
      ).format("DD/MM/YYYY");
      return date;
    }
    const date = moment(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
    ).format("DD/MM/YYYY HH:mm:ss");
    return date;
  };

const getAvatarUrl = async function () {
    const link = CATALOG_URL + 'get_avatar';
    const result = await axios({
        method: 'GET',
        url: link,
        params: {
            userid: USER_ID,
        }
    });

    return result.data;
}

// ⬇️ Открытие секции по привязанным кнопках с аттрибутом openSection
document.querySelectorAll(`[openSection]`).forEach(block => {
    block.addEventListener('click', () => {
        const section = sections[block.getAttribute('openSection')];
        openSection(section);
    })
})

var elementer = undefined;
// ⬇️ Открытие модального окна по привязанному атрибуту openModal
document.body.addEventListener('click', ctx => {
    const element = ctx.target;
    elementer = element;
    if(!element.getAttribute('openModal') && !element.getAttribute('openmodal')) {
        return true;
    }
    
    closeModal();
    try {
        openModal(element.getAttribute('openModal'));
    } catch {
        openModal(element.getAttribute('openmodal'));
    }
    
})
document.querySelectorAll('[openModal]').forEach(block => {

});

// ⬇️ Закрытие WebApp с последующим выводом сообщения бота
document.querySelectorAll(`[closeMessage]`).forEach(block => {
    block.addEventListener('click', () => {
        const message = block.getAttribute('closeMessage');
        closeMessage(message);
    })
})

// ⬇️ Сделать имитацию сообщению боту и закрыть Webapp
document.querySelectorAll(`[onMessage]`).forEach(block => {
    block.addEventListener('click', async () => {
        const message = block.getAttribute('onMessage');
        await fetch(URL + 'onmessage?' + new URLSearchParams({
            user: JSON.stringify(tg.initDataUnsafe.user),
            message: message
        }));
        tg.close();
    })
})



// ⬇️ Обработчик при открытии секции, какие-то индивидуальые данные
function handlerSection(section, prevSection, argObject = {}) {
    document.querySelector('.edittext').textContent = 'Поиск';
    switch(section) {
        case sections.helper: {
            showFaq(true);
            break;
        }
        case sections.shops: {
            openPage('main-select');
            break;  
        }
        case sections.search: {
            if(prevSection == sections.shops) {
                if((currentPage().classList.contains('main-category') && currentCatalog != -1) || currentPage().classList.contains('main-catalog')) {
                    openSection(sections.shops);
                    openCatalog(-1, currentPlatform);
                } else {
                    clearProductsSearch();
                    showProductsSearch();
                    break;
                }
            } else {
                clearProductsSearch();
                showProductsSearch();
                break;
            }
            break;
        } 
        case sections.favor: {
            document.querySelector('.null').classList.remove('none');
            clearProductsFavor();
            showProductsFavor();
            break;
        }
        case sections.wallet: {
            switch(parseInt(argObject.type)) {
                case 0: {
                    sections.wallet.querySelector('.wallet__descr').textContent = '7 дней за 1 ₽';
                    sections.wallet.querySelector('.wallet__comment').textContent = `для подключения подписки. 7 дней за 1 ₽, продление ${moment(Date.now()+1000*60*60*24*6).locale('ru').format('D MMMM')} по цене 1 месяца 169 ₽. Оплата пройдет за 24 часа до продления.`;
                    sections.wallet.querySelector('.wallet__button').textContent = `Подключить за 1 ₽`
                    sections.wallet.querySelector('.wallet__button').setAttribute('next', Date.now()+1000*60*60*24*6);
                    sections.wallet.querySelector('.wallet__button').setAttribute('summa', 169);
                    sections.wallet.querySelector('.wallet__button').setAttribute('price', 1);
                    sections.wallet.querySelector('.wallet__button').setAttribute('nextPaymentDays', 30);
                    break;
                }
                case 1: {
                    sections.wallet.querySelector('.wallet__descr').textContent = '30 дней за 169 ₽';
                    sections.wallet.querySelector('.wallet__comment').textContent = `для подключения подписки. 30 дней за 169 ₽, продление ${moment(Date.now()+1000*60*60*24*29).locale('ru').format('D MMMM')} по этой же цене. Оплата пройдет за 24 часа до продления.`;
                    sections.wallet.querySelector('.wallet__button').textContent = `Подключить за 169 ₽`
                    sections.wallet.querySelector('.wallet__button').setAttribute('next', Date.now()+1000*60*60*24*29);
                    sections.wallet.querySelector('.wallet__button').setAttribute('summa', 169);
                    sections.wallet.querySelector('.wallet__button').setAttribute('price', 169);
                    sections.wallet.querySelector('.wallet__button').setAttribute('nextPaymentDays', 30);
                    break;
                }
                case 2: {
                    sections.wallet.querySelector('.wallet__descr').textContent = '365 дней за 799 ₽';
                    sections.wallet.querySelector('.wallet__comment').textContent = `для подключения подписки. 365 дней за 799 ₽, продление ${moment(Date.now()+1000*60*60*24*364).locale('ru').format('D MMMM')} по этой же цене. Оплата пройдет за 24 часа до продления.`;
                    sections.wallet.querySelector('.wallet__button').textContent = `Подключить за 799 ₽`
                    sections.wallet.querySelector('.wallet__button').setAttribute('next', Date.now()+1000*60*60*24*364);
                    sections.wallet.querySelector('.wallet__button').setAttribute('summa', 799);
                    sections.wallet.querySelector('.wallet__button').setAttribute('price', 799);
                    sections.wallet.querySelector('.wallet__button').setAttribute('nextPaymentDays', 365);
                    break;
                }
            }
        }
    }
}
