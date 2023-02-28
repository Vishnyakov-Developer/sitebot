let timerApplication    = undefined;
let timerArrowInner     = undefined;

const startApplication = async function (from, limit, catalogid, search, end = false) {

    console.log('start...');

    clearInterval(timerApplication);
    timerApplication = setTimeout(() => {
        const scrollElement = document.querySelector('.search');
        scrollElement.scrollIntoView();
    }, 10)

    window.localStorage.setItem('from', 0);

    clearInterval(timerArrowInner);
    timerArrowInner = setInterval(async () => {
        
        const watchCount     = await getWatch(USER_ID, catalogid);
        const lengthProducts = parseInt(await getCountProducts(catalogid));

        ELEMENT_ARROW_INNER.textContent = lengthProducts-watchCount;
        list.querySelectorAll('.products__item:not(.template)').forEach((block, index) => {
            try {
                if(isVisible(block)) {
                    if(parseInt(block.getAttribute('index')) > parseInt(watchCount)) {
                        setWatch(USER_ID, catalogid, parseInt(block.getAttribute('index'))+1);
                    }
                }
            } catch(e) {
                console.log(e);
            }
            
        });
    }, 1250);

    if(end != false) {
        const countProducts = await getCountProducts(catalogid);
        await showProducts(countProducts-parseInt(limit), parseInt(limit), catalogid, search);
        document.documentElement.scrollTop = document.documentElement.scrollHeight;
        return false;
    }

    await showProducts(from, limit, catalogid, search);
    document.documentElement.scrollTop = 0;

    autoloaderStart();

    openPage('main-catalog');

    stopApplication = async () => {
        clearProducts(500);
        stopAutoLoader();
        clearInterval(timerApplication);
        clearInterval(timerArrowInner);

        nextProducts = () => {};
        backProducts = () => {};

        setTimeout(async () => {
            // ELEMENT_ARROW_INNER.textContent = '...';
        }, 2500)
        
    }
    return false;
}

function hideArrowDown() {
    ELEMENT_ARROW.classList.add('opacity0');
}

function showArrowDown() {
    ELEMENT_ARROW.classList.remove('opacity0');
}

function isVisible(elem) {
    let coords = elem.getBoundingClientRect();
    let windowHeight = document.documentElement.clientHeight;
    let topVisible = coords.top > 0 && coords.top < windowHeight;
    let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;
    return topVisible || bottomVisible;
}

async function getWatch(userid, category) {
    const result = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_watch',
        params: {
            category: category,
            userid: userid
        }
    })).data;
    return result;
}

async function setWatch(userid, category, count) {
    const result = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'set_watch',
        params: {
            category: category,
            userid: userid,
            watch: count
        }
    })).data;

    return true;
}

ELEMENT_ARROW.addEventListener('click', () => {
    lastProducts();
})