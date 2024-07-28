/**
 * Calculate the distance, travel time, and additional trip details using the Michelin API.
 * The expected result will be an array that fills cells horizontally across different columns.
 *
 * =GOOGLEMAPS_MICHELIN_INFO("Lisbon, PT"; "Seville, ES"; 1.75; "45003")
 *
 * @param {String} origin The address of the starting point.
 * @param {String} destination The address of the destination.
 * @param {Number} energyCost The energy cost per unit, default: 1.75.
 * @param {String} carId The car identification, default: 45003 - Peugeot 2008 II 1.2 PureTech 100cv.
 * @return {Array} Distance, Duration, Fuel Cost, Toll Cost, Total Cost, Carbon Emission, each in a separate column.
 * @customFunction
 */
const GOOGLEMAPS_MICHELIN_INFO = (origin, destination, energyCost = 1.75, carId = '45003') => {
    const getCoordinates = (address) => {
      const response = Maps.newGeocoder().geocode(address);
      if (response.status === 'OK') {
        const location = response.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      } else {
        throw new Error('Unable to geocode address: ' + address);
      }
    };
  
    const originCoords = getCoordinates(origin);
    const destinationCoords = getCoordinates(destination);
  
    const michelinQuery = `
      query SearchItinerary($input: SearchItineraryInput!) {
        searchItinerary(input: $input) {
          ... on SearchItinerarySuccessResult {
            routes {
              summary
              routeDistance {
                value
                unit
              }
              duration
              costs {
                fuel {
                  amount
                  currency
                }
                tolls {
                  amount
                  currency
                }
                electricity {
                  amount
                  currency
                }
              }
              totalCost {
                amount
                currency
              }
              carbonDioxideEmission
            }
          }
        }
      }
    `;
  
    const michelinVariables = {
      input: {
        coordinates: [
          { lng: originCoords.lng, lat: originCoords.lat },
          { lng: destinationCoords.lng, lat: destinationCoords.lat }
        ],
        departureName: origin,
        arrivalName: destination,
        mode: "CAR",
        device: "DESKTOP",
        distanceSystem: "METRIC",
        energyCost: energyCost,
        currency: "eur",
        traffic: "NONE",
        carId: carId
      }
    };
  
    const michelinResponse = UrlFetchApp.fetch('https://bff.viamichelin.com/graphql', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        query: michelinQuery,
        variables: michelinVariables,
      }),
      headers: {
        'accept': 'application/graphql+json, application/json',
        'content-type': 'application/json',
        'language': 'en-US',
        'origin': 'https://www.viamichelin.com',
      },
    });
  
    const michelinData = JSON.parse(michelinResponse.getContentText());
    const routes = michelinData.data.searchItinerary.routes;
  
    // Find the fastest route
    const selectedRoute = routes.reduce((fastest, route) => {
      return route.duration < fastest.duration ? route : fastest;
    }, routes[0]);
  
    const distance = `${selectedRoute.routeDistance.value} ${selectedRoute.routeDistance.unit.toLowerCase()}`;
    const duration = `${Math.floor(selectedRoute.duration / 3600000)} hrs ${Math.floor((selectedRoute.duration % 3600000) / 60000)} mins`;
    
    const fuelCost = selectedRoute.costs.fuel ? `${selectedRoute.costs.fuel.amount} ${selectedRoute.costs.fuel.currency}` : "N/A";
    const tollCost = selectedRoute.costs.tolls ? `${selectedRoute.costs.tolls.amount} ${selectedRoute.costs.tolls.currency}` : "N/A";
    const totalCost = `${selectedRoute.totalCost.amount} ${selectedRoute.totalCost.currency}`;
    
    const carbonEmission = `${selectedRoute.carbonDioxideEmission} g/km`;
  
    return [
      [distance, duration, fuelCost, tollCost, totalCost, carbonEmission]
    ];
  };