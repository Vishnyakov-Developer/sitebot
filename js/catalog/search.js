/* Обработка поиска товаров Search на примукнутной к верхней границе панели */
input.addEventListener('input', async (ctx) => {
    // await showProducts(0, count, catalogid, input.value);
    stopApplication();
    hideArrowDown();
    startApplication(0, count, window.localStorage.getItem('catalog_id'), input.value);
})
/* Обработка поиска товаров Search на примукнутной к верхней границе панели */
