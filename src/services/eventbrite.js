const request = require('axios');
const EB_BASE_URL = 'https://www.eventbriteapi.com/v3';
const OAUTH_TOKEN = 'PUTYOURKEYHERE';

class Eventbrite {

    static async me() {
        try {
            const res = await request.get(
                `${EB_BASE_URL}/users/me/?token=${OAUTH_TOKEN}&expand=events`
            );
            return Object.assign({OAUTH_TOKEN}, res.data);
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    static async getOrder(orderId) {
        try {
            const url = `${EB_BASE_URL}/orders/${orderId}/?token=${OAUTH_TOKEN}&expand=attendees`;
            const res = await request.get(url);

            return res.data;
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    static async getEvent(eventID) {
        try {
            const url = `${EB_BASE_URL}/events/${eventID}/?token=${OAUTH_TOKEN}`;

            const res = await request.get(url);

            return res.data;
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    static async getBarcodes(eventID) {
      try {
          const url = `${EB_BASE_URL}/events/${eventID}/barcodes/?token=${OAUTH_TOKEN}`;

          const res = await request.get(url);

          return res.data;
      } catch (e) {
          console.error(e);
      }
      return null;
    }

    static async disableBarcode (eventID, barcoe, uidCard) {
      try {
          // const url = `${EB_BASE_URL}/events/${eventID}/attendee_sync/?token=${OAUTH_TOKEN}`;
          // // const rawBody = {
          // // "attendees": [{
          // //     "id": "253159671104",
          // //     "barcode": {
          // //         "status": "used",
          // //         "date_modified": "2018-08-26T23:56:23Z",
          // //         "checkin_method": "search",
          // //         "barcode": "8110563261010274493001",
          // //     }
          // // }];
          //
          // const extraData = {
          //   headers : {
          //
          //   }
          // }
          // const res = await request.post(url, JSON.stringify (rawBody), extraData);
          return ("POK");
          return res.data;
      } catch (e) {
          console.error(e);
      }
      return null;
    }
}

module.exports = Eventbrite;
