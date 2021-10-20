const configfile = require("../../../config/default.json")
var crypto = require("crypto");
var fs = require("fs");

var request = require('request');
const client_id = "ks00764008@techmahindra.com";
const client_secret = "techmtest";
module.exports = class ConfigController {
    
  static async getConfigdata(req,res,next)
  {
      
    const obj = await JSON.parse(JSON.stringify(configfile));
    //console.log(obj.error_codes);
 
    const data = obj.tv_app_config
    res.json({ status: true, data: data });

  }


  static async brightCoveKey(req,res,next)
  {
      var now = Math.floor(new Date() / 1000);
      var dir = "rsa-key_" + now;
      fs.mkdirSync(dir);
      
      crypto.generateKeyPair(
        "rsa",
        {modulusLength: 2048},
        (err, publicKey, privateKey) => {
          fs.writeFile(
            dir + "/public.pem",
            publicKey.export({ type: "spki", format: "pem" }),
            err => {}
          );
          fs.writeFile(
            dir + "/public_key.txt",
            publicKey.export({ type: "spki", format: "der" }).toString("base64") +
              "\n",
            err => {}
          );
          fs.writeFile(
            dir + "/private.pem",
            privateKey.export({ type: "pkcs1", format: "pem" }),
            err => {}
          );
        }
      );
      
      console.log("Public key saved in " + dir + "/public_key.txt");
  }
  
  static async publicKeyRegistration(req,res,next){
    console.log("client_id: ",client_id);
    var auth_string = new Buffer(client_id + ":" + client_secret).toString('base64');
    console.log(auth_string);
    request({
    method: 'POST',
    url: 'https://oauth.brightcove.com/v4/access_token',
    headers: {
    'Authorization': 'Basic ' + auth_string,
    'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
    }, function (error, response, body) {
    console.log('Status: ', response.statusCode);
    console.log('Headers: ', JSON.stringify(response.headers));
    console.log('Response: ', body);
    console.log('Error: ', error);
    
  })
 }
}