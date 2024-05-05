const axios = require('axios');
const twilio = require('twilio');

exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();
  const client = twilio(context.ACCOUNT_SID, context.AUTH_TOKEN);


  var userMessage = event.Body;
  var userNumber = event.From;
    

    const options = {
    method: 'POST',
    url: 'https://general-runtime.voiceflow.com/state/user/'+userNumber+'/interact',
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: context.VOICEFLOW_API_TOKEN
    },
    data: {
        action: {type: 'text', payload: userMessage},
        config: {
        tts: false,
        stripSSML: true,
        stopAll: true,
        excludeTypes: ['block', 'debug', 'flow']
        }
    }
    };

    axios
    .request(options)
    .then(function (response) {
      var responseData = response.data;

      // Find the object where type is 'text'
      const textObject = responseData.find(item => item.type === 'text');

      // Extract the message
      if (textObject) {
        var message = textObject.payload.message;

        var isOrder = false;

        // Check if the message is "Hey I need to call you right now"
        if (message.includes("right now")) {
          // Make outbound call
          client.calls.create({
            url: 'https://ringbotva-1918-dev.twil.io/transcribeHelp',
            to: userNumber,
            from: '+12267903460'
          }).then(call => {
            console.log('Call initiated: ' + call.sid);
          }).catch(error => {
            console.error('Error making call:', error);
          });
        } else if (message.includes("HERE IS ORDER:")) {


          // Remove "HERE IS ORDER:" from the string
          const jsonString = message.slice(message.indexOf("{"));

          // Parse the remaining string into a JSON object
          const order = JSON.parse(jsonString);

          // Extract the address field
          const phoneNumber = order.telephone_number;
          const orderItems = order.order_items.map(item => item.split(' ').join('_'));
          const address = order.address.split(' ').join('_');
          var urlString = 'https://ringbotva-1918-dev.twil.io/transcribePizza?phoneNumber='+userNumber+'&orderItems='+orderItems+'&address='+address
      
          // Make outbound call
          client.calls.create({
            url: urlString,
            to: phoneNumber,
            from: '+12267903460'
          }).then(call => {
            console.log('Call initiated: ' + call.sid);
          }).catch(error => {
            console.error('Error making call:', error);
          });
          message = urlString;
          
        }

        if (!isOrder) {
          // Send message
          twiml.message(message); 
        }
        
        
        
      } else {
        console.log('No text object found in the response data.');
      }

      callback(null, twiml); // Move callback inside axios request's `.then()` block
    })
    .catch(function (error) {
      console.error(error);
      callback(error); // Pass error to callback
    });

};
