# GOOGLEMAPS_MICHELIN_INFO

This repository contains a custom function for calculating the distance, travel time, and additional trip details using the Michelin API and Google Maps Geocoding API. The expected result fills cells horizontally across different columns in a spreadsheet.

## Function Overview

`GOOGLEMAPS_MICHELIN_INFO(origin, destination, energyCost, carId)`

### Parameters

- **origin**: The address of the starting point (String).
- **destination**: The address of the destination (String).
- **energyCost**: The energy cost per unit, default: 1.75 (Number).
- **carId**: The car identification, default: 45003 - Peugeot 2008 II 1.2 PureTech 100cv (String).

### Returns

An array containing the following details, each in a separate column:
- Distance
- Duration
- Fuel Cost
- Toll Cost
- Total Cost
- Carbon Emission

## Example Usage

```javascript
=GOOGLEMAPS_MICHELIN_INFO("Lisbon, PT"; "Seville, ES"; 1.75; "45003")
=GOOGLEMAPS_MICHELIN_INFO("Lisbon, PT"; "Seville, ES")
