const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

//Connectiong with DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.axiuk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();
      const database = client.db("Hotels");
      const dataConnection = database.collection("HotelData");

      //Second DB
      const secndDatabase = client.db("bookings")
      const secondDataConnection = secndDatabase.collection("bookingData");
      
      //Get Data from Server
        app.get('/hotels' , async(req , res)=> {
            const cursor = dataConnection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })
        //Get single Data
        app.get('/hotels/:id', async(req , res)=> {
          const id = req.params.id;
          const query = {_id : ObjectId(id)}
          const result = await dataConnection.findOne(query)
          res.json(result);
        })
        app.get('/bookings/:id', async(req , res)=> {
          const id = req.params.id;
          const query = {_id : ObjectId(id)}
          const result = await secondDataConnection.findOne(query)
          res.json(result);
        })

        //POST Bookings
        app.post('/bookings', async (req, res) => {
          const bookings = req.body;
          const result = await secondDataConnection.insertOne(bookings);
          res.json(result)
        });
        app.post('/hotels', async (req, res) => {
          const bookings = req.body;
          const result = await dataConnection.insertOne(bookings);
          res.json(result)
        });

        // GET Bookings 
        app.get('/bookings' , async(req , res)=> {
          const cursor = secondDataConnection.find({})
          const result = await cursor.toArray()
          res.send(result)
      })

      //Update data
      app.put('/bookings/:id', async (req, res) => {
        const id = req.params.id;
        const changeData = req.body;
        const find = { _id: ObjectId(id) };
        const options = { upsert: true };
        console.log(changeData.status)
        const updateDoc = {
            $set: {
                status: changeData.status,
            },
        };
        const result = await secondDataConnection.updateOne(find, updateDoc, options)
        res.json(result)
    })

      // DELETE Hotel data
      app.delete('/bookings/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await secondDataConnection.deleteOne(query);
        res.json(result);
    })


    } finally {
    //   await client.close();
    }
  }
run().catch(console.dir);

app.get('/', (req , res) =>{
    res.send('This is now connected')
})
app.listen(port , (req , res)=>{
    console.log('Yeasss!!!')
})