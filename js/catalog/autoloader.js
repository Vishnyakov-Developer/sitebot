

let autoloaderInterval = undefined;

function stopAutoLoader() {
    clearInterval(autoloaderInterval);
    console.log('authoLoaderInterval is stopped.');
    clearTimeout(timerPage);
    clearTimeout(timerPageBack);
}

function autoloaderStart() {
    stopAutoLoader();
    autoloaderInterval = setInterval(() => {
        const scrollReverse = document.documentElement.scrollHeight-document.documentElement.clientHeight-document.documentElement.scrollTop;
        const scroll = document.documentElement.scrollTop;
    
        if(scrollReverse < scrollReverseDrop) {
            
            if(timerPage == undefined) {
                timerPage = setTimeout(async () => {
                    addProducts();
                }, 1000);
            }
        } else {
            clearTimeout(timerPage);
            timerPage = undefined;
        }
    
        if(scroll < scrollDrop) {
            
            if(timerPageBack == undefined) {
                timerPageBack = setTimeout(async () => {
                    addProductsBack();
                }, 1000);
            }
        } else {
            clearTimeout(timerPageBack);
            timerPageBack = undefined;
        }
        
    }, 2500)
}



const addProducts = function () {
    
    const scrollReverse = document.documentElement.scrollHeight-document.documentElement.clientHeight-document.documentElement.scrollTop;
    const scroll = document.documentElement.scrollTop;

    if(scrollReverse > scrollReverseDrop) {
        clearTimeout(timerPage);
        timerPage = undefined;
        return false;
    }
    
    nextProducts(150);
    clearTimeout(timerPage);
    timerPage = undefined;
    return false;
}

const addProductsBack = function () {
    
    const scrollReverse = document.documentElement.scrollHeight-document.documentElement.clientHeight-document.documentElement.scrollTop;
    const scroll = document.documentElement.scrollTop;

    if(scroll > scrollDrop) {
        clearTimeout(timerPageBack);
        timerPageBack = undefined;
        return false;
    }
    
    backProducts(150);
    clearTimeout(timerPageBack);
    timerPageBack = undefined;
    return false;
}

const testFunction = async () => { 
    clearProducts(countForAdd)
    document.documentElement.scrollTop -= 150*countForAdd;
}

let lastValue = document.documentElement.scrollHeight;
const testValue = () => {
    const value = document.documentElement.scrollHeight-document.documentElement.scrollTop;
    clearProducts(10);
    const value2 = document.documentElement.scrollHeight-document.documentElement.scrollTop;
    const razica = value-value2;
    document.documentElement.scrollTop -= razica;
}
