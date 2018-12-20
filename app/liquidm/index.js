/**
 * LIQUIDM ROUTES
 */
module.exports = function(app) {
    // COMMON
    const axios = require('axios');
    const PATH_DB = '../server/db/';
    
    // Redirect to loadCampaign.html
    app.get('/liquidm/loadCampaign', function (req, res) {
        res.set('Content-Type', 'text/html');
        res.sendFile(__dirname + '/liquidm.html');
    });

    // LIQUIDM_AUTH
    const LIQUIDM_AUTH = require(PATH_DB + 'auth.json');
    let AUTH_TOKEN_LIQUIDM
    try {
        AUTH_TOKEN_LIQUIDM = LIQUIDM_AUTH.auth_token; 
        if (AUTH_TOKEN_LIQUIDM !== '') {
            console.log('AUTH_TOKEN_LIQUIDM: ' + AUTH_TOKEN_LIQUIDM);
        } else {
            console.log('AUTH_TOKEN_LIQUIDM is Empty');
        }
    } catch (error) {
        console.log('AUTH_TOKEN_LIQUIDM not found');
        console.error('AUTH_TOKEN_LIQUIDM not found;' + error);
    }

    // PARAM email
    app.param('email', function(req,res, next, email){ next(); });
    // PARAM password
    app.param('password', function(req,res, next, password){ next(); });
    // PARAM campaignID
    app.param('campaignID', function(req,res, next, campaignID){ next(); });
    // PARAM campaignName
    app.param('campaignName', function(req,res, next, campaignName){ next(); });
    // PARAM adID
    app.param('adID', function(req,res, next, adID){ next(); });
    // PARAM targetingID
    app.param('targetingID', function(req,res, next, targetingID){ next(); });
    // PARAM creativeID
    app.param('creativeID', function(req,res, next, creativeID){ next(); });
    // PARAM settingsID
    app.param('settingsID', function(req,res, next, settingsID){ next(); });
    // PARAM uploadFile
    app.param('uploadFile', function(req,res, next, uploadFile){ next(); });

    // GET AUTH
    app.get('/liquidm/auth/email/:email', function (req, res, next) { next(); });
    app.get('/liquidm/auth/email/:email/password/:password', function (req, res, next) {
        console.log('API GET AUTH');
        next();
    });
    // API GET AUTH
    app.get('/liquidm/auth/email/:email/password/:password',function(req,res){
        console.log('email: ' + req.params.email + ',password: ' + req.params.password);
        var URL_AUTH = '/liquidm/auth';
        var METHOD_AUTH = 'GET';
        var BASE_URL_AUTH = 'https://platform.liquidm.com/api/auth';
        var REQ_PARAMS_EMAIL = req.params.email;
        var REQ_PARAMS_PASSWORD = req.params.password;
        var HEADERS_AUTH = { 'cache-control': 'no-cache' };
        var PARAMS_AUTH = { email: REQ_PARAMS_EMAIL, password: REQ_PARAMS_PASSWORD, api: 'true' };
        const getAuth = async URL_AUTH => {
            try {
                const AXIOS_RESPONSE = await axios({
                method: METHOD_AUTH,
                url: BASE_URL_AUTH,
                params: PARAMS_AUTH,
                headers: HEADERS_AUTH
                })
                .then(function(AXIOS_RESPONSE) {
                    console.log('AXIOS_RESPONSE.status:', AXIOS_RESPONSE.status);
                    let AXIOS_RESP
                    try {
                        AXIOS_RESP = AXIOS_RESPONSE.data;
                        if (('auth_token' in AXIOS_RESP) == true) {
                            res.send(AXIOS_RESP);
                        } else {
                            console.log('Credentials-invalid');
                            res.status(404).json({ error: 'credentials-invalid' });
                        };
                        saveJSON(AXIOS_RESP, function(err) {
                            if (err) {
                                console.log('JSON not saved');
                            return;
                            }
                            console.log('JSON saved');
                        });
                        function saveJSON(AXIOS_RESP, callback) {
                            fs.writeFile(PATH_DB + '/auth.json', JSON.stringify(AXIOS_RESP), callback);
                            };
                    } catch (error) {
                        console.log('CampaignID not found');
                        res.status(404).json({ error: 'credentials-invalid' });
                    }
                });;
            } catch (error) {
                console.log(error);
            };
        };
        getAuth(URL_AUTH);
    });

    // GET CAMPAIGN
    app.get('/liquidm/campaign/:campaignID', function (req, res, next) {
        console.log('API GET CAMPAIGN');
        next();
    });
    //API GET CAMPAIGN
    app.get('/liquidm/campaign/:campaignID',function(req,res){
        console.log('campaignID:' + req.params.campaignID);
        var URL_CAMPAIGN = '/campaign';
        var METHOD_CAMPAIGN = 'GET';
        var BASE_URL_CAMPAIGN = 'https://platform.liquidm.com/api/v1/campaigns';
        var CAMPAIGN_ID = req.params.campaignID;
        var HEADERS_CAMPAIGN = { 'cache-control': 'no-cache', authorization: AUTH_TOKEN_LIQUIDM };
        var PARAMS_CAMPAIGN = { embed: 'ads(embed(targeting,setting,supply))', id: CAMPAIGN_ID };
        const getCampaignID = async URL_CAMPAIGN => {
            try {
                const AXIOS_RESPONSE = await axios({
                method: METHOD_CAMPAIGN,
                url: BASE_URL_CAMPAIGN,
                params: PARAMS_CAMPAIGN,
                headers: HEADERS_CAMPAIGN
                })
                .then(function(AXIOS_RESPONSE) {
                    let resp
                    try {
                        resp = AXIOS_RESPONSE.data;
                        if (('campaigns' in resp) == true) {
                            if (('id' in resp.campaigns[0]) == true) {
                                if (resp.campaigns[0].id.toString() === CAMPAIGN_ID) {
                                    var CAMPAIGNS_ROOT = resp.campaigns[0];
                                    var CAMPAIGN_NAME = CAMPAIGNS_ROOT.name;
                                    var ACCOUNT_ID = CAMPAIGNS_ROOT.account_id;
                                    var CAMPAIGN_UNIT_TYPE = CAMPAIGNS_ROOT.unit_type;
                                    var CAMPAIGN_CURRENCY = CAMPAIGNS_ROOT.currency;
                                    var CAMPAIGN_TIMEZONE = CAMPAIGNS_ROOT.timezone;
                                    var CAMPAIGN_ADS = CAMPAIGNS_ROOT.ads;
                                    var CAMPAIGN_ADS_VALUES = {};
                                    var CAMPAIGN_ADS_INFO = {};
                                    Object.keys(CAMPAIGN_ADS).forEach(function (adsKey) {
                                        if(!!CAMPAIGN_ADS[adsKey]['campaign_id']) {
                                            if(CAMPAIGN_ADS[adsKey]['campaign_id'].toString() === CAMPAIGN_ID) {
                                                CAMPAIGN_ADS_INFO[CAMPAIGN_ADS[adsKey]['id'].toString()] = {
                                                    campaign_id: CAMPAIGN_ADS[adsKey]['campaign_id'],
                                                    ad_id: CAMPAIGN_ADS[adsKey]['id'],
                                                    creative_id: CAMPAIGN_ADS[adsKey]['creative_id'],
                                                    targeting_id: CAMPAIGN_ADS[adsKey]['targeting']['id'],
                                                    setting_id: CAMPAIGN_ADS[adsKey]['setting']['id'],
                                                    supply_id: CAMPAIGN_ADS[adsKey]['supply']['id']
                                                };
                                                CAMPAIGN_ADS_VALUES[adsKey] = CAMPAIGN_ADS[adsKey]['name'].toString();
                                                CAMPAIGN_ADS_VALUES = JSON.parse(
                                                    JSON.stringify(CAMPAIGN_ADS_VALUES)
                                                        .split('\"' + adsKey +'\":')
                                                        .join('\"' + CAMPAIGN_ADS[adsKey]['id'].toString() + '\":')
                                                );      
                                            };            
                                        };
                                    });
                                    var dataJSON = {
                                        account_id: ACCOUNT_ID,
                                        campaignID: CAMPAIGN_ID,
                                        name: CAMPAIGN_NAME,
                                        unit_type: CAMPAIGN_UNIT_TYPE,
                                        currency: CAMPAIGN_CURRENCY,
                                        timezone: CAMPAIGN_TIMEZONE,
                                        summary: CAMPAIGN_ADS_VALUES,
                                        ads: CAMPAIGN_ADS_INFO
                                    };AXIOS_RESPONSE.data = dataJSON;
                                    res.send(dataJSON);
                                } else {
                                console.log('CAMPAIGN_ID does not match');
                                res.status(404).json({ error: 'CAMPAIGN_ID does not match' });                        
                                };
                            } else {
                                console.log('CAMPAIGN_ID not found');
                                res.status(404).json({ error: 'CAMPAIGN_ID' + CAMPAIGN_ID + ' not found' });
                            };
                        } else {
                            console.log('CAMPAIGN_ID not found');
                            res.status(404).json({ error: 'CAMPAIGN_ID' + CAMPAIGN_ID + ' not found' });
                        };
                        saveJSON(resp, function(err) {
                            if (err) {
                                console.log('JSON not saved');
                            return;
                            }
                            console.log('JSON saved');
                        });
                        function saveJSON(resp, callback) {
                            fs.writeFile('./public/CID' + CAMPAIGN_ID + '.json', JSON.stringify(resp), callback);
                            };
                    } catch (error) {
                        console.log('CAMPAIGN_ID not found');
                        res.status(404).json({ error: 'CAMPAIGN_ID' + CAMPAIGN_ID + ' not found' });
                    }
                });;
            } catch (error) {
                console.log(error);
            };
        };
        getCampaignID(URL_CAMPAIGN);
    });

    // POST NEW AD
    app.post('/liquidm/newAd/campaignID/:campaignID/campaignName/:campaignName', function (req, res, next) {
        console.log('API POST NEW AD');
        next();
    });
    app.post('/liquidm/newAd/campaignID/:campaignID/campaignName/:campaignName',function(req,res){
        console.log('campaignID:' + req.params.campaignID + ', campaignName:' + req.params.campaignName);
        var URL_NEWAD = '/liquidm/newAd';
        var METHOD_NEWAD = 'POST';
        var BASE_URL_NEWAD = 'http://dsp.adsmovil.com/api/v1/ads';
        var CAMPAIGN_ID = req.params.campaignID;
        var CAMPAIGN_NAME = req.params.campaignName;
        var HEADERS_NEWAD = { 'Accept': 'application/json', 
            'cache-control': 'no-cache', 
            'content-type': 'application/json; charset=UTF-8', 
            authorization: AUTH_TOKEN_LIQUIDM };
        var PARAMS_NEWAD = { embed: 'targeting,setting,supply' };
        var BODY_NEWAD = {"ad":
            {"name":CAMPAIGN_NAME,
            "state":null,
            "created_at":null,
            "appnexus_approval_info":null,
            "overall_units":null,
            "daily_units":null,
            "section_order":[],
            "delivery_warnings":[],
            "delivery_errors":[],
            "campaign_id":CAMPAIGN_ID,
            "creative_section_id":null,
            "creative_section_type":null}
        };
        let CONFIG_NEWAD = {
            headers: HEADERS_NEWAD
        };
        const postNewAd = async URL_NEWAD => {
            try {
                const AXIOS_RESPONSE = await axios({
                method: METHOD_NEWAD,
                url: BASE_URL_NEWAD,
                headers: CONFIG_NEWAD
                })
                .then(function(AXIOS_RESPONSE) {
                    let resp
                    try {
                        resp = AXIOS_RESPONSE.data;
                    } catch (error) {
                        throw Error('[requestClient] Error parsing response JSON data - ${JSON.stringify(error)}')
                    }
                    res.send(resp);
                });;
            } catch (error) {
                console.log('Catch error');
                console.log(error);
            }
        };
        axios.interceptors.request.use(async (config) => {
            //console.log('Starting Request', config);
            //console.log('Setting Headers', HEADERS_NEWAD);
            config.headers = HEADERS_NEWAD;
            //console.log('Setting Request Payload', BODY_NEWAD);
            config.data = BODY_NEWAD;
            //console.log('Setting Query String Parameters', PARAMS_NEWAD);
            config.query = PARAMS_NEWAD;
            //console.log('Config Changed', config);
            return config;
        });
        axios.interceptors.response.use(response => {
            //console.log('AXIOS_RESPONSE:', AXIOS_RESPONSE);
            return response;
        });
        postNewAd(URL_NEWAD);
    });

    // DELETE DEl AD
    app.delete('/liquidm/delAd/:adID', function (req, res, next) {
        console.log('API DELETE DEL AD');
        next();
    });
    app.delete('/liquidm/delAd/:adID',function(req,res){
        console.log('adID:' + req.params.adID);
        var URL_DELAD = '/liquidm/delAd';
        var METHOD_DELAD = 'DELETE';
        var AD_ID = req.params.adID;
        var BASE_URL_DELAD = 'http://dsp.adsmovil.com/api/v1/ads/' + AD_ID;
        var HEADERS_DELAD = { 'Accept': 'application/json', 
            'cache-control': 'no-cache', 
            authorization: AUTH_TOKEN_LIQUIDM };
        let CONFIG_DELAD = {
            headers: HEADERS_DELAD
        };
        const delDelAd = async URL_DELAD => {
            try {
                const AXIOS_RESPONSE = await axios({
                method: METHOD_DELAD,
                url: BASE_URL_DELAD,
                headers: CONFIG_DELAD
                })
                .then(function(AXIOS_RESPONSE) {
                    let resp
                    try {
                        resp = AXIOS_RESPONSE.data;
                    } catch (error) {
                        throw Error('[requestClient] Error parsing response JSON data - ${JSON.stringify(error)}')
                    }
                    res.send(resp);
                });;
            } catch (error) {
                console.log('Catch error');
                console.log(error);
            }
        };
        axios.interceptors.request.use(async (config) => {
            //console.log('Starting Request', config);
            //console.log('Setting Headers', headers);
            config.headers = HEADERS_DELAD;
            //console.log('Config Changed', config);
            return config;
        });
        axios.interceptors.response.use(response => {
            //console.log('Response:', response);
            return response;
        });
        delDelAd(URL_DELAD);
    });

    // POST TARGETING
    app.post('/liquidm/targeting/:targetingID', function (req, res, next) {
        console.log('API PUT TARGETING');
        next();
    });
    // API POST TARGETING
    app.post('/liquidm/targeting/:targetingID',function(req,res){
        console.log('targetingID:' + req.params.targetingID);
        var URL_TARGETING = '/liquidm/targeting';
        var TARGETING_ID = req.params.targetingID;
        var REQUEST_BODY = req.body;
        console.log('REQUEST_BODY: ' + JSON.stringify(REQUEST_BODY));
        // POST SIGN
        var BASE_URL_SIGN = 'http://dsp.adsmovil.com/api/v1/geo_locations/sign';
        var BODY_SIGN = {"locations":[]};
        if ('geo_locations' in REQUEST_BODY) {
            Object.keys(REQUEST_BODY.geo_locations).forEach(function (geoKey) {
                if(!!REQUEST_BODY.geo_locations[geoKey]['lat'] && !!REQUEST_BODY.geo_locations[geoKey]['lng']) {
                    var COORD_GEOKEY = REQUEST_BODY.geo_locations[geoKey]['lat'] + ',' + REQUEST_BODY.geo_locations[geoKey]['lng'];
                    BODY_SIGN.locations[geoKey] = COORD_GEOKEY;          
                };
            });
        };
        var HEADERS_SIGN = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
            'cache-control': 'no-cache', 
            'content-type': 'application/json; charset=UTF-8', 
            authorization: AUTH_TOKEN_LIQUIDM };
        let CONFIG_SIGN = {
            headers: HEADERS_SIGN
        };
        // POST MASS CREATE
        var BASE_URL_MASSCREATE = 'http://dsp.adsmovil.com/api/v1/geo_locations/mass_create';
        var BODY_MASSCREATE = { "geolocations": []};
        BODY_MASSCREATE.geo_locations = REQUEST_BODY.geo_locations;
        var HEADERS_MASSCREATE = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
            'cache-control': 'no-cache', 
            'content-type': 'application/json; charset=UTF-8', 
            authorization: AUTH_TOKEN_LIQUIDM };
        let CONFIG_MASSCREATE = {
            headers: HEADERS_MASSCREATE
        };
        // PUT TARGETING
        var BASE_URL_TARGETING = 'http://dsp.adsmovil.com/api/v1/targetings/' + TARGETING_ID;
        var BODY_TARGETING = {
            "targeting": {
                "min_age": null,
                "max_age": null,
                "gender": "all",
                "targeting_type": null,
                "geographic_ids": REQUEST_BODY.regions,
                "country_ids": REQUEST_BODY.country,
                "geo_location_ids": []
            }
        };
        var HEADERS_TARGETING = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
            'cache-control': 'no-cache', 
            'content-type': 'application/json; charset=UTF-8', 
            authorization: AUTH_TOKEN_LIQUIDM };
        let CONFIG_TARGETING = {
            headers: HEADERS_TARGETING,
            data: BODY_TARGETING
        };
        var REQUEST_FLAG = 0;
        const postTargeting = async URL_TARGETING => {
            try {
                const AXIOS_RESPONSE = await axios({
                    method: 'POST',
                    url: BASE_URL_SIGN, 
                    data: CONFIG_SIGN})
                .then((AXIOS_RESPONSE) => {
                    // do something with SIGN res
                    console.log('SIGN: ', AXIOS_RESPONSE.status);
                    REQUEST_FLAG = 1;
                    return axios.post(BASE_URL_MASSCREATE, CONFIG_MASSCREATE)
                    .then((AXIOS_RESPONSE) => {
                        // do something with MASS CREATE res
                        console.log('MASSCREATE: ', AXIOS_RESPONSE.status);
                        var GEO_LOCATIONS_IDS = [];
                        if ('geo_locations' in AXIOS_RESPONSE.data) {
                            Object.keys(AXIOS_RESPONSE.data.geo_locations).forEach(function (geoKey) {
                                if(!!AXIOS_RESPONSE.data.geo_locations[geoKey]['id']) {
                                    var COORD_GEOKEY = AXIOS_RESPONSE.data.geo_locations[geoKey]['id'];
                                    GEO_LOCATIONS_IDS.push(COORD_GEOKEY.toString());
                                };
                            });
                        };
                        BODY_TARGETING.targeting.geo_location_ids = GEO_LOCATIONS_IDS;
                        CONFIG_TARGETING.data = BODY_TARGETING;     
                        REQUEST_FLAG = 2;
                        return axios.put(BASE_URL_TARGETING, CONFIG_TARGETING);
                    })
                    .then((AXIOS_RESPONSE) => {
                        // do something with TARGETING res
                        console.log('TARGETING: ', AXIOS_RESPONSE.status);
                        let resp
                        try {
                            resp = AXIOS_RESPONSE.data;
                        } catch (error) {
                            console.log('error: ', error)
                        }
                        console.log('resp: ', resp);
                        res.send(resp);
                    })
                    .catch((err) => {
                        //console.log('catch error TARGETING: ', err);
                    });;
                })
                .then((res) => {
                    // do something with ALL res
                })
                .catch((err) => {
                    console.log('catch error ALL: ', err);
                });
            } catch (error) {
                console.log('Catch error: ', error);
            }
        };
        axios.interceptors.request.use(async (config) => {
            switch(REQUEST_FLAG) {
                case 0:
                    //console.log('Setting SIGN Headers', HEADERS_SIGN);
                    config.headers = HEADERS_SIGN;
                    //console.log('Setting SIGN Request Payload', BODY_SIGN);
                    config.data = BODY_SIGN;
                    break;
                case 1:
                    //console.log('Setting MASS CREATE Headers', HEADERS_MASSCREATE);
                    config.headers = HEADERS_MASSCREATE;
                    //console.log('Setting MASS CREATE Request Payload', BODY_MASSCREATE);
                    config.data = BODY_MASSCREATE;
                    break;
                case 2:
                    //console.log('Setting TARGETING Headers', HEADERS_TARGETING);
                    config.headers = HEADERS_TARGETING;
                    //console.log('Setting TARGETING Request Payload', BODY_TARGETING);
                    config.data = BODY_TARGETING;
                    break;
            };
            return config;
        });
        axios.interceptors.response.use(response => {
            console.log('AXIOS_RESPONSE: ', response.data);
            return response;
        });
        postTargeting(URL_TARGETING);
    });

    // PUT TARGETING
    app.put('/liquidm/targeting/targetingID/:targetingID', function (req, res, next) {
        console.log('API PUT TARGETING');
        next();
    });
    // API PUT TARGETING
    app.put('/liquidm/targeting/targetingID/:targetingID',function(req,res){
        console.log('targetingID:' + req.params.targetingID);
        var URL_PTARGETING = '/liquidm/targeting';
        var METHOD_PTARGETING = 'PUT';
        var TARGETING_ID = req.params.targetingID;
        var BASE_URL_PTARGETING = 'http://dsp.adsmovil.com/api/v1/targetings/' + TARGETING_ID;
        var REQUEST_BODY = req.body
        var HEADERS_PTARGETING = { 'Accept': 'application/json', 
            'cache-control': 'no-cache', 
            'content-type': 'application/json; charset=UTF-8', 
            authorization: AUTH_TOKEN_LIQUIDM };
        var BODY_PTARGETING = {
            "targeting": {
                "min_age": null,
                "max_age": null,
                "gender": "all",
                "targeting_type": null,
                "geographic_ids": REQUEST_BODY.regions,
                "country_ids": REQUEST_BODY.country,
                "geo_location_ids": REQUEST_BODY.geo_location_ids
            }
        };
        let CONFIG_PTARGETING = {
            headers: HEADERS_PTARGETING
        };
        const putTargeting = async URL_PTARGETING => {
            try {
                const AXIOS_RESPONSE = await axios({
                method: METHOD_PTARGETING,
                url: BASE_URL_PTARGETING,
                headers: CONFIG_PTARGETING
                })
                .then(function(AXIOS_RESPONSE) {
                    let resp
                    try {
                        resp = AXIOS_RESPONSE.data;
                    } catch (error) {
                        throw Error('[requestClient] Error parsing response JSON data - ${JSON.stringify(error)}')
                    }
                    res.send(resp);
                });;
            } catch (error) {
                console.log('Catch error: ', error);
            }
        };
        axios.interceptors.request.use(async (config) => {
            config.headers = HEADERS_PTARGETING;
            config.data = BODY_PTARGETING;
            return config;
        });
        axios.interceptors.response.use(response => {
            return response;
        });
        putTargeting(URL_PTARGETING);
    });

    // PATCH CREATIVE: SCRIPT-TAGS
    app.patch('/liquidm/script-tags/:creativeID', function (req, res, next) {
        console.log('API PATCH CREATIVE');
        next();
    });
    // API PATCH CREATIVE: SCRIPT-TAGS
    app.patch('/liquidm/script-tags/:creativeID',function(req,res){
        console.log('creativeID:' + req.params.creativeID);
        var URL_CREATIVE = '/liquidm/script-tags';
        var METHOD_CREATIVE = 'PATCH';
        var CREATIVE_ID = req.params.creativeID;
        var BASE_URL_CREATIVE = 'http://dsp.adsmovil.com/api/v2/script-tags/' + CREATIVE_ID;
        var HEADERS_CREATIVE = { 'Accept': 'application/vnd.api+json', 
            'cache-control': 'no-cache', 
            'Content-Type': 'application/vnd.api+json', 
            authorization: AUTH_TOKEN_LIQUIDM };
        var REQUEST_BODY = req.body;
        console.log('REQUEST_BODY: ' + JSON.stringify(REQUEST_BODY));
        var BODY_CREATIVE = REQUEST_BODY;
        let CONFIG_CREATIVE = {
            headers: HEADERS_CREATIVE
        };
        const patchCreativeTag = async URL_CREATIVE => {
            try {
                const AXIOS_RESPONSE = await axios({
                method: METHOD_CREATIVE,
                url: BASE_URL_CREATIVE,
                headers: CONFIG_CREATIVE
                })
                .then(function(AXIOS_RESPONSE) {
                    console.log('AXIOS_RESPONSE_THEN:CREATIVE');
                    let resp
                    try {
                        resp = AXIOS_RESPONSE.data;
                    } catch (error) {
                        console.log('error1');
                        throw Error('[requestClient] Error parsing response JSON data - ${JSON.stringify(error)}')
                    }
                    res.send(resp);
                });;
            } catch (error) {
                console.log('Catch error: ', error.message);
            }
        };
        axios.interceptors.request.use(config => {
            console.log('AXIOS_INTERCEPTOR_REQUEST:CREATIVE');
            config.headers = HEADERS_CREATIVE;
            config.data = BODY_CREATIVE;
            console.log('AXIOS_INTERCEPTOR_REQUEST_CONFIG: ', config);
            return config;
        });
        axios.interceptors.response.use(response => {
            console.log('AXIOS_INTERCEPTOR_RESPONSE:CREATIVE');
            console.log('AXIOS_RESPONSE: ', response.data);
            return response;
        });
        patchCreativeTag(URL_CREATIVE);
    });

    // PATCH CREATIVE: VIDEOS
    app.patch('/liquidm/videos/:creativeID', function (req, res, next) {
        console.log('API PATCH CREATIVE');
        next();
    });
    // API PATCH CREATIVE: VIDEOS
    app.patch('/liquidm/videos/:creativeID',function(req,res){
        console.log('creativeID:' + req.params.creativeID);
        var URL_CREATIVE = '/liquidm/script-tags';
        var METHOD_CREATIVE = 'PATCH';
        var CREATIVE_ID = req.params.creativeID;
        var BASE_URL_CREATIVE = 'http://dsp.adsmovil.com/api/v2/videos/' + CREATIVE_ID;
        var HEADERS_CREATIVE = { 'Accept': 'application/vnd.api+json', 
            'cache-control': 'no-cache', 
            'Content-Type': 'application/vnd.api+json', 
            authorization: AUTH_TOKEN_LIQUIDM };
        var REQUEST_BODY = req.body;
        console.log('REQUEST_BODY: ' + JSON.stringify(REQUEST_BODY));
        var BODY_CREATIVE = REQUEST_BODY;
        let CONFIG_CREATIVE = {
            headers: HEADERS_CREATIVE
        };
        const patchCreativeVideos = async URL_CREATIVE => {
            try {
                const AXIOS_RESPONSE = await axios({
                method: METHOD_CREATIVE,
                url: BASE_URL_CREATIVE,
                headers: CONFIG_CREATIVE
                })
                .then(function(AXIOS_RESPONSE) {
                    console.log('AXIOS_RESPONSE_THEN:CREATIVE');
                    let resp
                    try {
                        resp = AXIOS_RESPONSE.data;
                    } catch (error) {
                        console.log('error1');
                        throw Error('[requestClient] Error parsing response JSON data - ${JSON.stringify(error)}')
                    }
                    res.send(resp);
                });;
            } catch (error) {
                console.log('Catch error: ', error.message);
            }
        };
        axios.interceptors.request.use(config => {
            console.log('AXIOS_INTERCEPTOR_REQUEST:CREATIVE');
            config.headers = HEADERS_CREATIVE;
            config.data = BODY_CREATIVE;
            console.log('AXIOS_INTERCEPTOR_REQUEST_CONFIG: ', config);
            return config;
        });
        axios.interceptors.response.use(response => {
            console.log('AXIOS_INTERCEPTOR_RESPONSE:CREATIVE');
            console.log('AXIOS_RESPONSE: ', response.data);
            return response;
        });
        patchCreativeVideos(URL_CREATIVE);
    });

    // PATCH CREATIVE: BANNER
    app.patch('/liquidm/creative/:creativeID', function (req, res, next) {
        console.log('API PATCH CREATIVE');
        next();
    });
    // API PATCH CREATIVE: BANNER
    app.patch('/liquidm/creative/:creativeID',function(req,res){
        console.log('creativeID:' + req.params.creativeID);
        var URL_CREATIVE = '/liquidm/creative';
        var METHOD_CREATIVE = 'PATCH';
        var CREATIVE_ID = req.params.creativeID;
        var BASE_URL_CREATIVE = 'http://dsp.adsmovil.com/api/v2/banners/' + CREATIVE_ID;
        var HEADERS_CREATIVE = { 'Accept': 'application/vnd.api+json', 
            'cache-control': 'no-cache', 
            'Content-Type': 'application/vnd.api+json', 
            authorization: AUTH_TOKEN_LIQUIDM };
        var REQUEST_BODY = req.body;
        console.log('REQUEST_BODY: ' + JSON.stringify(REQUEST_BODY));
        var BODY_CREATIVE = REQUEST_BODY;
        let CONFIG_CREATIVE = {
            headers: HEADERS_CREATIVE
        };
        const patchCreative = async URL_CREATIVE => {
            try {
                const AXIOS_RESPONSE = await axios({
                method: METHOD_CREATIVE,
                url: BASE_URL_CREATIVE,
                headers: CONFIG_CREATIVE
                })
                .then(function(AXIOS_RESPONSE) {
                    console.log('AXIOS_RESPONSE_THEN:CREATIVE');
                    let resp
                    try {
                        resp = AXIOS_RESPONSE.data;
                    } catch (error) {
                        console.log('error1');
                        throw Error('[requestClient] Error parsing response JSON data - ${JSON.stringify(error)}')
                    }
                    res.send(resp);
                });;
            } catch (error) {
                console.log('Catch error: ', error.message);
            }
        };
        axios.interceptors.request.use(config => {
            console.log('AXIOS_INTERCEPTOR_REQUEST:CREATIVE');
            config.headers = HEADERS_CREATIVE;
            config.data = BODY_CREATIVE;
            console.log('AXIOS_INTERCEPTOR_REQUEST_CONFIG: ', config);
            return config;
        });
        axios.interceptors.response.use(response => {
            console.log('AXIOS_INTERCEPTOR_RESPONSE:CREATIVE');
            console.log('AXIOS_RESPONSE: ', response.data);
            return response;
        });
        patchCreative(URL_CREATIVE);
    });

    // PUT SETTINGS
    app.patch('/liquidm/settings/:settingID', function (req, res, next) {
        console.log('API PATCH CREATIVE');
        next();
    });
    // API PUT SETTINGS
    app.put('/liquidm/settings/:settingID',function(req,res){
        var URL_SETTINGS = '/liquidm/settings/:settingID';
        var METHOD_SETTINGS = 'PUT';
        var SETTINGS_ID = req.params.settingID;
        var BASE_URL_SETTINGS = 'http://dsp.adsmovil.com/api/v1/settings/' + SETTINGS_ID;
        var HEADERS_SETTINGS = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 
            'cache-control': 'no-cache', 
            'Content-Type': 'application/json; charset=UTF-8', 
            authorization: AUTH_TOKEN_LIQUIDM };
        var REQUEST_BODY = req.body;
        console.log('REQUEST_BODY: ' + JSON.stringify(REQUEST_BODY));
        var BODY_SETTINGS = REQUEST_BODY;
        let CONFIG_SETTINGS = {
            headers: HEADERS_SETTINGS
        };
        const putSettings = async URL_SETTINGS => {
            try {
                const AXIOS_RESPONSE = await axios({
                method: METHOD_SETTINGS,
                url: BASE_URL_SETTINGS,
                headers: CONFIG_SETTINGS
                })
                .then(function(AXIOS_RESPONSE) {
                    let resp
                    try {
                        resp = AXIOS_RESPONSE.data;
                    } catch (error) {
                        throw Error('[requestClient] Error parsing response JSON data - ${JSON.stringify(error)}')
                    }
                    res.send(resp);
                });;
            } catch (error) {
                console.log('Catch error');
                console.log(Object.getOwnPropertyNames(error));
                console.log(error.message);
            }
        };
        axios.interceptors.request.use(config => {
            console.log('AXIOS_INTERCEPTOR_REQUEST:SETTINGS');
            config.headers = HEADERS_SETTINGS;
            config.data = BODY_SETTINGS;
            console.log('AXIOS_INTERCEPTOR_REQUEST_CONFIG: ', config);
            return config;
        });
        axios.interceptors.response.use(response => {
            console.log('AXIOS_INTERCEPTOR_RESPONSE:SETTINGS');
            console.log('AXIOS_RESPONSE: ', response.data);
            return response;
        });
        putSettings(URL_SETTINGS);
    });
}