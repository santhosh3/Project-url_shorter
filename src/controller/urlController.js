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
        console.log(longUrl);
        if (!validUrl.isUri(baseUrl)) {
            return res.status(400).json({ status: false, message: "Please enter valid Base URL" })
        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).json({ status: false, message: "Please enter valid LongURL" })
        }
        let check = await urlModel.findOne({ longUrl: longUrl })
        if (check) {
            let cachedData = await GET_ASYNC(longUrl);
            return res.status(307).json({ status: true, msg: "Url Details.", data: JSON.parse(cachedData) });
        }
        const urlCode = shortid.generate(longUrl).toLowerCase()
        let url = await urlModel.findOne({ urlCode: urlCode })
        if (url) {
            return res.status(400).send({ status: false, msg: `The urlCode ${urlCode} is already present, create another UrlCode.`, });
        }
        const shortUrl = baseUrl + '/' + urlCode
        const newUrl = { longUrl, shortUrl, urlCode }
        const short = await urlModel.create(newUrl)
        const newData = {
            urlCode: short.urlCode,
            longUrl: short.longUrl,
            shortUrl: short.shortUrl
        }
        await SET_ASYNC(`${urlCode}`, JSON.stringify(longUrl));
        await SET_ASYNC(`${longUrl}`, JSON.stringify(longUrl));
        console.log(JSON.stringify(longUrl))
        return res.status(201).send({ status: true, data: newData })
    } catch (err) {
        return res.status(500).send({ status: false, msg: error.message });
    }
}

// const getUrl = async function (req, res) {
//     try {
//         const urlCode = req.params.urlCode
//         let cahcedUrlCode = await GET_ASYNC(`${urlCode}`)
//         if (cahcedUrlCode){
//             return res.status(302).redirect(JSON.parse(cahcedUrlCode))
//         }
//         const url = await urlModel.findOne({ urlCode: urlCode })
//         if (url) {
//             SET_ASYNC(`${urlCode}`, JSON.stringify(url.longUrl))
//             return res.status(302).redirect(url.longUrl)
//         }

//         return res.status(404).send({ status: false, message: "No such URL FOUND" })

//     } catch (err) {
//         return res.status(500).send({ status: true, message: err.message })
//     }
//  }



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
        return res.status(404).send({ status: false, message: "No such URL FOUND" })
    } catch (err) {
        res.status(500).json({ status: false, msg: err.message });
    }
}






module.exports.createUrl = createUrl
module.exports.getUrl = getUrl


 // if (!shortid.isValid(urlCode)) { return res.status(404).send({ status: false, message: "Invalid urlCode" }) }










