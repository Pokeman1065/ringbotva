const axios = require('axios');

exports.handler = function(context, event, callback) {

    const twiml = new Twilio.twiml.MessagingResponse();
    const twiml2 = new Twilio.twiml.MessagingResponse();
    var userMessage = event.Body;
    var userNumber = event.From;
    

    const options = {
    method: 'POST',
    url: 'https://general-runtime.voiceflow.com/state/user/'+userNumber+'/interact',
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: 'VF.DM.6636b1ada410124919a761c9.LGrC8lurycZaOPcj'
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

        var responseData = response.data

        // Find the object where type is 'text'
        const textObject = responseData.find(item => item.type === 'text');

        // Extract the message
        if (textObject) {
        var message = textObject.payload.message;
        } else {
        console.log('No text object found in the response data.');
        }

        twiml.message(message);
        
    })
    .catch(function (error) {
        console.error(error);
    });


    callback(null, twiml);
};