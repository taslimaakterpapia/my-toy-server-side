const express = require ('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS)



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8nylo01.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// *******************
async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      const toyCollection=client.db('toyMarket').collection('toys');
      const indexKey = { name: 1, sellerName: 1 };
      const indexOptions = { multipleFinding: "webfinding" };
      //search
      app.get('/search/:text',async(req,res)=>{
        const searchText=req.params.text;
        const result=await toyCollection.find({$or:[{toyname:{$regex:searchText,$options:"i"}}]}).toArray();
        res.send(result);
      })
  
      app.post('/addtoy',async(req,res)=>{
          const toy=req.body;
          const result=await toyCollection.insertOne(toy);
          res.send(result);
          console.log(toy);
      })
  
      app.get('/alltoy',async(req,res)=>{
        
          const result=await toyCollection.find().limit(20).toArray();
          res.send(result);
      })
  
      app.get('/mytoys/:email',async(req,res)=>{
        console.log(req.params.email);
        const result=await toyCollection.find({postedBy:req.params.email}).sort({price:-1}).toArray();
        res.send(result);
      });
  
  
      app.get('/alltoys/:id',async(req,res)=>{
          const id=req.params.id;
          console.log(id);
          const result=await toyCollection.findOne({_id:new ObjectId(id)});
          res.send(result);
          console.log(result);
      });
      app.put('/alltoys/:id',async(req,res)=>{
        const id=req.params.id;
        const update=req.body;
        const query={ _id: new ObjectId(id)};
        const options = { upsert: true };
        const updatedToys={
            $set:{
                toyname:update.toyname,
                description:update.description,
                image:update.image,
                category:update.category,
                quantity:update.quantity,
                sellername:update.sellername,
                rating:update.rating,
                postedBy:update.postedBy,
                price:update.price
            }
        }
        const result=await  toyCollection.updateOne(query, updatedToys, options);
        res.send(result);
    });
  
      app.delete('/mytoys/:id',async(req,res)=>{
        const id=req.params.id;
        const result=await toyCollection.deleteOne({_id:new ObjectId(id)});
        res.send(result);
      });

        // Send a ping to confirm a successful connection****************
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`SERVER is running on port, ${port}`)
})