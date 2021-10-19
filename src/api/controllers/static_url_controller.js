const configfile = require("../../../config/default.json")
var crypto = require("crypto");
var fs = require("fs");
module.exports = class ConfigController {
    
  static async getConfigdata(req,res,next)
  {
      
      const obj = await JSON.parse(JSON.stringify(configfile));
      console.log(obj.error_codes);
      delete obj.error_codes;
      delete obj.mongodb_uri;
    //   console.log(obj);
      res.json({ status: true, data: obj });

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

    const client_id = "ks00764008@techmahindra.com";
    const client_secret = "techmtest";

    
  }
}