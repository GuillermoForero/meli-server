const express = require('express')
var Request = require("request");
const app = express()
const port = 4000
//{
//   "id": String, "title": String, "price": {
//       "currency": String, "amount": Number, "decimals": Number
//      },
//      “picture”: String, "condition": String, "free_shipping": Boolean
//      }
app.get('/items', (req, res) => {
    try{
        let queryParam = req.query.search;
        if(!queryParam){
           queryParam = '' 
        }
        let returnValue = {
            author: {
                name: 'Guillermo',
                lastname: 'Forero'
            },
            categories: [],
            items: []
        }
        console.log('query', queryParam.toString())
        Request.get(`https://api.mercadolibre.com/sites/MLA/search?q=${queryParam.toString()}`, (error, response, body) => {
            console.log('body', body)
            try{
                if(body === 'Bad Request'){
                    res.statusCode = 500;
                    res.send(JSON.stringify({
                        statusCode: 500,
                        message: 'Bad Request'
                    }))
                    throw new Error()
                }
                const itemsList = JSON.parse(body).results;
                const tempList = []
                for (let i = 0; i < 4; i++) {
                    if (itemsList[i]) {
                        tempList.push(
                            {
                                id: itemsList[i].id,
                                title: itemsList[i].title,
                                price: itemsList[i].price,
                                picture: itemsList[i].thumbnail,
                                condition: itemsList[i].condition,
                                free_shipping: itemsList[i].shipping.free_shipping,
                            }
                        )
                    }
                }
                returnValue = { ...returnValue, items: tempList };
                console.log(tempList);
                res.send(JSON.stringify(returnValue));   
            } catch(e) {
                
            }
        });
    }
    catch(e) {
        console.log(e)
    }
    
})

app.get('/items/:id', (req, res) => {
    const itemId = req.params.id;
    let returnValue = {
        author: {
            name: 'Guillermo',
            lastname: 'Forero'
        },
        item: {}
    }
    Request.get(`https://api.mercadolibre.com/items/${itemId}`, (error, response, body) => {
        try {
            const itemDataApi = JSON.parse(body);
            if (itemDataApi.error) {
                res.statusCode = 500;
                res.send(JSON.stringify({
                    statusCode: 500,
                    message: itemDataApi.error
                }))
                throw new Error()
            }
            let itemData = {
                id: itemDataApi.id,
                title: itemDataApi.title,
                price: itemDataApi.price,
                picture: itemDataApi.thumbnail,
                condition: itemDataApi.condition,
                free_shipping: itemDataApi.shipping.free_shipping,
                sold_quantity: itemDataApi.sold_quantity,
            }
            Request.get(`https://api.mercadolibre.com/items/${itemId}/description`, (error, response, body) => {
                if (error) {
                    return console.dir(error);
                }
                const descriptionDataApi = JSON.parse(body);
                itemData = { ...itemData, description: descriptionDataApi.plain_text }
                returnValue.item = itemData;
                res.send(JSON.stringify(returnValue))
            });
        }
        catch (e) {

        }

    });
})

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})