import Zbar from 'zbar';

class QRScanner {
  constructor (dev,listener) {
    this.zbar = new Zbar(dev);
    this.zbar.stdout.on('data', async function(buf) {
      listener (null, buf.toString());
    });

    this.zbar.stderr.on('data',function(buf) {
        listener(buf.toString(), null);
    });
  }
}

export default QRScanner;
