// const express = require('express')
// const app = express()
// const Easypost = require('@easypost/api');
// const bodyParser = require('body-parser')
// const tnv = require('tracking-number-validation')
// app.use(bodyParser.json())
// app.use(express.static('public'))
// const host = req.get('host');
// console.log(host)
// app.use('/css', express.static(host + '/public/css'))
// app.use('/js', express.static(host + '/public/js'))
// app.use('/map', express.static(host + '/public/map'))
// require('dotenv').config()

// const TEST_TRACKING_NUMBER = "EZ4000000004"
// app.get('', (req,res) => {
//     res.sendFile(host + '/index.html')
// })

// const createTracker = (code,carrier,isTest) => {
//   console.log(process.env.TEST_API, process.env.PRODUCTION_API)
//   const apiKey = isTest ? process.env.TEST_API : process.env.PRODUCTION_API;
//   const easypostApi = new Easypost(apiKey)
//   return new easypostApi.Tracker({
//     tracking_code: code,
//     carrier: carrier,
//   });
// }

// app.post('/tracker', (req,res) => {
//   let { tracking_code } = req.body;
//   const tracker = createTracker(tracking_code, 'USPS')
//   if(tnv.isValid(tracking_code) || tracking_code == TEST_TRACKING_NUMBER) {
//     const tracker = createTracker(tracking_code, 'USPS', tracking_code == TEST_TRACKING_NUMBER)
//     tracker.save().then(response => {
//       res.send(response)
//   })
//   }
//   else  {
//     res.send("Error")
//   }
// })

// const fs = require('fs');
// const papa = require('papaparse');
// const file = fs.createReadStream('zip_lat_lon.csv');

// // Creates a hash map
// // Key is zipcode value is latlon pair
// var zipLatLonMap = new Map()

// // Parses the csv file of US zipcodes and corresponding latlongs 
// // and adds each pair to the hash map
// var fileParsed = false
// papa.parse(file, {
//     worker: true, 
//     step: function(res) {
//         zipLatLonMap.set(res.data[0],[parseFloat(res.data[1]),parseFloat(res.data[2])])
//     },
//     complete: function() {
//       fileParsed = true
//     }
// });


// app.post("/latLon",(req,res) => {
//   let { zipcodes } = req.body;
//   res.send(zipsToLatLon(zipcodes))
// })

// // Input array of zipcodes
// // return array of lat lon pairs
// function zipsToLatLon(zipcodes) {
//   if(!fileParsed) { return undefined  }
//   let latLongs = []
//   zipcodes.forEach(zip => {
//     let latLon = zipLatLonMap.get(zip)
//     if(latLon) latLongs.push(latLon)
//   });
//   return latLongs
// }

// app.listen(process.env.PORT, ()=> console.log(`Server is running at ${process.env.PORT}`))




