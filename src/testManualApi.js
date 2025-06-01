const crypto = require('crypto');

// Nejprve získáme čas serveru a pak použijeme tento čas pro náš požadavek
async function testApi() {
  try {
    // Dynamický import node-fetch (použijeme fetch z globálního rozsahu pokud je k dispozici)
    const fetch = globalThis.fetch || require('node-fetch');

    // Získání času serveru
    console.log('Získávám čas serveru Binance...');
    const timeResponse = await fetch('https://api.binance.com/api/v3/time');
    const timeData = await timeResponse.json();
    const serverTime = timeData.serverTime;
    
    console.log(`Čas serveru: ${serverTime}`);
    console.log(`Místní čas: ${Date.now()}`);
    console.log(`Rozdíl: ${Date.now() - serverTime}ms`);

    // API klíče
    const apiKey = "5xzuPXlskUK1oc30RM70sDfaiv78mWJlTbpgzvzBNntQebhK8r3wJewIw2Q62AEj";
    const apiSecret = "nTxixkCW5Xr283TQTLy9FWujGILy4hY2C7Dq62nKredpLVv9q8VEPDw4PleDiqQx";

    // Použít čas serveru místo místního času
    const queryString = `timestamp=${serverTime}&recvWindow=60000`;

    // Vytvoření podpisu
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');

    // URL s parametry a podpisem
    const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`;

    console.log(`Volám API: ${url.replace(signature, '***')}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Chyba API: ${response.status} ${response.statusText}`);
      console.error(`Detail: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log('API odpověď OK:');
    console.log(`Počet aktiv: ${data.balances?.length}`);
    console.log('První 3 aktiva:');
    if (data.balances) {
      data.balances.slice(0, 3).forEach(b => {
        console.log(`${b.asset}: ${b.free} (volné), ${b.locked} (zamčeno)`);
      });
    }
  } catch (error) {
    console.error('Chyba při volání API:', error);
  }
}

testApi();