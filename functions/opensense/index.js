const Alexa = require('ask-sdk');
const opensense = require('./opensense');
const helpers = require('./helpers');
//const location = require('./location');

const SKILL_NAME = 'OpenSense Network Skill';
const HELP_MESSAGE = '';
const HELP_REPROMPT = '';
const STOP_MESSAGE = '';

const skillBuilder = Alexa.SkillBuilders.standard();

const valuesHandler = { /* Handler for Intent with name 'value' */
  canHandle(handlerInput) {
    
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'values');
        
  },
  async handle(handlerInput) {
    let speechOutput = "";
    
    let requestedMeasurand = handlerInput.requestEnvelope.request.intent.slots.measurand.value;
    let requestedDate = handlerInput.requestEnvelope.request.intent.slots.date.value;
    
    let now = new Date();
    let minTimestamp = now.toISOString().split('.')[0]+".0Z";
    console.log(minTimestamp);
    
    if (requestedDate !== undefined){
      minTimestamp = new Date(requestedDate);
      minTimestamp = minTimestamp.toISOString().split('.')[0]+".0Z";
      console.log(minTimestamp);
    }
    
    let maxTimestamp = new Date(requestedDate);
    maxTimestamp.setDate(maxTimestamp.getDate() + 1);
    maxTimestamp = maxTimestamp.toISOString().split('.')[0]+".0Z";
    
    /*https://www.opensense.network/progprak/beta/api/v1.0/values?
    measurandId=1&maxSensors=1&refPoint=(49.1259%2C9.1428)&maxDistance=3000
    &minTimestamp=2019-01-20T00%3A00%3A00.0Z&maxTimestamp=2019-01-20T00%3A00%3A00.0Z*/

    let params = {
        measurandId: 1, 
        maxSensors: 10,
        refPoint: '(49.1259,9.1428)',
        maxDistance: 20000,
        minTimestamp: minTimestamp,
        maxTimestamp: maxTimestamp
    };
    
    if(opensense.getMeasurandId(requestedMeasurand) == -1){
        speechOutput = "Die angegebene Messgröße " + requestedMeasurand + " wird leider noch nicht unterstützt.";
        return handlerInput.responseBuilder.speak(speechOutput).getResponse();
    } else {
        params.measurandId = opensense.getMeasurandId(requestedMeasurand);
    }
    
    try {
        const values = await opensense.getValues(formatParams(params));
        const unit = await opensense.getUnit(opensense.getMeasurandId(requestedMeasurand));
        //const coords = await location.getLocationInformation();
        
        if(values === undefined || values === null || typeof values === "undefined"){
          speechOutput = "Da ist etwas schief gelaufen. Der Oupen Sens ey pi ai gefällt deine Anfrage nicht.";
        }else if(values == [] || values.length === 0){
          speechOutput = "Für die Messgröße " + requestedMeasurand + " konnte ich vom " + requestedDate + " leider keine Daten finden.";
        }
        else{
          let currentValue = values[0].values[0].numberValue.toFixed(2);
          console.log("First Value:", values[0].values[0].numberValue.toFixed(2));
          console.log("UNIT: ", unit);
                
          speechOutput = "Der Wert für die Messgröße " + requestedMeasurand + " vom " + requestedDate + " ist " + currentValue + " " + unit[0].name; + ".";
        }
      
    } catch (error) {
      
      speechOutput = 'Bei deiner Anfrage ist ein unbehandelter Fehler aufgetreten. Herzlichen Glückwunsch!';
      console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error.message}`);
      
    }
    
    return handlerInput.responseBuilder
        .speak(speechOutput)
        .getResponse(); 

  },
};

const explanationHandler = { /* Handler for Intent with name 'explanation' */
  canHandle(handlerInput) {
    
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'explanation');
        
  },
  async handle(handlerInput) {
    return handlerInput.responseBuilder
        .speak("Funktioniert. Open Sense ist eine Plattform, die Wetter- und Umweltdaten zur Verfügung stellt.")
        .getResponse(); 

  },
};

const availableMeasurandsHandler = { /* Handler for Intent with name 'available' */
  canHandle(handlerInput) {
    
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'available');
        
  },
  async handle(handlerInput) {
    let speechOutput = "";

    try {
        const measurands = await opensense.getAvailableMeasurands();
        speechOutput = "Im Umkreis von 5 Kilometern werden folgende Messwerte aktiv gemessen: " + measurands;
        console.log(speechOutput);
        
        
      
    } catch (error) {
      
      speechOutput = 'Bei deiner Anfrage ist ein unbehandelter Fehler aufgetreten. Herzlichen Glückwunsch!';
      console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error.message}`);
      
    }
    
    return handlerInput.responseBuilder
        .speak(speechOutput)
        .getResponse(); 

  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Es ist ein unbekannter Fehler aufgetreten.')
      .reprompt('Es ist ein unbekannter Fehler aufgetreten.')
      .getResponse();
  },
};

exports.handler = skillBuilder
  .addRequestHandlers(
    valuesHandler,
    explanationHandler,
    availableMeasurandsHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
  
  
  
/* Other NON-ALEXA Functions */

function formatParams (params){
    return "?" + Object
    .keys(params)
    .map(function(key){
        return key+"="+encodeURIComponent(params[key]);
    })
    .join("&");
}


