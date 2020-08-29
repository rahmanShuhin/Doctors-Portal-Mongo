const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const joi = require("@hapi/joi");

require("dotenv").config();
app.use(cors());
app.use(bodyParser.json());

const uri = process.env.DB_CONNECTION;
let client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//check db
app.get("/", (req, res) => {
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((err) => {
    if (err) {
      res.status(400).send("Not connected");
    } else {
      res.send("Success");
    }
    client.close();
  });
});

//get from database
app.get("/Appointment", (req, res) => {
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((err) => {
    const collection = client.db("Doctors_Portal").collection("Appointment");
    if (err) {
      console.log(err);
      res.status(400).send("Not connected");
    } else {
      const collection = client.db("Doctors_Portal").collection("Appointment");
      collection.find().toArray((err, documents) => {
        // console.log('Succesfuly inserted',result)
        res.send(documents);
        client.close();
      });
    }
  });
});
//post to database
//validation function
const validation = (data) => {
  const schema = joi.object({
    email: joi.string().min(6).required().email(),
    phone: joi.string().min(11).max(11).required(),
  });
  console.log(data);
  return schema.validate(data);
};
app.post("/addAppointment", async (req, res) => {
  const tata = {
    email: req.body.email,
    phone: req.body.phone,
  };
  console.log(tata);
  const { error } = validation(tata);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send({ err: error.details[0].message });
  }
  const data_app = req.body;
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect((err) => {
    const collection = client.db("Doctors_Portal").collection("Appointment");
    collection.insertOne(data_app, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ message: err });
        client.close();
      } else {
        res.send(data_app);
        client.close();
      }
    });
  });
});
//update data
app.post("/updateStatus", (req, res) => {
  const id = req.body.id;
  const val = req.body.value;
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((err) => {
    const collection = client.db("Doctors_Portal").collection("Appointment");
    // console.log('Succesfuly inserted',result)
    collection.updateOne(
      { _id: ObjectID(id) },
      { $set: { status: val } },
      { upsert: true },
      (err, result) => {
        if (err) {
          console.log(err, 1);
          res.status(500).send({ message: err });
        } else {
          console.log("successfull updated");
          res.send(result);
        }
        client.close();
      }
    );
  });
});
//update prescription
app.post("/updatePrescription", (req, res) => {
  console.log(req.body);
  const id = req.body.id;
  const data = req.body.medicine;
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((err) => {
    const collection = client.db("Doctors_Portal").collection("Appointment");
    // console.log('Succesfuly inserted',result)
    collection.updateOne(
      { _id: ObjectID(id) },
      { $set: { prescription: true, medicine: data } },
      (err, result) => {
        if (err) {
          console.log(err, 1);
          res.status(500).send({ message: err });
        } else {
          res.send(result);
        }
        client.close();
      }
    );
  });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listen to port ${port}`));
