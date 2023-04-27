
const showFaq = async (clear = false) => {

    const listFaq = document.querySelector(`section.section[name="helper"] .helper__container`);

    if(clear == true) {
        listFaq.querySelectorAll('.helper__item:not(.none)').forEach(item => {
            item.parentElement.removeChild(item);
        })
    }

    const quest = await fetch(URL + 'quest', {mode: 'cors'})
    const answers = await quest.json(); 

    answers.forEach(answ => {
        const element = listFaq.querySelector('.helper__item').cloneNode(true);

        element.querySelector('.helper__item__title').textContent = answ.vopros;
        element.querySelector('.helper__item__descr').innerHTML = answ.otvet;

        listFaq.appendChild(element);
        element.classList.remove('none');
    })
    return true;
}

document.addEventListener('click', ctx => {
    const element = ctx.target;

    if(element.classList.contains('helper__item__title')) {
        const block = element.parentElement;
        block.querySelector('.helper__item__descr').classList.toggle('none');
    }

    if(element.tagName == 'svg' && element?.parentElement?.classList?.contains('helper__item')) {
        const block = element.parentElement;
        block.querySelector('.helper__item__descr').classList.toggle('none');
    }
})

// document.querySelectorAll('.main-buy__item').forEach(item => item.addEventListener('click', () => {
//     const descr = item.querySelector('.main-buy__item__descr');
//     if(item.querySelector('.main-buy__item__title').classList.contains('prepend')) return false;
//     if(item.classList.contains('active')) {
//         item.classList.remove('active');
//     } else {
//         item.classList.add('active');
//     }
//     if(descr.classList.contains('none')) {
//         descr.classList.remove('none');
//     } else {
//         descr.classList.add('none');
//     }
// }))