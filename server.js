const twilio = require('twilio');
const Hapi = require('Hapi');
const log = require('winston');
const http = require('superagent');

const numberToWords = require('number-to-words');

const PORT = process.env.PORT || 3000;
const HOST = process.env.PORT || '0.0.0.0';

const BTC_PRICE_URL = 'https://api.coinmarketcap.com/v1/ticker/Bitcoin/';

const accountSid = 'AC1bcf421271b84871a3ee9e3fec841043';
const authToken = 'your_auth_token';

const twilioClient = new twilio(accountSid, authToken);

async function getBitcoinPrice() {

  let response = await http.get(BTC_PRICE_URL);

  return parseFloat(response.body[0].price_usd);
} 


function buildResponse(bitcoinPrice) {

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(`The current cash price of bitcoin is
  ${numberToWords.toWords(bitcoinPrice)} dollars.`);

  twiml.say(`Free State Bitcoin Shoppe is located at 56 State Street in
Portsmouth, New Hampshire`);

  return twiml.toString();
} 

const server = new Hapi.Server()

server.connection({
  host: HOST,
  port: PORT
});

var BitcoinPrice = (function() {

  var price = 0;

  return {
    update: async function() {
      price = await getBitcoinPrice();
    },
    get: function() {
      return price;
    }
  }
})();

setInterval(BitcoinPrice.update, 1000*60);

BitcoinPrice.update();

server.route({
    method: 'post',
    path:'/calls', 
    handler: function (request, reply) {
        let bitcoinPrice = BitcoinPrice.get();

        let resp = buildResponse(bitcoinPrice);

        return reply(resp).type('xml');
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});

