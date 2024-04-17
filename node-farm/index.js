import fs from 'fs';
import http from 'http';
import url from 'url';


// const readText = fs.readFile('./read.txt', 'utf-8', (err, data) => {
//     console.log(data);
//     fs.writeFile('./write.txt', data, err => {
//         if (err) {
//             console.log(err);
//             return;
//         }
//         console.log('Written')
//     })
// });

// console.log(readText)

const overviewTemplate = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8');
const productTemplate = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8');
const productCardTemplate = fs.readFileSync(`${__dirname}/templates/components/productCard.html`, 'utf-8');
const productData = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8'));

function mergeTemplateData(template, data) {
    let merge = template.replace(/{%ID%}/g, data.id);
    merge = merge.replace(/{%NAME%}/g, data.productName);
    merge = merge.replace(/{%IMAGE%}/g, data.image);
    merge = merge.replace(/{%ORIGIN%}/g, data.from);
    merge = merge.replace(/{%NUTRIENTS%}/g, data.nutrients);
    merge = merge.replace(/{%QUANTITY%}/g, data.quantity);
    merge = merge.replace(/{%PRICE%}/g, data.price);
    merge = merge.replace(/{%ORGANIC%}/g, !data.organic ? 'not-organic' : '');
    merge = merge.replace(/{%DESCRIPTION%}/g, data.description);

    return merge;
}

const server = http.createServer((req, res) => {
    const reqData = url.parse(req.url, true);

    switch (reqData.pathname) {
        case '/overview':
        case '/':
            res.writeHead(200, {
                "Content-type": 'text/html',
            })

            let mergedProductCards = productData.map(product => mergeTemplateData(productCardTemplate, product));
            mergedProductCards = mergedProductCards.join('');
    
            res.end(overviewTemplate.replace(/{%PRODUCTS%}/, mergedProductCards));
            break;
        case '/product':
            const { id } = reqData.query;

            if (!id) {
                res.writeHead(400, {
                    "Content-type": 'text/html',
                })
                return res.end('<h1>Product ID is missing!</h1>');
            }
            res.writeHead(200, {
                "Content-type": 'text/html',
            })

            const mergedProductTemplate = mergeTemplateData(productTemplate, productData[reqData.query.id]);

            res.end(mergedProductTemplate);
            break;
        case '/api':
            res.writeHead(200, {
                "Content-type": 'application/json',
            })
            res.end(productData);
            break;
        default:
            res.writeHead(404, {
                "Content-type": 'text/html',
            })
            res.end('<h1>Page not found!</h1>')
    }
})

server.listen(5000, '0.0.0.0', () => console.log('Server running on port 5000'));
