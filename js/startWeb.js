async function webApplicationStart() {
    document.querySelector('.mainsec__item.friend').href = `https://telegram.me/share/url?url=Ekatalog_life_bot.t.me?start=${USER_ID}`;
    isWebApplicationStarted();

    setTimeout(async () => {
        const url = await getAvatarUrl();
        document.querySelectorAll('.avatar-profile').forEach(element => {
            element.src = url;
        });

        const objectUserInfo = await getBaseInformation();
        document.querySelectorAll('.mainsec__profile__text span.name').forEach(element => element.textContent = objectUserInfo.name.replace('undefined', ''));
        document.querySelectorAll('.mainsec__profile__text span.id').forEach(element => element.textContent = `ID: ${objectUserInfo.id}`);
        document.querySelectorAll('.mainsec__profile__text span.username').forEach(element => element.textContent = `@${objectUserInfo.username}`)

        const textSub = user.text_sub.split('|');

        if(user.end < Date.now()/1000) {
            document.querySelector('#end_status').textContent = 'Подписка неактивна';
            document.querySelector('#end_next').textContent = 'отсутствует';
        } else {
            const date = moment(
                new Date(user.next*1000).toLocaleString("en-US", { timeZone: "Europe/Moscow" })
            ).format("DD.MM.YYYY");
            
            document.querySelector('#end_next').textContent = date;

            if(textSub[0] != '.') {
                document.querySelector('#text_sub_0').textContent = textSub[0];
                document.querySelector('#text_sub_1').textContent = textSub[1];
                document.querySelector('#text_sub_2').textContent = textSub[2];
                document.querySelector('.section__list.none').classList.toggle('none');
            } else {
                
            }

            document.querySelector('.activesub__bank__block__item span').textContent = user.last_card
        
        }


        updateElementsForTags();    

        document.querySelectorAll('a[href="ref"]').forEach(element => {
            element.setAttribute('href', `https://telegram.me/share/url?url=Ekatalog_life_bot.t.me?start=${user.id}`);
        });

        setInterval(() => {
            updateElementsForTags();
        }, 670);

        setTimeout(() => {
            hideLoad();
        }, 650)
        
    }, 1200);

    
}

// ⬇ Индивидуально скрывает/показывает определенные блоки
const updateElementsForTags = () => {
    document.querySelectorAll('[sub]').forEach(block => {
        if(user.end < Date.now()/1000) {
            if(block.getAttribute('sub') == 'true') {
                block.classList.add('none');
            } else {
                block.classList.remove('none');   
            }
        } else {
            if(block.getAttribute('sub') == 'true') {
                block.classList.remove('none');
            } else {
                block.classList.add('none');   
            }
        }
    });

    document.querySelectorAll('[demo]').forEach(block => {
        if(user.demo == 0) {
            if(block.getAttribute('demo') == 'false') {
                block.classList.remove('none');
            } else {
                block.classList.add('none');
            }
        } else {
            if(block.getAttribute('demo') == 'true') {
                block.classList.remove('none');
            } else {
                block.classList.add('none');
            }
        }
    });  

    return true;
}

// ⤵️ Запуск WEB впервые или нет
async function isWebApplicationStarted() {
    const link = CATALOG_URL + 'is_first';
    await axios({
        method: 'GET',
        url: link,
        params: {
            userid: USER_ID
        }
    });
}

async function getBaseInformation() {
    const link = CATALOG_URL + 'get_baseinformation';
    const result = await axios({
        method: 'GET',
        url: link,
        params: {
            userid: USER_ID
        }
    });

    return result.data;
} 

setTimeout(async () => {
    webApplicationStart();
}, 500);