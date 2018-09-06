import zmq from 'zeromq';
import {matrix_io} from 'matrix-protos';

class Everloop {

  constructor () {
    this.interval = null;
    this.matrix_ip = '127.0.0.1';// Local IP
    this.matrix_everloop_base_port = 20021// Port for Everloop driver
    this.matrix_device_leds = 0;// Holds amount of LEDs on MATRIX device

    this.updateSocket = null;
    this.pingSocket = null;
    this.configSocket = null;

    // ERROR PORT \\
    this.errorSocket = zmq.socket('sub');// Create a Subscriber socket
    this.errorSocket.connect('tcp://' + this.matrix_ip + ':' + (this.matrix_everloop_base_port + 2));// Connect Subscriber to Error port
    this.errorSocket.subscribe('');// Subscribe to messages
    // On Message
    this.errorSocket.on('message', (error_message) => {
        console.log('Error received: ' + error_message.toString('utf8'));// Log error
    });

    // DATA UPDATE PORT \\
    this.updateSocket = zmq.socket('sub');// Create a Subscriber socket
    this.updateSocket.connect('tcp://' + this.matrix_ip + ':' + (this.matrix_everloop_base_port + 3));// Connect Subscriber to Data Update port
    this.updateSocket.subscribe('');// Subscribe to messages
    // On Message
    this.updateSocket.on('message', (buffer) => {
        var data = matrix_io.malos.v1.io.EverloopImage.decode(buffer);// Extract message
        if (this.matrix_device_leds == 0 && data.everloopLength > 0) {
          this.matrix_device_leds = data.everloopLength;// Save MATRIX device LED count
          this.shutDown();
        }
    });

    // KEEP-ALIVE PORT \\
    this.pingSocket = zmq.socket('push');// Create a Pusher socket
    this.pingSocket.connect('tcp://' + this.matrix_ip + ':' + (this.matrix_everloop_base_port + 1));// Connect Pusher to Keep-alive port
    this.pingSocket.send('');// Send a single ping

    // BASE PORT \\
    this.configSocket = zmq.socket('push');// Create a Pusher socket
    this.configSocket.connect('tcp://' + this.matrix_ip + ':' + this.matrix_everloop_base_port);// Connect Pusher to Base port

  }


  shutDown () {

    var image = matrix_io.malos.v1.io.EverloopImage.create();
    for (var i = 0; i < this.matrix_device_leds; ++i) {
            // Set individual LED value
            image.led[i] = {
                red: 0,
                green:0,
                blue: 0,
                white: 0
            };
    }

    // Store the Everloop image in MATRIX configuration
    var config = matrix_io.malos.v1.driver.DriverConfig.create({
        'image': image
    });

    // Send MATRIX configuration to MATRIX device
    if(this.matrix_device_leds > 0)
        this.configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(config).finish());

  }

  _clearInterval () {
    this.shutDown();
    if (this.interval)
      clearInterval (this.interval);
  }

  setColor (opts) {
      this._clearInterval();
      const _this = this;
      this.interval = setInterval(function () {
        var image = matrix_io.malos.v1.io.EverloopImage.create();
        for (var i = 0; i < _this.matrix_device_leds; ++i) {
                // Set individual LED value
                const defaultOpts = {
                  green : opts.green ? opts.green : 0,
                  red: opts.red ? opts.red : 0,
                  blue: opts.blue ? opts.blue : 0,
                  white: opts.white ? opts.white : 0
                };

                image.led[i] = defaultOpts;
        }

        var config = matrix_io.malos.v1.driver.DriverConfig.create({
            'image': image
        });

        // Send MATRIX configuration to MATRIX device
        if(_this.matrix_device_leds > 0){
            _this.configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(config).finish());
        }
      },500);
  }

  checkingColor (opts) {
      this._clearInterval();
      const pattern = [0.02,0.03,0.04,0.045,0.055,0.075,0.085,0.095,0.1,0.0128,0.192,0.256,0.512,0.712,0.820,0.920,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const _this = this;
      let steps = 0;
      this.interval = setInterval(function () {

        var image = matrix_io.malos.v1.io.EverloopImage.create();
        for (var i = 0; i < _this.matrix_device_leds; ++i) {
                const index = pattern.length - ((i + steps) % pattern.length);
                // Set individual LED value
                const defaultOpts = {
                  green : opts.green ? parseInt(pattern[index] * opts.green) : 0,
                  red: opts.red ? parseInt(pattern[index] * opts.red) : 0,
                  blue: opts.blue ? parseInt(pattern[index] * opts.blue) : 0,
                  white: opts.white ? parseInt(pattern[index] * opts.white) : 0
                };

                image.led[i] = defaultOpts;
        }

        // Store the Everloop image in MATRIX configuration
        var config = matrix_io.malos.v1.driver.DriverConfig.create({
            'image': image
        });

        // Send MATRIX configuration to MATRIX device
        if(_this.matrix_device_leds > 0){
            _this.configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(config).finish());
        }
        steps = steps <= pattern.length ? steps + 1 : 0;
      },20);

  }

  flashingColor (opts) {

    this._clearInterval();

    const easyCurveValue =  [0,0.1,0.2,0.4,0.6,0.8,1,0.8,0.6,0.4,0.2,0.1];
    const _this = this;
    let steps = 12;

    this.interval = setInterval(function () {

      const defaultOpts = {
        green : opts.green ? parseInt(easyCurveValue[steps] * opts.green) : 0,
        red: opts.red ? parseInt(easyCurveValue[steps] * opts.red) : 0,
        blue: opts.blue ? parseInt(easyCurveValue[steps] * opts.blue) : 0,
        white: opts.white ? parseInt(easyCurveValue[steps] * opts.white) : 0
      };
      var image = matrix_io.malos.v1.io.EverloopImage.create();
      for (var i = 0; i < _this.matrix_device_leds; ++i) {
              // Set individual LED value
              image.led[i] = defaultOpts;
      }

      // Store the Everloop image in MATRIX configuration
      var config = matrix_io.malos.v1.driver.DriverConfig.create({
          'image': image
      });

      // Send MATRIX configuration to MATRIX device
      if(_this.matrix_device_leds > 0){
          _this.configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(config).finish());
          steps = steps > 0 ? steps-1 : 12
      }

    }, 100);

  }

  blinkColor (opts) {

    this._clearInterval();


    const _this = this;
    let isBlink = true;
    let repeat = opts.repeat || false;
    let times = 0;
    this.interval = setInterval(function () {

      const defaultOpts = {
        green : opts.green && isBlink ?  opts.green : 0,
        red: opts.red && isBlink ? opts.red : 0,
        blue: opts.blue && isBlink ? opts.blue : 0,
        white: opts.white && isBlink ? opts.white : 0
      };

      var image = matrix_io.malos.v1.io.EverloopImage.create();
      for (var i = 0; i < _this.matrix_device_leds; ++i) {
              // Set individual LED value
              image.led[i] = defaultOpts;
      }

      // Store the Everloop image in MATRIX configuration
      var config = matrix_io.malos.v1.driver.DriverConfig.create({
          'image': image
      });

      // Send MATRIX configuration to MATRIX device
      if(_this.matrix_device_leds > 0){
          _this.configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(config).finish());
          isBlink = !isBlink;
          if (!isBlink)
            times ++;
          if (times >= repeat && isBlink)
            _this._clearInterval();
      }

    }, 300);

  }

}

export default Everloop;
