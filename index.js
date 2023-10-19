const express = require("express");
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.dd29rey.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const techCollection = client.db("TechDB").collection("Technology");
        const cartCollection = client.db("myCart").collection("Cart");

        // Create a data
        app.post('/products', async (req, res) => {
            const item = req.body;
            // console.log(item);
            const result = await techCollection.insertOne(item);
            res.send(result);
        })

        // read brand wise data 
        app.get("/products/:brand", async (req, res) => {
            const brand = req.params.brand;
            // console.log(brand);
            const query = {
                brand: brand
            };
            const result = await techCollection.find(query).toArray();
            console.log(result);
            res.send(result);
        })

        // read single data
        app.get("/update/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = {
                _id: new ObjectId(id),
            };
            const result = await techCollection.findOne(query);
            console.log(result);
            res.send(result);
        })

        // update data
        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            const item = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };

            const updateItem = {
                $set: {
                    brand: item.brand,
                    name: item.name,
                    photo: item.photo,
                    price: item.price,
                    rating: item.rating,
                    type: item.type,
                },
            };
            const result = await techCollection.updateOne(filter, updateItem, options);
            res.send(result);
        })

        // add to cart by post
        app.post('/carts', async (req, res) => {
            const item = req.body;
            console.log(item);
            const result = await cartCollection.insertOne(item);
            res.send(result);
        })
        // find many for user MyCart route
        app.get("/carts", async (req, res) => {
           const data = await cartCollection.find().toArray();
           res.send(data);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server is running...')
})

app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
})
