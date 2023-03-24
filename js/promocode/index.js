const promoSection  = sections.promocode;
const promoButton   = promoSection.querySelector('.promocode__button');
const promoInput    = promoSection.querySelector('.promocode__input');
const promoAfterText    = promoSection.querySelector('.promocode__aftertext');

promoButton.addEventListener('click', async () => {
    const result = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'user_activate_promocode',
        params: {
            userid: USER_ID,
            promo: promoInput.value
        }
    })).data;

    if(result == 404) {
        promoAfterText.textContent = `Не найден`;
        promoAfterText.classList.remove('success');
        promoAfterText.classList.remove('none');
        promoAfterText.classList.add('error');
    } else if(result == 405) {
        promoAfterText.textContent = `Подписка уже активирована`;
        promoAfterText.classList.remove('success');
        promoAfterText.classList.remove('none');
        promoAfterText.classList.add('error');
    } else if(result == 406) {
        promoAfterText.textContent = `У промокода закончились активации`;
        promoAfterText.classList.remove('success');
        promoAfterText.classList.remove('none');
        promoAfterText.classList.add('error');
    } else if(result == 200) {
        promoAfterText.textContent = `Успешно`;
        promoAfterText.classList.remove('success');
        promoAfterText.classList.remove('none');
        promoAfterText.classList.add('error');
        
        setTimeout(async () => {
            await sendCloseMessage('Промокод был успешно активирован. Откройте приложение вновь, для того чтобы увидеть изменения в функционале!');
        }, 1000)
    }
})