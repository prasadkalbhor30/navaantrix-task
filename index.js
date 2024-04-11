const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://0.0.0.0:27017');

const filePath = './data.csv';

const collectionName = 'myData';

loadDataFromCSV(filePath, collectionName);

async function loadDataFromCSV(filePath, collectionName) {
  await client.connect();
  console.log("connected to db");

  try {
    const database = client.db('my_database');
    const collection = database.collection(collectionName);
    await collection.deleteMany({});
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        console.log("data :::", row)
        data.push(row);
      })
      .on('end', async () => {
        await collection.insertMany(data);
        console.log('File data loaded ...');
        await client.close();
      })
      .on('error', async (error) => {
        console.error('err ', error);
        await client.close();
      });
  } catch (error) {
    console.error('err ', error);
    await client.close();
  }
}
