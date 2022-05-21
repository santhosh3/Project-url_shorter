const urlModel = require('../models/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')
const { redisClient } = require('../controller/Redis.js')
const { promisify } = require("util")
const baseUrl = 'http://localhost:3000'

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidRequestBody = function (RequestBody) {
    if(Object.keys(RequestBody).length == 0 || Object.keys(RequestBody).length > 1) return false
    return true;
};


const createUrl = async function (req, res) {
    try {
        let longUrl = req.body.longUrl;
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Invalid request. Please provide url details", });
        }
        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "Please provide longURL" })
        }
        if (!(/^(https[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(longUrl))) {
            return res.status(400).send({ status: false, message: "Please enter valid LongURL" })
        }
  
        if (!validUrl.isUri(baseUrl)) {
            return res.status(400).json({ status: false, message: "Please enter valid Base URL" })
        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).json({ status: false, message: "Please enter valid LongURL" })
        }
        let checkRedis = await GET_ASYNC(`${longUrl}`)
        if(checkRedis) {
            return res.status(200).send({status:true,message:"Data from Redis", redisdata:JSON.parse(checkRedis)})
        }
        let checkDB = await urlModel.findOne({longUrl: longUrl}).select({_id:0, createdAt:0, updatedAt: 0, __v:0})
        if(checkDB){
            await SET_ASYNC(`${longUrl}`,JSON.stringify(checkDB));
            return res.status(200).send({status: true, message: "Data from DB and it sets this data in Redis ", data: checkDB})
            }
        const urlCode = shortid.generate(longUrl).toLowerCase()
    
        const shortUrl = baseUrl + '/' + urlCode
        const newUrl = { longUrl, shortUrl, urlCode }
        const short = await urlModel.create(newUrl)
        const newData = {
            longUrl: short.longUrl,
            shortUrl: short.shortUrl,
            urlCode: short.urlCode
        }        
        return res.status(201).send({ status: true, data: newData })
    } catch (err) {
        return res.status(504).send({ status: false, msg: err.message });
    }
}


const getUrl = async function (req, res) 
{
    try {
        urlCode = req.params.urlCode
        let url1 = await GET_ASYNC(`${urlCode}`);
        if (url1) {
            return res.status(302).redirect(JSON.parse(url1))
        }
        let url = await urlModel.findOne({ urlCode : urlCode })
        if (url) {
            await SET_ASYNC(`${urlCode}`, JSON.stringify(url.longUrl));
            return res.status(302).redirect(url.longUrl);
        }
        return res.status(404).send({ status: false, message: "No such URL FOUND or given URl is not valid" })
    } catch (err) {
        res.status(500).json({ status: false, msg: err.message });
    }
}






module.exports.createUrl = createUrl
module.exports.getUrl = getUrl


 // if (!shortid.isValid(urlCode)) { return res.status(404).send({ status: false, message: "Invalid urlCode" }) }










