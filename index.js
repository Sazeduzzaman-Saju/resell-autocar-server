const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();

require('dotenv').config();

app.use(cors());
app.use(express.json());







const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kystxht.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyUser = (req, res, next) => {
    console.log(req.headers.authorization)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized')
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const carCategoriesCollection = client.db('AutoCar').collection('carCategories');
        const carCollection = client.db('AutoCar').collection('cars');
        const wishListCollection = client.db('AutoCar').collection('wishList');
        const usersCollection = client.db('AutoCar').collection('users');

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


        app.post('/wishlist', async (req, res) => {
            const wishList = req.body;
            const result = await wishListCollection.insertOne(wishList);
            console.log(result)
            res.send(result)
        })


        app.get('/allwislist', async (req, res) => {
            const query = {}
            const cursor = wishListCollection.find(query)
            const allbookings = await cursor.toArray();
            res.send(allbookings)
        })

        app.get('/wishlist', verifyUser, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Forbidden Access' });
            }
            const query = { email: email };
            const myWishlist = await wishListCollection.find(query).toArray();
            res.send(myWishlist)
        })



        app.get('/users', async (req, res) => {
            const query = {}
            const cursor = usersCollection.find(query)
            const alluser = await cursor.toArray();
            res.send(alluser)
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })


        app.put('/users/admin/:id', async (req, res) => {
            // const decodedEmail = req.decoded.email;
            // const query = { email: decodedEmail };
            // const user = await usersCollection.findOne(query);

            // if (user?.role !== 'admin') {
            //     return res.status(403).send({ message: 'Forbidden Access' })
            // }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ access_token: token })
            }
            console.log(user);
            res.status(403).send({ access_token: '' })
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