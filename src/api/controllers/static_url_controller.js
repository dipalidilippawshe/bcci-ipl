const configfile = require("../../../config/default.json")

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
  
}