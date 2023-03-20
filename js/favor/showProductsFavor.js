// ⬇️ Получить и вывести в HTML список продукты "избранное"
const showProductsFavor = async () => {
    console.log('showProductsFavor');
    const products = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_favor_products',
        params: {
            userid: USER_ID
        }
    })).data;

    console.log(products);

    for(let i = 0; i<products.length; i++) {
        appendProductFavor(products[i].image, products[i].name, products[i].rate, products[i].reviews, products[i].url, i+1, true);
        console.log(i);
    }
}

const showProductsSearch = async (text = '') => {
    console.log('showProductsSearch');
    const favors = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_favor',
        params: {
            userid: USER_ID
        }
    })).data;
    
    const products = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_products',
        params: {
            from: 0,
            // limit: parseInt(limit),
            limit: 300,
            catalogid: 'all',
            search: text
        }
    })).data.map(product => {
        for(let i = 0; i<favors.length; i++) {
            if(product.url == favors[i].product_url) {
                product.like = true;
                return product;
            }
        }

        product.like = false;
        return product;
    });

    for(let i = 0; i<products.length; i++) {
        appendProductSearch(products[i].image, products[i].name, products[i].rate, products[i].reviews, products[i].url, i+1, products[i].like);
        console.log(i);
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

function appendProductFavor(image, name, rate, reviews, url, index = 0, like = false) {
    let block = listFavor.querySelector('.template').cloneNode(true);
    let continueNext = true;

    image.replace('///', '//');

    block.classList.remove('template', 'none');

    block.querySelector('.products__item__img img').src = image;
    block.querySelector('.products__item__name').textContent = name;
    block.querySelector('.products__item__rating span').textContent = rate;
    block.querySelector('.products__item__reviews span').textContent = reviews;
    block.querySelector('.products__item__url').href = url;

    if(like == true) {
        block.querySelector('.like[like="true"]').classList.remove('none');
    } else {
        block.querySelector('.like[like="false"]').classList.remove('none');
    }

    block.setAttribute('index', index);

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

function appendProductSearch(image, name, rate, reviews, url, index = 0, like = false) {
    let block = listSearch.querySelector('.template').cloneNode(true);
    let continueNext = true;

    image.replace('///', '//');

    block.classList.remove('template', 'none');

    block.querySelector('.products__item__img img').src = image;
    block.querySelector('.products__item__name').textContent = name;
    block.querySelector('.products__item__rating span').textContent = rate;
    block.querySelector('.products__item__reviews span').textContent = reviews;
    block.querySelector('.products__item__url').href = url;

    if(like == true) {
        block.querySelector('.like[like="true"]').classList.remove('none');
    } else {
        block.querySelector('.like[like="false"]').classList.remove('none');
    }

    block.setAttribute('index', index);

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