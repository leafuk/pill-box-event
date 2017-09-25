/*
* The following JSON template shows what is sent as the payload:
{
   "serialNumber": "GXXXXXXXXXXXXXXXXX",
   "batteryVoltage": "xxmV",
   "clickType": "SINGLE" | "DOUBLE" | "LONG"
}
*
* A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
* "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
*
* For more documentation, follow the link below.
* http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
*/

'use strict';
require('dotenv').config();

const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const moment = require('moment-timezone');

var MongoClient = require('mongodb').MongoClient
, assert = require('assert');

// Connection URL
var url = process.env.DB_CONNECTION;

exports.handler = (event, context, callback) => {

  // Use connect method to connect to the Server
  MongoClient.connect(url, function(err, db) {

  assert.equal(null, err);
  console.log("Connected correctly to server");

    db.collection('inserts').insertOne({timestamp: new Date(), event: event}, function(err, r) {
      
      assert.equal(null, err);
      assert.equal(1, r.insertedCount);
   
      console.log("Inserted event");
  
      db.close();

      const payload = JSON.stringify(event);
      
      const DATETIME = moment().tz("Europe/London").format('MMMM Do YYYY, h:mm:ss a');

      var params = {
        Message: `Brenda has taken her tablets on ${DATETIME}.`,
        TopicArn: process.env.SNS_TOPIC_ARN
      };

      console.log("Publishing SNS");      
      
      SNS.publish(params, context.done);

    });
  });
}