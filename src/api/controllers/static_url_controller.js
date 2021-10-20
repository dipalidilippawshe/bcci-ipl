const configfile = require("../../../config/default.json")

module.exports = class ConfigController {
    
  static async getConfigdata(req,res,next)
  {
      
    const obj = await JSON.parse(JSON.stringify(configfile));
    //console.log(obj.error_codes);
 
    const data = obj.tv_app_config
    res.json({ status: true, data: data });

  }
  
}