const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

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
        const reportedPostCollection = client.db('AutoCar').collection('reportPost');
        const paymentsCollection = client.db('AutoCar').collection('payments');

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



        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const singleCars = await carCollection.findOne(query);
            res.send(singleCars);
        })


        app.post('/cars', async (req, res) => {
            const sellerPost = req.body;
            const result = await carCollection.insertOne(sellerPost);
            res.send(result);
        })
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await carCollection.deleteOne(query);
            res.send(result)
        })
        app.get('/cars', async (req, res) => {
            const query = {}
            const cars = await carCollection.find(query).toArray();
            res.send(cars)
        })
        
        app.get('/cars/seller/:email', async (req, res) => {
            const email = req.params.email
            console.log(req.params.email)
            const query = { email: email }
            const cursor = carCollection.find(query)
            const cars = await cursor.toArray();
            res.send(cars)
        })
        app.get('/seller/post', async (req, res) => {
            const query = { postStatus: 'sellerPost' }
            const result = await carCollection.find(query).toArray();
            res.send(result);
        })
        app.delete('/seller/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await carCollection.deleteOne(query);
            res.send(result)
        })



        app.post('/reportedpost', async (req, res) => {
            const reportPost = req.body;
            const result = await reportedPostCollection.insertOne(reportPost);
            res.send(result)
        })
        app.get('/reportedpost', async (req, res) => {
            const query = {}
            const reportedPost = await reportedPostCollection.find(query).toArray();
            res.send(reportedPost)
        })
        app.delete('/reportedpost/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reportedPostCollection.deleteOne(query);
            res.send(result)
        })






        app.post('/wishlist', async (req, res) => {
            const wishList = req.body;
            const result = await wishListCollection.insertOne(wishList);
            res.send(result)
        })


        app.get('/allwislist', async (req, res) => {
            const query = {}
            const cursor = wishListCollection.find(query)
            const allbookings = await cursor.toArray();
            res.send(allbookings)
        })
        app.delete('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await wishListCollection.deleteOne(query);
            res.send(result)
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

        app.get('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const singleCars = await wishListCollection.findOne(query);
            res.send(singleCars);
        })



        app.get('/users', async (req, res) => {
            const query = {}
            const cursor = usersCollection.find(query)
            const alluser = await cursor.toArray();
            res.send(alluser)
        })
        app.get('/user/seller', async (req, res) => {
            const query = { role: 'seller' }
            const user = await usersCollection.find(query).toArray();
            res.send(user)
        })
        app.get('/user/buyer', async (req, res) => {
            const query = { role: 'buyer' }
            const user = await usersCollection.find(query).toArray();
            res.send(user)
        })
        app.delete('/users/:id', async (req, res) => {
            console.log(req.params.id)
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' })
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' })
        })

        app.put('/users/admin/:id', verifyUser, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'Forbidden Access' })
            }

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

        app.put('/users/admin/verified/:id', verifyUser, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'Forbidden Access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    useVerify: 'verified'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.post('/create-payment-intent', async (req, res) => {
            const wishlist = req.body;
            const price = wishlist.price;
            const amount = price * 100;


            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.wishListId
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    wishListId: payment.wishListId
                }
            }
            const updatedResult = await wishListCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
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