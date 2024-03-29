/* Вывод данных по API и генерация товаров по списку */

// ⬇️ Добавить продукт в избранное по клику
document.addEventListener('click', async (ctx) => {
    const element = ctx.target;

    if(element.getAttribute('like') == 'false') {
        new Toaster('Добавлено в избранное', 3000);
    }
    
    if(element.classList.contains('like')) {
        const product = element.parentNode.parentNode;
        const link = element.getAttribute('like') == 'true' ? CATALOG_URL + 'del_favor' : CATALOG_URL + 'add_favor';
        await axios({
            method: 'GET',
            url: link,
            params: {
                userid: USER_ID,
                id: product.getAttribute('product_id')
            }
        });

        product.querySelector('.like.none').classList.remove('none');
        element.classList.add('none');
    }
})

const getCountProducts = async function(catalogid, search = '') {
    const result = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_count',
        params: {
            catalogid: catalogid,
            search: search,
            userid: USER_ID,
        }
    })).data;

    return result;
} 

const showProducts = async function (from, limit, catalogid, search = '', prepend = false) {
    const startFunc = performance.now();
    setHistory(catalogid, from);
    const favors = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_favor',
        params: {
            userid: USER_ID
        }
    })).data;

    console.log(CATALOG_URL + 'get_products' + `?from=${from}&limit=${count}&catalogid=${catalogid}&search=${search}&userid=${USER_ID}`);
    const products = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_products',
        params: {
            from: from,
            // limit: parseInt(limit),
            limit: count,
            catalogid: catalogid,
            search: search,
            userid: USER_ID,
            
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

    console.log(`первичные запросы в show_products завершены за ${performance.now()-startFunc}`)


    console.log(products)


    if(prepend == true) {
        products.reverse();
        await products.forEach((product, index) => appendProduct(product.image, product.platform, product.price, product.oldPrice, product.startPrice, product.views, product.name, product.rate, product.reviews, product.url, true, parseInt(from) + index, product.like, product.date_parse, product.id, product.saleProcents, product.change_procents));
    } else {
        await products.forEach((product, index) => appendProduct(product.image, product.platform, product.price, product.oldPrice, product.startPrice, product.views, product.name, product.rate, product.reviews, product.url, prepend, parseInt(from) + index, product.like, product.date_parse, product.id, product.saleProcents, product.change_procents));
    }
    
    
    window.localStorage.setItem('catalog_id', catalogid);
    list.classList.remove('fullpading');

    const countProducts = await getCountProducts(catalogid, search);
    document.querySelector('.main-catalog .products__loader').classList.remove('none');
    
    if(parseInt(from) + parseInt(count) >= countProducts) {
        nextProducts = () => {};
        document.querySelector('.main-catalog .products__loader').classList.add('none');
        
    } else {
        nextProducts = async (interval = 0) => {
            

            const value = document.documentElement.scrollHeight-document.documentElement.scrollTop;
            clearProducts(countForAdd);
            const value2 = document.documentElement.scrollHeight-document.documentElement.scrollTop;
            document.documentElement.scrollTop -= value - value2;
    
            if(lastLoaded+interval > Date.now()) {
                return false;
            }
            lastLoaded = Date.now();
            
            await showProducts(parseInt(from)+countForAdd, countForAdd, catalogid, search);
        }
    }
    nextProducts = async () => await showProducts(parseInt(from)+parseInt(limit), limit, catalogid, search);
    

    if(parseInt(from) > 0) {
        backProducts = async (interval = 0) => {
            const value = document.documentElement.scrollHeight-document.documentElement.scrollTop;
            clearProducts(countForAdd, true);
            const value2 = document.documentElement.scrollHeight-document.documentElement.scrollTop;
            document.documentElement.scrollTop += value - value2;

            if(lastLoaded+interval > Date.now()) {
                return false;
            }   
            lastLoaded = Date.now();
    
            await showProducts(parseInt(from)-parseInt(countForAdd), countForAdd, catalogid, search, true);
        }
    } else {
        backProducts = (interval = 0) => {}
    }

    lastProducts = async () => {
        backProducts = () => {};
        nextProducts = () => {};
        

        if(parseInt(countProducts)-limit < 0) {
            console.log(1)
            // await showProducts(parseInt(countProducts), count, catalogid, search, false);
            // console.log(parseInt(countProducts), count, catalogid, search, false)
            document.documentElement.scrollTop = document.documentElement.scrollHeight;
            
        } else {
            console.log(2)
            clearProducts(500);
            await showProducts(parseInt(countProducts)-limit, count, catalogid, search, false);
        }

        
        document.documentElement.scrollTop = document.documentElement.scrollHeight;
    }

    console.log('функция show_products завершена за ', performance.now()-startFunc)
    
}

function alertMessage(text) {
    alert(text);
}

function reverse(array) {
    return [...array].reverse();
}

function clearProducts(count, startWithEnd = false) {
    if(startWithEnd == true) {
        reverse(list.querySelectorAll('.products__item:not(.template)')).forEach((block, index) => {
            if(index >= count) {
                return false;
            }
            list.removeChild(block);
        })    
    } else {
        list.querySelectorAll('.products__item:not(.template)').forEach((block, index) => {
            if(index >= count) {
                return false;
            }
            list.removeChild(block);
        })
    }
    
}

function appendProduct(image, platform, price, oldPrice, startPrice, views, name, rate, reviews, url, prepend = false, index = 0, like = false, date, id, saleOriginal = 0, changeProcents = 0) {
    console.log('appendProduct');
    let block = list.querySelector('.template').cloneNode(true);
    let continueNext = true;

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

    image.replace('///', '//');

    block.classList.remove('template', 'none');

    if(platform == 2) {
        for(let i = 0; i<12; i++) {
            let num = `${i+1}`;
            if(num.length == 1) {
                num = `0${num}`;
            }
            block.querySelector(`.products__item__img img:nth-child(${i+1})`).src = image.replace(/https:\/\/basket-[\d]+/g, `https://basket-${num}`);
            block.querySelector(`.products__item__img img:nth-child(${i+1})`).classList.remove('none');
        }
    } else {
        for(let i = 0; i<12; i++) {
            let num = `${i+1}`;
            if(num.length == 1) {
                num = `0${num}`;
            }
            if(i == 0) {
                block.querySelector(`.products__item__img img:nth-child(${i+1})`).src = image;
                block.querySelector(`.products__item__img img:nth-child(${i+1})`).classList.remove('none');
            } else {
                continue;
            }
            
            
        }
    }
    
    
    block.querySelector('.products__item__name').textContent = name;
    // str.replace(/https:\/\/basket-[\d]+/g, 'https://basket-02')

    if(rate == 'undefined') {
        rate = 0;
    }

    if(reviews == 'undefined') {
        reviews = 0;
    }

    block.querySelector('.products__item__rating span').textContent = rate ?? 0
    block.querySelector('.products__item__reviews span').textContent = reviews ?? 0;
    block.querySelector('.products__item__price__sale').textContent = parseInt(price).toLocaleString() + ' ₽';
    block.querySelector('.products__item__price__original').textContent = parseInt(oldPrice).toLocaleString() + ' ₽';
    block.querySelector('.products__item__url').href = url.replace('//product', '/product');;
    block.querySelector('.views').textContent = views;
    block.querySelector('.products__item__url').setAttribute('target', '_blank');
    block.querySelector('.products__item__price__tr .value').textContent = ` ${startPrice-price} ₽`;
    
    block.querySelector('.products__item__time').textContent = moment(date).locale('ru').format('HH:mm');
    if(saleOriginal > 0) {
        block.querySelector('.products__item__sale').textContent = saleOriginal + '%';
    } else {
        block.querySelector('.products__item__sale').textContent = Math.ceil(100-parseInt(price)/(parseInt(oldPrice)/100)) + '%';
    }
    

    block.setAttribute('date_string', moment(date).locale('ru').format('D MMMM'))
    block.setAttribute('date', date);

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
    block.setAttribute('index', index);

    // Поиск клонов
    // list.querySelectorAll('.products__item:not(.template)').forEach((item, index) => {
    //     if(item.querySelector('.products__item__url').href == url) {
    //         continueNext = false;
    //         return false;
    //     }
    // })

    if(!continueNext) {
        return false;
    }

    if(prepend == true) {
        list.prepend(block);
    } else {
        list.appendChild(block);
    }
}

/* Вывод данных по API и генерация товаров по списку */