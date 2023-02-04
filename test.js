const url = `https://www.ozon.ru/product/geympad-dlya-smartfona-ipega-pg-9220-chernyy-840097123/?asb2=BCL_V9sNrPFUULqrnjKfN5n2545J-sDBfq_53UsobmvnuJsFJYTvwMeGwQVUDyI6&avtc=1&avte=0&avts=1674346517`;
// const readyUrl = `https://www.ozon.ru/context/detail/id/839089800`;

const urlReady = "https://www.ozon.ru/context/detail/id/" + /-([\d]+)\/\?/g.exec(url)[1];
console.log(urlReady)


