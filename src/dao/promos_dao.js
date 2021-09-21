let promos;
module.exports = class PromosDAO {
    static async injectDB(con) {
        if (promos) {
            return;
        }
        try {
            promos = await con.db(process.env.BCCI).collection('promos');
        }
        catch (e) {
            console.error(`Unable to establish a collection handle in PromosDAO: ${e}`)
        }

    }
    static async getPromoById(id)
    {
        try{
            const pipeline=[
                {
                    $match:{
                        ID:id
                    }
                }
            ]
            return await promos.aggregate(pipeline).next();
        }
        catch(e)
        {
            console.error(`Error ${e}`)
        }
     
    }
}