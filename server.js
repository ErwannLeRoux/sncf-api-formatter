const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')

async function main() {
    let router = express.Router();
    let app = express()

    app.use(bodyParser.urlencoded({ extended: false }))

    app.use(bodyParser.json())

    app.set('view engine', 'ejs')

    app.use('/assets', express.static('public'))

    router.get('/', (request, response) => {
        response.send({status: 'Ok'})
    });

    app.use('/', router)

    app.listen(8080)
}

main()
