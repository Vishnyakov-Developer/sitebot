/* Вывод данных по API и генерация товаров по списку */



const getCountProducts = async function(catalogid, search = '') {
    const result = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_count',
        params: {
            catalogid: catalogid,
            search: search
        }
    })).data;

    return parseInt(Object.values(result[0])[0]);
} 

const showProducts = async function (from, limit, catalogid, search = '', prepend = false) {

    console.log('show_products... | from: ', from);
    
    const products = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_products',
        params: {
            from: from,
            // limit: parseInt(limit),
            limit: count,
            catalogid: catalogid,
            search: search
        }
    })).data;

    
    if(prepend == true) {
        products.reverse();
        await products.forEach((product, index) => appendProduct(product.image, product.name, product.rate, product.reviews, product.url, true, parseInt(from) + index));
    } else {
        await products.forEach((product, index) => appendProduct(product.image, product.name, product.rate, product.reviews, product.url, prepend, parseInt(from) + index));
    }
    
    
    window.localStorage.setItem('catalog_id', catalogid);
    list.classList.remove('fullpading');

    const countProducts = await getCountProducts(catalogid, search);
    if(parseInt(from) + parseInt(count) >= countProducts) {
        nextProducts = () => {};
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
    // nextProducts = async () => await showProducts(parseInt(from)+parseInt(limit), limit, catalogid, search);
    

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
        clearProducts(500);

        await showProducts(parseInt(countProducts)-limit, limit, catalogid, search, false);
        document.documentElement.scrollTop = document.documentElement.scrollHeight;
    }
    
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

function appendProduct(image, name, rate, reviews, url, prepend = false, index = 0) {
    let block = list.querySelector('.template').cloneNode(true);
    let continueNext = true;

    image.replace('///', '//');

    block.classList.remove('template', 'none');

    block.querySelector('.products__item__img img').src = image;
    block.querySelector('.products__item__name').textContent = name;
    block.querySelector('.products__item__rating span').textContent = rate;
    block.querySelector('.products__item__reviews span').textContent = reviews;
    block.querySelector('.products__item__url').href = url;
    block.setAttribute('index', index);

    list.querySelectorAll('.products__item:not(.template)').forEach((item, index) => {
        if(item.querySelector('.products__item__url').href == url) {
            continueNext = false;
            return false;
        }
    })

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