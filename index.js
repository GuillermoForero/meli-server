const express = require('express')
var Request = require("request");
const app = express()
const port = 443
//{
//   "id": String, "title": String, "price": {
//       "currency": String, "amount": Number, "decimals": Number
//      },
//      “picture”: String, "condition": String, "free_shipping": Boolean
//      }
app.get('/items', (req, res) => {
    const queryParam = req.query.search;
    let returnValue = {
        author: {
            name: 'Guillermo',
            lastname: 'Forero'
        },
        categories: [],
        items: []
    }
    Request.get(`https://api.mercadolibre.com/sites/MLA/search?q=${queryParam}`, (error, response, body) => {
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
    });
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