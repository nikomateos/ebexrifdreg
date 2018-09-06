import Everloop from './src/Everloop';
import QRScanner from './src/QRScanner';
const readline = require('readline');
const EB = require ('./src/services/eventbrite');
const { NFC } = require('nfc-pcsc');

/*** FAKE VARS ***/
const _ID_EVENT = 49276204454;

/** VARS ***/
let qrCode = false;
let usingNFC = false;
const videoDevice = '/dev/video0';

const everloop = new Everloop();
const nfc = new NFC();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const qrScanner = new QRScanner (videoDevice,(error, qrCode)=>{

  if (error) {
    console.log ({error});
    onError();
  } else {
    onQRCode(qrCode);
  }
});

const init = () => {

  qrCode = false;
  usingNFC = false;
  everloop.setColor({
    white: 100
  });
}

const onQRCode = async(readedQRCode) => {
  if (!usingNFC) {
    everloop.checkingColor({
      blue: 255
    });
    let qrResult = await getQRInfo (readedQRCode);

    everloop.blinkColor({
      red: !qrResult ? 255 : 0,
      green: qrResult ? 255 : 0,
      repeat: !qrResult ? 5 : 2
    });

    const timeInterval = qrResult ? 1500 : 3000;
    setTimeout (()=>{
      if (qrResult){
        qrCode = readedQRCode;
        everloop.flashingColor({
          blue: 200
        })
      } else {
        init();
      }
    }, timeInterval);
  }

};

const onError = () => {
  everloop.blinkColor({
    red: 255,
    repeat: 5
  });
  setTimeout (init,1500);
}

const getQRInfo = async(qrcode) => {
  const barcodes = await EB.getBarcodes(_ID_EVENT);
  const exists = barcodes.barcodes.find( (barcode) => {
    return barcode.barcode == qrcode;
  });
  return exists;
}

nfc.on('reader', async reader => {
  reader.on('card', async card => {
      if (qrCode && !usingNFC) {
        usingNFC = true;
        console.log ("RFID", card.uid);
        everloop.checkingColor({
          blue: 125,
          red: 125,
        })
        await EB.disableBarcode (_ID_EVENT, qrCode, card.uid);
        everloop.checkingColor({
          green: 255,
        })
        setTimeout (()=>init(),3000);
      }
  });
});

init();
