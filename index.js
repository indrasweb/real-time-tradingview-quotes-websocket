// Quotes from ES1! (continuous ES contract)

// IMPORTANT

// Quotes are delayed by up to 500ms. This is the fastest data provided by TradingView, 
// and is sufficient for our purposes. They do provide closer to real-time trade bars.
// The token returned by getAuth() expires after ~1 month; you should write a loop to re-login.
// The ws might disconnect. Should probably have an auto-reconnect function.


const axios = require('axios');
const  WebSocket = require('faye-websocket')  

const USERNAME = ''
const PASSWORD = ''


const  getRandomToken = (stringLength=12) => {
  characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const  charactersLength = characters.length;
  let  result = ''
  for ( var  i = 0; i < stringLength; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return  result
}


const  createMsg = (msg_name, paramsList) => {
  const  msg_str = JSON.stringify({ m:  msg_name, p:  paramsList })
  return  `~m~${msg_str.length}~m~${msg_str}`
}


const  sendMsg = (ws, msg_name, paramsList) => {
  const  msg = createMsg(msg_name, paramsList)
  console.log(`TX: ${msg}`)
  ws.send(createMsg(msg_name, paramsList))
}


const getAuth = async (username, password) => {
  const response = await axios({
    method: "POST",
    url: "https://www.tradingview.com/accounts/signin/",
    data: {'username': username, 'password': password, 'remember': 'on'},
    headers: {'Referer': 'https://www.tradingview.com', 
              "Content-Type": "multipart/form-data"},
  });
  return response.data.user.auth_token
}


const handleMessage = (ws, msg) => {
  if (msg.data.includes('~m~~h~')) {
    ws.send(msg.data);  // ping pong???
  }
  else {
    try {
      msg.data.split(/~m~[0-9]+~m~/).filter((p) => p !== '').forEach(processQuotes)
    } catch (error) {
      console.error('Unhandled message', msg.data, error)
    }
  }
}


const processQuotes = (data) => {
  parsed = JSON.parse(data)
  if (parsed.m == 'qsd'){
    if (parsed.p[1].v.bid != null) {
      quote = parsed.p[1].v
      console.log('ask', '/', 'bid', quote.bid, '/', quote.ask)
    }
  }
}


const streamQuotes = (auth_key) => {
  const  ws = new  WebSocket.Client(
    url='wss://data.tradingview.com/socket.io/websocket', 
    protocols=[], 
    options={headers: { 'Origin':  'https://data.tradingview.com' }}
  );

  ws.on('open', () => {

    const  quote_session = 'qs_' + getRandomToken()
    const  symbol = 'CME_MINI:ES1!'

    sendMsg(ws, "set_auth_token", [auth_key])
    sendMsg(ws, "quote_create_session", [quote_session])
    sendMsg(ws, "quote_set_fields", [quote_session,"current_session", "bid", "ask"])
    sendMsg(ws, "quote_add_symbols",[quote_session, symbol, {"flags":['force_permission']}])
  });

  ws.on('message', (msg) => { handleMessage(ws, msg) })
}


async function run() {
  const auth_key = await getAuth(USERNAME, PASSWORD);
  console.log(auth_key);
  streamQuotes(auth_key);
}


run()