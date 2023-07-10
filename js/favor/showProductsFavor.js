// ⬇️ Получить и вывести в HTML список продукты "избранное"
const showProductsFavor = async () => {
    const products = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_favor_products',
        params: {
            userid: USER_ID
        }
    })).data.filter(product => product?.name?.length > 0);

    if(products.length > 0) {
        document.querySelector('.null').classList.add('none');
    } else {
        document.querySelector('.null').classList.remove('none');
    }
    
    for(let i = 0; i<products.length; i++) {
        
        appendProductFavor(products[i].image, products[i].price, products[i].oldPrice, products[i].startPrice, products[i].views, products[i].name, products[i].rate, products[i].reviews, products[i].url, i+1, true, products[i].date_parse, products[i].platform, products[i].id, products[i].saleProcents, products[i].change_procents);
    }
    
}

const showProductsSearch = async (text = '') => {
    const favors = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_favor',
        params: {
            userid: USER_ID
        }
    })).data;
    
    // const startProd = randomInt(20000);
    const startProd = randomInt(0);

    const products = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_products',
        params: {
            from: startProd,
            // limit: parseInt(limit),
            limit: 300,
            catalogid: 'all',
            search: text,
            userid: USER_ID
        }
    })).data.map(product => {
        for(let i = 0; i<favors.length; i++) {
            if(product.id == favors[i].product_id) {
                product.like = true;
                return product;
            }
        }

        product.like = false;
        return product;
    });

    for(let i = 0; i<products.length; i++) {
        appendProductSearch(products[i].image, products[i].price, products[i].oldPrice, products[i].startPrice, products[i].views, products[i].name, products[i].rate, products[i].reviews, products[i].url, i+1, products[i].like, products[i].date_parse, products[i].platform, products[i].id, products[i].saleProcents, products[i].change_procents);
    }
}


// ⬇️ Удалить из HTML списка продукты в "избранное"
const clearProductsFavor = async () => {
    listFavor.querySelectorAll('.products__item:not(.template)').forEach((block, index) => {
        if(index >= count) {
            return false;
        }
        listFavor.removeChild(block);
    })
}

const clearProductsSearch = async () => {
    listSearch.querySelectorAll('.products__item:not(.template)').forEach((block, index) => {
        if(index >= count) {
            return false;
        }
        listSearch.removeChild(block);
    })
}

function appendProductFavor(image,  price, oldPrice, startPrice, views, name, rate, reviews, url, index = 0, like = false, date, platform, id, saleOriginal = 0, changeProcents = 0) {
    let block = listFavor.querySelector('.template').cloneNode(true);
    let continueNext = true;

    image.replace('///', '//');

    for(let i = 0; i<12; i++) {
        let num = `${i+1}`;
        if(num.length == 1) {
            num = `0${num}`;
        }
        block.querySelector(`.products__item__img img:nth-child(${i+1})`).src = image.replace(/https:\/\/basket-[\d]+/g, `https://basket-${num}`);
        block.querySelector(`.products__item__img img:nth-child(${i+1})`).classList.remove('none');
    }

    if(rate == 'undefined') {
        rate = 0;
    }

    if(reviews == 'undefined') {
        reviews = 0;
    }

    block.classList.remove('template', 'none');
    if(changeProcents != 0) {
        block.querySelector('.products__item__price__change').classList.remove('none');
        block.querySelector('.products__item__price__change .value').textContent = `${changeProcents}%`;
        
        if(changeProcents > 0) {
            // block.querySelector('.products__item__price__change #tr').style.borderBottom = `9px solid green`;
        } else {
            // block.querySelector('.products__item__price__change #tr').style.transform = `rotateZ(180deg)`;
        }

    } else {
        // return true;
    }
    block.querySelector('.products__item__name').textContent = name;
    block.querySelector('.products__item__rating span').textContent = rate;
    block.querySelector('.products__item__reviews span').textContent = reviews;
    block.querySelector('.products__item__price__sale').textContent = parseInt(price).toLocaleString() + ' ₽';
    block.querySelector('.products__item__price__original').textContent = parseInt(oldPrice).toLocaleString() + ' ₽';
    block.querySelector('.views').textContent = views;
    block.querySelector('.products__item__url').href = url.replace('//product', '/product');
    block.querySelector('.products__item__url').setAttribute('target', '_blank');
    block.setAttribute('product_id', id);
    block.querySelector('.products__item__price__tr .value').textContent = ` ${startPrice-price} ₽`;
    block.querySelector('.products__item__sale').textContent = Math.ceil(100-parseInt(price)/(parseInt(oldPrice)/100)) + '%';
    if(user.channelMember == 0 && user.countsub > 1) {
        block.querySelector('.products__item__url').href = '#';
        block.querySelector('.products__item__url').setAttribute('openModal', 'gochannel');
    }

    if(platform == '0') {
        block.querySelectorAll('.products__item__url').forEach(elem => {
            elem.textContent = 'Летуаль';
        })
    } else if(platform == '1') {
        block.querySelectorAll('.products__item__url').forEach(elem => {
            elem.textContent = 'Ozon';
        })
    } else if(platform == '2') {
        block.querySelectorAll('.products__item__url').forEach(elem => {
            elem.textContent = 'Wb';
        })
    } else if(platform == '3') {
        block.querySelectorAll('.products__item__url').forEach(elem => {
            elem.textContent = 'Lamoda';
        })
    }

    block.setAttribute('date_string', moment(date).locale('ru').format('D MMMM'))
    block.setAttribute('date', date);

    if(like == true) {
        block.querySelector('.like[like="true"]').classList.remove('none');
    } else {
        block.querySelector('.like[like="false"]').classList.remove('none');
    }

    // block.setAttribute('index', index);

    listFavor.querySelectorAll('.products__item:not(.template)').forEach((item, index) => {
        if(item.querySelector('.products__item__url').href == url) {
            continueNext = false;
            return false;
        }
    })

    if(!continueNext) {
        return false;
    }

    listFavor.prepend(block);
}

function appendProductSearch(image, price, oldPrice, startPrice, views, name, rate, reviews, url, index = 0, like = false, date, platform, id, saleOriginal = 0, changeProcents = 0) {
    
    let block = listSearch.querySelector('.template').cloneNode(true);
    let continueNext = true;

    image.replace('///', '//');

    if(rate == 'undefined') {
        rate = 0;
    }

    if(reviews == 'undefined') {
        reviews = 0;
    }

    block.classList.remove('template', 'none');
    if(changeProcents != 0) {
        block.querySelector('.products__item__price__change').classList.remove('none');
        block.querySelector('.products__item__price__change .value').textContent = `${changeProcents}%`;
        
        if(changeProcents > 0) {
            // block.querySelector('.products__item__price__change #tr').style.borderBottom = `9px solid green`;
        } else {
            // block.querySelector('.products__item__price__change #tr').style.transform = `rotateZ(180deg)`;
        }

    } else {
        // return true;
    }
    for(let i = 0; i<12; i++) {
        let num = `${i+1}`;
        if(num.length == 1) {
            num = `0${num}`;
        }
        block.querySelector(`.products__item__img img:nth-child(${i+1})`).src = image.replace(/https:\/\/basket-[\d]+/g, `https://basket-${num}`);
        block.querySelector(`.products__item__img img:nth-child(${i+1})`).classList.remove('none');
    }
    block.querySelector('.products__item__name').textContent = name;
    block.querySelector('.products__item__rating span').textContent = rate;
    block.querySelector('.products__item__reviews span').textContent = reviews;
    block.querySelector('.products__item__price__sale').textContent = parseInt(price).toLocaleString() + ' ₽';
    block.querySelector('.products__item__price__original').textContent = parseInt(oldPrice).toLocaleString() + ' ₽';
    block.querySelector('.views').textContent = views;
    block.querySelector('.products__item__url').href = url.replace('//product', '/product');;
    block.setAttribute('date_string', moment(date).locale('ru').format('D MMMM'))
    block.querySelector('.products__item__url').setAttribute('target', '_blank');
    block.querySelector('.products__item__price__tr .value').textContent = ` ${startPrice-price} ₽`;
    block.setAttribute('date', date);
    block.querySelector('.products__item__time').textContent = moment(date).locale('ru').format('HH:mm');
    block.querySelector('.products__item__sale').textContent = Math.ceil(100-parseInt(price)/(parseInt(oldPrice)/100)) + '%';

    if(user.channelMember == 0 && user.countsub > 1) {
        block.querySelector('.products__item__url').href = '#';
        block.querySelector('.products__item__url').setAttribute('openModal', 'gochannel');
    }

    if(like == true) {
        block.querySelector('.like[like="true"]').classList.remove('none');
    } else {
        block.querySelector('.like[like="false"]').classList.remove('none');
    }

    block.setAttribute('product_id', id);

    if(platform == '0') {
        block.querySelectorAll('.products__item__url').forEach(elem => {
            elem.textContent = 'Летуаль';
        })
    } else if(platform == '1') {
        block.querySelectorAll('.products__item__url').forEach(elem => {
            elem.textContent = 'Ozon';
        })
    } else if(platform == '2') {
        block.querySelectorAll('.products__item__url').forEach(elem => {
            elem.textContent = 'Wb';
        })
    } else if(platform == '3') {
        block.querySelectorAll('.products__item__url').forEach(elem => {
            elem.textContent = 'Lamoda';
        })
    }

    // block.setAttribute('index', index);

    listSearch.querySelectorAll('.products__item:not(.template)').forEach((item, index) => {
        if(item.querySelector('.products__item__url').href == url) {
            continueNext = false;
            return false;
        }
    })

    if(!continueNext) {
        return false;
    }

    listSearch.prepend(block);
}