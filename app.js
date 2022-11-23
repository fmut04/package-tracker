const express = require('express')
const app = express()
const Easypost = require('@easypost/api');
const bodyParser = require('body-parser')
const fs = require('fs');
const tnv = require('tracking-number-validation')
app.use(bodyParser.json())
app.use(express.static('public'))
//const host = req.get('host');
//console.log(host)
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/map', express.static(__dirname + '/public/map'))
require('dotenv').config()

const TEST_TRACKING_NUMBER = "EZ4000000004"
app.get('', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})

const testApi = new Easypost(toString(process.env.TEST_API))
//const productionApi = new Easypost(process.env.PRODUCTION_API)
const createTracker = (code,carrier,isTest) => {
  if(isTest) {
    return new testApi.Tracker({
      tracking_code: code,
      carrier: carrier,
    });
  } 
    return new productionApi.Tracker({
      tracking_code: code,
      carrier: carrier,
    });
}

app.post('/tracker', (req,res) => {
  let { tracking_code } = req.body;
  if(tnv.isValid(tracking_code) || tracking_code == TEST_TRACKING_NUMBER) {
    const tracker = createTracker(tracking_code, 'USPS', tracking_code == TEST_TRACKING_NUMBER)
    tracker.save().then(response => {
      res.send(response)
  })
  }
  else  {
    res.send("Error")
  }
})


const papa = require('papaparse');
const file = fs.createReadStream('zip_lat_lon.csv');

// Creates a hash map
// Key is zipcode value is latlon pair
var zipLatLonMap = new Map()

// Parses the csv file of US zipcodes and corresponding latlongs 
// and adds each pair to the hash map
var fileParsed = false
papa.parse(file, {
    worker: true, 
    step: function(res) {
        zipLatLonMap.set(res.data[0],[parseFloat(res.data[1]),parseFloat(res.data[2])])
    },
    complete: function() {
      fileParsed = true
    }
});


app.post("/latLon",(req,res) => {
  let { zipcodes } = req.body;
  res.send(zipsToLatLon(zipcodes))
})

// Input array of zipcodes
// return array of lat lon pairs
function zipsToLatLon(zipcodes) {
  if(!fileParsed) { return undefined  }
  let latLongs = []
  zipcodes.forEach(zip => {
    let latLon = zipLatLonMap.get(zip)
    if(latLon) latLongs.push(latLon)
  });
  return latLongs
}

app.listen(process.env.PORT ?? 3000, ()=> console.log(`Server is running at ${process.env.PORT}`))



