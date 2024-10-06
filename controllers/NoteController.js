let axios = require("axios");
let { fetchAuthInfo, insert_to_UserAuth_Collection } = require('../model/auth.model');
const { exchangeForTokens, BASE_URL, accessToken_Validity } = require('../controllers/hs_oauthController');

let createNote_hs = async (access_token, inputData) => {
    let ass_type_id = 202; //BY DEFAULT CONTACT
    try {
        let record_id = inputData?.properties?.hs_object_id;
        let note_text = inputData.value;
        let record_Owner = inputData?.properties?.hubspot_owner_id || '';
        let specific_Owner = inputData?.owner || '';
        const currentDate = new Date();
        const isoString = currentDate.toISOString();

        if (inputData?.objType === 'DEAL')
            ass_type_id = 214;
        else if (inputData?.objType === 'COMPANY')
            ass_type_id = 190;
        else if (inputData?.objType === 'TICKET')
            ass_type_id = 228;

        let data = {
            "properties": {
                "hs_timestamp": `${isoString}`,
                "hs_note_body": `${note_text}`,
                "hubspot_owner_id": `${inputData.ownerSlected === 'recordOwner' ? record_Owner : specific_Owner}`
            },
            "associations": [
                {
                    "to": {
                        "id": record_id
                    },
                    "types": [
                        {
                            "associationCategory": "HUBSPOT_DEFINED",
                            "associationTypeId": ass_type_id
                        } ]
                }
            ]
        }
        try {
            const response = await axios.post('https://api.hubapi.com/crm/v3/objects/notes', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${access_token}`
                },
            });
            const result = response.data;
            console.log("************************** NOTE CREATED ********************");
           // console.log(result);
            return result;
        }
        catch (error) {
            /* console.log('Error posting Note :', error.response.data);
            console.log('Error posting Note :', error.response.status, error.response.statusText); */
            throw {
                errorData: error.response.data,
                errorCode: error.response.status,
                errorText: error.response.statusText,
            };
        }

    } catch (error) {
        console.log(error);
    }
}

exports.postNote = async (req, portalID) => {
    try {
        const authInfo = await fetchAuthInfo(portalID);
        console.log(`=============== AUTH INFO FROM DATABASE OF PORTAL-${portalID}===============`);
        console.log(authInfo);
        
        let access_token_expired = accessToken_Validity(authInfo);
        console.log("Token expired :", access_token_expired);

        if (access_token_expired) {
            const refreshTokenProof = {
                grant_type: 'refresh_token',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                redirect_uri: BASE_URL + '/redirect',
                refresh_token: authInfo.refresh_token
            };
            let token_info = await exchangeForTokens(req, refreshTokenProof);
            if (token_info.message)
                throw new Error("error refreshing access token ");
            console.log(`=============== RECEIVED NEW ACCESS TOKEN 👍 ===============`);
            console.log(token_info);
            token_info = { ...token_info, portalid: portalID }
            // STORE NEW TOKEN TO the Database
            await insert_to_UserAuth_Collection(token_info);

            let response = await createNote_hs(token_info.access_token, req.body);
            console.log('Note Creation API response : \n', response);
            return response;
        }
        else {
            let response = await createNote_hs(authInfo.access_token, req.body);
            console.log('Note Creation API response : \n', response);
            return response;
        }
    }
    catch (error) {
        console.log(error);
        return error;
    }
}