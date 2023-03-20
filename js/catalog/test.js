const testProductsShow = async function (from, limit, catalogid, search = '', prepend = false) {

    
    const products = (await axios({
        method: 'GET',
        url: CATALOG_URL + 'get_products',
        params: {
            from: from,
            limit: parseInt(limit),
            catalogid: catalogid,
            search: search
        }
    })).data;

}