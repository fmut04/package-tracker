import axios from 'https://cdn.skypack.dev/axios';

   
    Window.map = L.map('map', {
      zoomSnap: .1
    })
    const map = Window.map;
    main()
   async function main() {
    createMap()
    getTrackingInfo()
    }
   
    async function getTrackingInfo() {
      const searchBar = document.getElementById("search-bar")
      let isSearching = false;
      searchBar.onkeydown = async function({key}) {
         if(isSearching) return;
         if (key === "Enter") {
          isSearching = true;
          const code = validateSearch(searchBar.value)
          getTrackerData(code).then((res) => {
            const tracker = res.data;
            if(tracker!="Error")  updateMap(tracker,searchBar);
            else displayError(searchBar)
            isSearching=false;
          })
      }}
    }

    function displayError(searchBar) {
      searchBar.value = "Error, Try Again."
    }

    function updateMap(tracker,searchBar) {
        const button = document.getElementById('map-button')
        displayInfo(searchBar,button,tracker)
        updateTrackingDetails(tracker)
        searchBar.onkeydown = null
    }

    function displayInfo(searchBar,button,tracker)
    {
      const tds = tracker.tracking_details
      displayButton(button,tds)
      displayTrackingMessage(tds[tds.length-1])
      removeSearchBar(searchBar)
    }

    // View Tracking history button
    function displayButton(button,tds) {
      button.classList.remove('hidden')
      button.onclick = () => {
        displayTrackingHistory(tds)
      }
    }

    function displayTrackingMessage(currentStatus) { 
      document.getElementById('tracking-status').innerHTML = `Package Status: ${currentStatus.message}`;
      if (currentStatus.status.toLowerCase() == 'delivered') {
        document.getElementById('deliver-date').innerHTML = `${formatDateTime(currentStatus.datetime)}`
      }
    }


    let isModalCreated = false 
    function displayTrackingHistory(tds) {
      //Unhide modal
      const popupWrapper = document.getElementById('popup-wrapper')
      popupWrapper.removeAttribute('class','hidden')
      document.getElementById('main').setAttribute('class', 'blur')
      //If modal is already fully created, dont recreate it
      if(isModalCreated) return
      createModal(popupWrapper,tds)
    }

    function createModal(popupWrapper,tds) {
      const msgWrapper = document.getElementById('msg-wrapper')
      handleModalClose(popupWrapper)
      let isTop = true;
      for (let i = tds.length-1; i >= 0; i--) {
        createRow(tds[i],msgWrapper,isTop)
        isTop=false
      }
      isModalCreated = true;
    }

    function handleModalClose(popupWrapper)
    {
      console.log('test')
      const xIcon = document.getElementById('x-icon')
      xIcon.onclick = () => {
        popupWrapper.setAttribute('class', 'hidden')
        document.getElementById('main').removeAttribute('class', 'blur')
      }
    }

    function createRow(td,msgWrapper,isTop) {
      var row = createDiv(msgWrapper,'pop-row')
      if(isTop) {createDiv(row,'status-icon green') }
      else  { createDiv(row,'status-icon') }
      var textWrapper = createDiv(row,'pop-text-wrapper')
      createDiv(textWrapper, 'pop-text').innerHTML = td.message
      var location = td.tracking_location
      if(location.zip) {
       createDiv(textWrapper, 'pop-text small-text').innerHTML = `${location.city}, ${location.state}, ${location.zip}`
      }
      var dateTime = formatDateTime(td.datetime)
      createDiv(textWrapper, 'pop-text right small-text').innerHTML = dateTime
    }

    function formatDateTime(dateTime) {
      var d = new Date(dateTime)
      return d.toLocaleString('en-US', { month:'short',day:'numeric',hour:'numeric' , minute:'numeric' });
    }

    


    function createDiv(parent,className) {
      var div = document.createElement('div')
      div.setAttribute('class', `${className}`)
      parent.appendChild(div)
      return div
    }

    function removeSearchBar(searchBar)
    {
      searchBar.remove()
    }

    function validateSearch(search) {
      if(search.toLowerCase() == "test") { 
        //Test tracker value
        search = 'EZ4000000004'
      }
      return search
    }

     async function getTrackerData(input) {
      return new Promise((resolve) => {
        const data = {tracking_code: input}
        const res = axios.post("/tracker", data)
        setTimeout(() => resolve(res),2000)
      });
     }

    function createMap() {
      const geojsonLayer = new L.GeoJSON.AJAX("/map.geojson"); 
      geojsonLayer.addTo(map);
      setMapView(map)
    }


    //Fits map to div
    function setMapView(map) {
      const southEast = L.latLng(24,-67),
      northWest = L.latLng(50,-125),
      bounds = L.latLngBounds(southEast, northWest); 
      setTimeout(function(){map.invalidateSize(),
        map.fitBounds(bounds, {paddingTopLeft: [0,150]})
      }, 1);
      map.on('resize', () => {
        map.fitBounds(bounds, {paddingTopLeft: [0,150]})
      })
    }

   async function updateTrackingDetails(tracker) {
    const tracking_details = tracker.tracking_details;
    let zipcodes = []
    getZipcodes(tracking_details, zipcodes)
    const latLngs = await zipcodesToLatLngs(zipcodes)
    handleMapAnimation(latLngs.data,tracking_details)
    }


    const getZipcodes = (trackingDetails, zipcodes) => {
      trackingDetails.forEach(element => {
         let zip = element.tracking_location.zip;
         if(zip && !zipcodes.includes(zip)) zipcodes.push(zip)
      });
    }


   //EZ4000000004


   function handleMapAnimation(latLngs,trackingDetails) {
    const route = getRoute(latLngs,trackingDetails)
     route.addTo(map).snakeIn();
  }

  function createMarker(latLng,shouldAddToMap) {
    const marker = L.marker(latLng)
    marker.on('click', (res) => handleMarkerClick(res))
    if(shouldAddToMap) { marker.addTo(map) }
    return marker
  }

  function handleMarkerClick(marker) {
    console.log(marker.sourceTarget.td)
  }

  //td is short for Tracking Details
  function getRoute(latLngs,td) {
    if(latLngs.length == 0) return false
    if(latLngs.length == 1) {
      createMarker(latLngs[0],true)
      return false
     }

    let route = L.layerGroup([],{snakingPause:200}) 
    // Tracking details index
    var tdIndex = 1
    for (let i = 0; i < latLngs.length; i++) {
      var marker = createMarker(latLngs[i])
       var [message,tdIndex] = getMarkerTrackingDetails(td,tdIndex)
       marker.td = message;
      route.addLayer(marker)
      if(i<latLngs.length-1) {
      route.addLayer(L.polyline([latLngs[i],latLngs[i+1]],{color:'white'}))
    }
  }
    return route
  }
  //td is short for Tracking Details
  function getMarkerTrackingDetails(td,tdIndex) {
    let zip = td[tdIndex].tracking_location.zip;
    let details = [];
    let end = false;
    while (!end && zip == td[tdIndex].tracking_location.zip) {
      details.push(td[tdIndex].message)
      tdIndex++
      if(tdIndex == td.length ) { end = true }
    }
    return [details,tdIndex]
  }

  async function zipcodesToLatLngs(zipcodes) {
    return new Promise(async (resolve) => {
      const data = {zipcodes: zipcodes}
      const res = axios.post('/latLon', data)
      resolve(res)
    })
  }
