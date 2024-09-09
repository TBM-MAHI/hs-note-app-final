const express = require('express');
let api_Router = express.Router();

const { exchangeForTokens, BASE_URL, REDIRECT_URL, getAccessToken } = require('../controllers/hs_oauthController');

api_Router.post('/createNote', async (req, res) => {
    try {

        console.log("logging request body \n", req.body);
        return res.status(200).json(req.body);

    }
    catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});


module.exports = api_Router;