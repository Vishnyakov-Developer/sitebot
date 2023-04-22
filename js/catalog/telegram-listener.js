

// Telegram.WebApp.onEvent('backButtonClicked', function(){
//     const url = 'https://vishnyakov-developer.github.io/sitebot/';
//     const catalogId = window.localStorage.getItem('catalog_id');

//     window.location.replace(url +
//         `?return=1`
//     )
//     return true;
// });

document.querySelectorAll('.gosub__item__button').forEach(button => {
    button.addEventListener('click', async () => {
        openSection(sections.wallet, {
            type: button.getAttribute('type')
        });
    })
})

document.body.addEventListener('click', async ctx => {
    const element = ctx.target;

    if(element.classList.contains('wallet__button')) {
        const summa = parseInt(element.getAttribute('summa'));
        const next = parseInt(element.getAttribute('next'));
        const price = parseInt(element.getAttribute('price'));
        const nextPaymentDays = parseInt(element.getAttribute('nextPaymentDays'));

        const data = await fetch(URL + 'payment?' + new URLSearchParams({
            user: JSON.stringify(user),
            end: next+1000*60*60*24*1,
            price: price,
            summa: summa,
            nextPaymentDays: nextPaymentDays,
            next: next,
            mail: document.querySelector('.wallet__input').value
        }))

        tg.close();

        return true;
    }
})