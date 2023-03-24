


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
    // shops: () => {
    //     tg.BackButton.hide();
    // }
}

// ⬇️ Открыть секцию в аргументе и скрыть остальные
const openSection = async function (section) {
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
    handlerSection(section, prevSection);
    closeModal();
}

let timerActiveOpacity = undefined;
const elementOpacity   = document.querySelector('.products__date');
window.onscroll = () => {
    
    elementOpacity.classList.add('active');
    clearTimeout(timerActiveOpacity);
    timerActiveOpacity = setTimeout(() => {
        elementOpacity.classList.remove('active');
    }, 2000)
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

    console.log(link, nameMessage);
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

// ⬇️ Открытие модального окна по привязанному атрибуту openModal
document.body.addEventListener('click', ctx => {
    const element = ctx.target;
    if(!element.getAttribute('openModal')) {
        return true;
    }

    closeModal();
    openModal(element.getAttribute('openModal'));
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
function handlerSection(section, prevSection) {

    switch(section) {
        case sections.helper: {
            showFaq(true);
            break;
        }
        case sections.search: {
            console.log(0)
            if(prevSection == sections.shops) {
                console.log(1)
                if((currentPage().classList.contains('main-category') && currentCatalog != -1) || currentPage().classList.contains('main-catalog')) {
                    console.log(2)
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
            clearProductsFavor();
            showProductsFavor();
            break;
        }
    }
}
