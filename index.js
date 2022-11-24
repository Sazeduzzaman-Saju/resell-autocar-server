const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

require('dotenv').config();

app.use(cors());
app.use(express.json());







const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kystxht.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        const carCategoriesCollection = client.db('AutoCar').collection('carCategories');
        const carCollection = client.db('AutoCar').collection('cars');

        app.get('/carCategories', async (req, res) => {
            const query = {}
            const cursor = carCategoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories)
        })
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { slug: id }
            const cars = await carCollection.find(query).toArray();
            res.send(cars);
        })








        app.get('/cars', async (req, res) => {
            const query = {}
            const cursor = carCollection.find(query)
            const cars = await cursor.toArray();
            res.send(cars)
        })

        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const singleCars = await carCollection.findOne(query);
            console.log(singleCars)
            res.send(singleCars);
        })

    }
    finally {

    }

}
run().catch(error => console.error(error))














app.get('/', (req, res) => {
    res.send('Auto Car Api Running ')
})

app.listen(port, () => {
    console.log(`Auto Car Running in ${port}`)
})