const express = require('express')
const app = express()
const Easypost = require('@easypost/api');
const bodyParser = require('body-parser')
const fs = require('fs');
const tnv = require('tracking-number-validation')
const axios = require("axios")
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static('public'))
const https = require("https")
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
const productionApi = new Easypost(process.env.PRODUCTION_API)
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

// app.post('/tracker', (req,res) => {
//   let { tracking_code } = req.body;
//   if(tnv.isValid(tracking_code) || tracking_code == TEST_TRACKING_NUMBER) {
//     const tracker = createTracker(tracking_code, 'USPS', tracking_code == TEST_TRACKING_NUMBER)
//     tracker.save().then(response => {
//       res.send(response)
//  })
// }
// else  {
//   res.send("Error")
// }
// })


const papa = require('papaparse');
const { response } = require('express');
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


 

  
// Creating object of key and certificate
// for SSL
// const options = {
//   key: fs.readFileSync("server.key"),
//   cert: fs.readFileSync("server.cert"),
// };
  
// Creating https server by passing
// options and app object
// https.createServer(options, app)
// .listen(process.env.PORT ?? 3000, function (req, res) {
//   console.log(`Server started at port ${process.env.PORT ?? 3000}`);
// });

app.post('/tracker', (req,res) => {
const encodedParams = new URLSearchParams();
encodedParams.append("trackingCode", "EZ4000000004");
encodedParams.append("apiKey", "EZTK3a2d4b398f364d0e89b4bedae7b6499fmaj3ZR97qsVxMFH0dslvkw");

// const options = {
//   method: 'POST',
//   url: 'https://api.easypost.com/v2/trackers ',
//   headers: {
//     'content-type': 'application/json',
//   },
//   data: {
//     "tracker": {

//     }
//   }
// };
let { tracking_code } = req.body

const data = {
  "tracker": {
    "tracking_code": tracking_code,
    "carrier": "USPS"
  }
}
const username = process.env.TEST_API
const password = ''
const token = Buffer.from(`${username}:${password}`).toString("base64")
axios
.post('https://api.easypost.com/v2/trackers', data, {
  headers:{
    "Authorization": `Basic ${token}`
  },
})
.then(response => {
  res.send(response.data)
})
.catch(err => {
  console.error(err)
})
})


// const data = JSON.stringify({
//   name: 'John Doe',
//   job: 'Content Writer'
// })

// const options = {
//   hostname: 'https://api.easypost.com',
//   path: '/v2/trackers',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Content-Length': data.length
//   },
//   auth: {
//     'username': process.env.TEST_API,
//     'password': ''
//   }
// }

// const req = https
//   .request(options, res => {
//     let data = ''

//     console.log('Status Code:', res.statusCode)

//     res.on('data', chunk => {
//       data += chunk
//     })

//     res.on('end', () => {
//       console.log('Body: ', JSON.parse(data))
//     })
//   })
//   .on('error', err => {
//     console.log('Error: ', err.message)
//   })

// req.write(data)
// req.end()
