const https = require('https');

module.exports = {
    
    getMeasurandId: function (measurand){ /* Komische Schreibweise */
      if(measurand.toLowerCase() == "temperatur"){
        return 1;
      }
      if(measurand.toLowerCase() == "lärm" || measurand.toLowerCase() == "lautstärke" || measurand.toLowerCase() == "lärmverschmutzung"){
        return 2;
      }
      if(measurand.toLowerCase() == "luftfeuchtigkeit" || measurand.toLowerCase() == "luftfeuchte"){
        return 3;
      }
      if(measurand.toLowerCase() == "helligkeit" || measurand.toLowerCase() == "licht"){
        return 4;
      }
      if(measurand.toLowerCase() == "luftdruck" || measurand.toLowerCase() == "druck"){
        return 5;
      }
      if(measurand.toLowerCase() == "windgeschwindigkeit" || measurand.toLowerCase() == "wind geschwindigkeit"){
        return 6;
      }
      if(measurand.toLowerCase() == "windrichtung" || measurand.toLowerCase() == "wind richtung"){
        return 7;
      }
      if(measurand.toLowerCase() == "niederschlagsmenge" || measurand.toLowerCase() == "niederschlag"){
        return 8;
      }
      if(measurand.toLowerCase() == "niederschlagstyp" || measurand.toLowerCase() == "niederschlagsart"){
        return 9;
      }
      if(measurand.toLowerCase() == "bewölkung" || measurand.toLowerCase() == "wolken"){
        return 10;
      }
      if(measurand.toLowerCase() == "pm10"){
        return 11;
      }
      if(measurand.toLowerCase() == "pm2_5"){
        return 12;
      }
      if(measurand.toLowerCase() == "Sonnenstrahlung"){
        return 13;
      }
      
      return -1;
    }, /* Komma nicht vergessen ! */
    
    getUnit: function (measurandId){
      return new Promise(((resolve, reject) => {
        
      console.log("Sent Query: ", '/progprak/beta/api/v1.0/units?measurandId=' + measurandId);
        
      var options = {
          host: 'opensense.network',
          path: '/progprak/beta/api/v1.0/units?measurandId=' + measurandId, 
          method: 'GET',
      };
    
      var req = https.request(options, res => {
          res.setEncoding('utf8');
          var responseString = "";
            
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`${res.statusCode}: ${res.req.getHeader('host')} ${res.req.path}`));
          }
            
          res.on('data', chunk => {
              responseString = responseString + chunk;
          });
          res.on('end', () => {
              resolve(JSON.parse(responseString));
          });
          res.on('error', (error) => {
              reject(error);
        });
      });
        req.end();
      }));
    },
    
    getValues: function (query) {
        return new Promise(((resolve, reject) => {
        
        console.log("Sent Query: ", query);
        
        var options = {
            host: 'opensense.network',
            path: '/progprak/beta/api/v1.0/values' + query, 
            method: 'GET',
        };
    
        var req = https.request(options, res => {
            res.setEncoding('utf8');
            var responseString = "";
            
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error(`${res.statusCode}: ${res.req.getHeader('host')} ${res.req.path}`));
            }
            
            res.on('data', chunk => {
                responseString = responseString + chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(responseString));
            });
            res.on('error', (error) => {
                reject(error);
          });
    
        });
        req.end();
        
        }));
    },
    
    getSensors: function (query) {
        return new Promise(((resolve, reject) => {
        
        console.log("Sent Query: ", query);
        
        var options = {
            host: 'opensense.network',
            path: '/progprak/beta/api/v1.0/sensors' + query, 
            method: 'GET',
        };
    
        var req = https.request(options, res => {
            res.setEncoding('utf8');
            var responseString = "";
            
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error(`${res.statusCode}: ${res.req.getHeader('host')} ${res.req.path}`));
            }
            
            res.on('data', chunk => {
                responseString = responseString + chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(responseString));
            });
            res.on('error', (error) => {
                reject(error);
          });
    
        });
        req.end();
        
        }));
    },
    
    getAvailableMeasurands: async function () {
        
        let measurands = [];
        
        /* One week interval -> only active sensors */
        
        let minTimestamp = new Date();
        minTimestamp.setDate(minTimestamp.getDate() - 7);
        minTimestamp = minTimestamp.toISOString().split('.')[0]+".0Z";

        let maxTimestamp = new Date();
        maxTimestamp = maxTimestamp.toISOString().split('.')[0]+".0Z";
        
        let params = {
            maxSensors: 50,
            refPoint: '(49.1259,9.1428)',
            maxDistance: 5000,
            minTimestamp: minTimestamp,
            maxTimestamp: maxTimestamp
        };
        
        try {
            let sensors = await getSensors(formatParams(params));
            
            for(let i = 0; i < sensors.length; i++){
                let measurand = getMeasurandName(sensors[i].measurandId);
                //measurands.indexOf(measurand) === -1 ? measurands.push(measurand) : console.log("exists");
                measurands.indexOf(measurand) === -1 ? measurands.push(measurand) : 0;
            }
            
            return measurands;
            
        }
        catch (error) {
            console.log("Error while gettingAvailableMeasurands");
		}
        
    }
    
}; /* End of Exports */

function formatParams (params){
    return "?" + Object
    .keys(params)
    .map(function(key){
        return key+"="+encodeURIComponent(params[key]);
    })
    .join("&");
}

function getSensors (query) {
    return new Promise(((resolve, reject) => {
        
        console.log("Sent Query: ", query);
        
        var options = {
            host: 'opensense.network',
            path: '/progprak/beta/api/v1.0/sensors' + query, 
            method: 'GET',
        };
    
        var req = https.request(options, res => {
            res.setEncoding('utf8');
            var responseString = "";
            
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error(`${res.statusCode}: ${res.req.getHeader('host')} ${res.req.path}`));
            }
            
            res.on('data', chunk => {
                responseString = responseString + chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(responseString));
            });
            res.on('error', (error) => {
                reject(error);
          });
    
        });
        req.end();
        
    }));
}

function getMeasurandName (id) {
    
    if(id == 1){
        return "Temperatur";
    }
    if(id == 2){
        return "Lautstärke";
    }
    if(id == 3){
        return "Luftfeuchtigkeit";
    }
    if(id == 4){
        return "Helligkeit";
    }
    if(id == 5){
        return "Luftdruck";
    }
    if(id == 6){
        return "Windgeschwindigkeit";
    }
    if(id == 7){
        return "Windrichtung";
    }
    if(id == 8){
        return "Bewölkung";
    }
    if(id == 9){
        return "Niederschlagsmenge";
    }
    if(id == 10){
        return "Niederschlagsart";
    }
    if(id == 11){
        return "PM 10 ";
    }
    if(id == 12){
        return "PM 2 5 ";
    }
    if(id == 13){
        return "Sonnenstrahlung";
    }
    if(id == 14){
        return "CO";
    }
    if(id == 15){
        return "NO2";
    }
    if(id == 16){
        return "O3";
    }
    if(id == 17){
        return "SO2";
    }
    
    return "";
    
}