const https = require('https');

module.export = {
  
    getLocationInformation: function () {
        return new Promise(((resolve, reject) => {
        
        console.log("Fetching Location...");
        
        var options = {
            host: 'ipinfo.io',
            path: '/?token=215eb6fcb08061', 
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
                console.log("Location Data: ", responseString);
                //resolve(JSON.parse(responseString));
            });
            res.on('error', (error) => {
                reject(error);
          });
    
        });
        req.end();
        
        }));
    }  
    
};