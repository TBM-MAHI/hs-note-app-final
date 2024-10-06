const express = require('express');
let api_Router = express.Router();
let noteController = require('../controllers/NoteController');
api_Router.post('/createNote', async (req, res) => {
    /* 
    {
  value: ' TEST ',
  properties: { hs_object_id: '43308627834' },
  objType: 'CONTACT',
  portalID: 46907992,
  ownerSlected: 'specificOwner',
  owner: '657131142'
} */
    try {
        console.log("logging request body \n", req.body);
        let portalID = Number(req.body.portalID);
        let response = await noteController.postNote(req, portalID);
        return res.status(200).json(response);

    }
    catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});



module.exports = api_Router;