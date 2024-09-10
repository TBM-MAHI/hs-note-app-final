const { authModel } = require('../model/auth.mongo');

let insert_to_UserAuth_Collection = async (accData) => {
   /*  console.log(`=============== UPSERTING IN MONGO ===============`);
    console.log(accData); */
    try {
        const updatedAuth = await authModel.findOneAndUpdate(
            { portalID: accData.portalid },
            {
                refresh_token: accData.refresh_token,
                access_token: accData.access_token,
                expires_in: accData.expires_in,
                token_timestamp: Date.now()
            },
            {
                new: true, // Return the updated document
                upsert: true, // Insert the document if it does not exist
            }
        );
        console.log('Document upserted in Mongo:');
        console.log(updatedAuth);
    } catch (error) {
        console.error('Error upserting document:', error);
    }
}

async function fetchAuthInfo(portalID) {
    try {
        // Find the document with the matching portalID
        const authInfo = await authModel.findOne({ portalID: portalID });
        // Check if the document was found
        if (!authInfo) {
            throw new Error(`No document found with portalID: ${portalID}`);
        }
        return authInfo;
    } catch (error) {
        console.error('Error fetching auth info by portalID:', error);
        return error; 
    }
}

module.exports = {
    insert_to_UserAuth_Collection,
    fetchAuthInfo
}
