/*********************************
 * Adobe Analytics Helper - Data Insertion API helper
 * @author David Benge
 *
 */
"use strict";
/***********
 * https://marketing.adobe.com/developer/en_US/documentation/data-insertion/c-data-insertion-process
 * https://marketing.adobe.com/developer/en_US/documentation/data-insertion/r-supported-tags
 * https://marketing.adobe.com/developer/en_US/documentation/data-insertion/r-sample-http-post
 ***********/
var http = require('http');
var _ = require('underscore');
var _adobeAnalyticsHttpAgent = new http.Agent();
_adobeAnalyticsHttpAgent.maxSockets = 20; //default connection pool - nodes default is 5
var _eVars = [];
var _persistEvars = true;
var _sProps = [];
var _persistSProps = false;
var _reportingSuiteId=null;
var _trackingServerUrl=null;
var _persistReportingSuiteId=true;
var _pageName=null;
var _persistPageName=true;
var _defaultIpAddress = process.env.OPENSHIFT_NODEJS_IP;
var _xmlPre = "<?xml version=1.0 encoding=UTF-8?><request><sc_xml_ver>1.0</sc_xml_ver>";
var _xmlPost = "</request>";
//parameter map - keyName : object (name, description,multiform (goofy term for more than one))
var _parameters = {
    browserHeight:{postParam:"browserHeight",description:"Browser height in pixels (For example, 768).",multiform:false,getParam:"bh"},
    browserWidth:{postParam:"browserWidth",description:"Browser width in pixels (For example, 1024).",multiform:false,getParam:"bw"},
    campaign:{postParam:"campaign",description:"The campaign tracking code associated with the page.",multiform:false,getParam:"v0"},
    channel:{postParam:"channel",description:"The page title or bread crumb.",multiform:false,getParam:"ch"},
    colorDepth:{postParam:"colorDepth",description:"Monitor color depth in bits (For example, 24).",multiform:false,getParam:"c"},
    connectionType:{postParam:"connectionType",description:'Visitors connection type ("lan" or "modem").',multiform:false,getParam:"ct"},
    contextData:{postParam:"contextData",description:'Key-values pairs are specified in one of the following formats:<my.a>red</my.a> or: <my><a>red</a></my>',multiform:false,getParam:"c.key"},
    cookiesEnabled:{postParam:"cookiesEnabled",description:'Whether the visitor supports first party session cookies (Y or N).',multiform:false,getParam:"k"},
    currencyCode:{postParam:"currencyCode",description:'Revenue currency code For example, USD.',multiform:false},
    eVar:{postParam:"eVar",description:'eVar',multiform:true,max:75},
    events:{postParam:"events",description:'A list of Analytics events. Multiple events are separated by a comma.event1 or event1,event2',multiform:false,getParam:"events"},
    hier:{postParam:"hier",description:'A hierarchy string.',multiform:true,max:5,getParam:"h"},
    homePage:{postParam:"homePage",description:'Whether the current page is the visitors homepage (Y or N).',multiform:false,getParam:"hp"},
    ipaddress:{postParam:"ipaddress",description:'The visitors IP address.',multiform:false,getParam:""},
    javaEnabled:{postParam:"javaEnabled",description:'Whether the visitor has Java enabled (Y or N).',multiform:false,getParam:"v"},
    javaScriptVersion:{postParam:"javaScriptVersion",description:'JavaScript version. For example, 1.3.',multiform:false,getParam:"j"},
    language:{postParam:"language",description:'The browsers supported language. For example, "en-us".',multiform:false,getParam:""},
    linkName:{postParam:"linkName",description:'Name of link.',multiform:false,getParam:"pev2"},
    linkType:{postParam:"linkType",description:'Type of link ("d", "e", or "o").',multiform:false,getParam:"pe"},
    linkURL:{postParam:"linkURL",description:'The links HREF. For custom links, page values are ignored.',multiform:false,getParam:"pev1"},
    list:{postParam:"list",description:'A delimited list of values that are passed into a variable, then reported as individual line items for reporting.',multiform:true,max:3,getParam:"l"},
    pageName:{postParam:"pageName",description:'The Web page name.',multiform:false,getParam:"pageName"},
    pageType:{postParam:"pageType",description:'The Web page type. This is only used on 404 error pages. Set pageType to "Error Page" for when a 404 error is detected.',multiform:false,getParam:"pageType"},
    pageURL:{postParam:"pageURL",description:'The Web page URL For example, http://www.mysite.com/index.html.',multiform:false,getParam:"g"},
    plugins:{postParam:"plugins",description:'Semicolon separated list of Netscape plug-in names.',multiform:false,getParam:"p"},
    products:{postParam:"products",description:'List of all products on the page. Separate products with a comma. For example: Sports;Ball;1;5.95, Toys; Top;1:1.99.',multiform:false,getParam:"products"},
    prop:{postParam:"prop",description:'Analytics property name.',multiform:true,getParam:"c",max:75},
    purchaseID:{postParam:"purchaseID",description:'Purchase ID number.',getParam:"purchaseID",multiform:false},
    referrer:{postParam:"referrer",description:'The URL of the page referrer.',getParam:"r",multiform:false},
    reportSuiteID:{postParam:"reportSuiteID",description:'Specifies the report suites where you want to submit data. Separate multiple report suite IDs with a comma.',getParam:"",multiform:false},
    resolution:{postParam:"resolution",description:'Monitor resolution For example, 1280x1024.',getParam:"s",multiform:false},
    server:{postParam:"server",description:'The Web server serving the page.',getParam:"server",multiform:false},
    state:{postParam:"state",description:'The visitors U.S. state.',getParam:"state",multiform:false},
    timestamp:{postParam:"timestamp",description:'The time and date on which the data was collected.',getParam:"ts",multiform:false},
    timezone:{postParam:"timezone",description:'XML POST: Visitors time zone offset from GMT in hours. For example, -8. GET: The visitors time zone is included in the t query string parameter, which contains the local time. The t parameter is in the following format:',getParam:"t",multiform:false},
    transactionID:{postParam:"transactionID",description:'Common value used to tie multi-channel user activities together for reporting purposes.',getParam:"xact",multiform:false},
    userAgent:{postParam:"userAgent",description:'The visitors browser type and OS.',getParam:"",multiform:false},
    visitorID:{postParam:"visitorID",description:'Visitors Analytics ID',getParam:"vid",multiform:false},
    marketingCloudVisitorID:{postParam:"marketingCloudVisitorID",description:'Marketing Cloud ID',getParam:"mid",multiform:false},
    zip:{postParam:"zip",description:'The visitors zip code.',getParam:"zip",multiform:false}
};
var _parametersMultiformCache = null;

function _getMultiformProperties(){
    if(_parametersMultiformCache != null){
        return _parametersMultiformCache;
    }else{
        _parametersMultiformCache = [];
        //loop over _parameters object and make the list and cache it
        Object.keys(_parameters).forEach(function(key) {
            //is multi
            var isMultiform = _parameters[key].multiform || false;
            if(isMultiform){
                _parametersMultiformCache.push(_parameters[key]);
            }
        });
        return _parametersMultiformCache;
    }
};

function _isMultiform(diDataPropertyName){
    var multiFormProperties = _getMultiformProperties();
    for(var i=0;i<multiFormProperties.length;i++){
        var postParamName = multiFormProperties[i].postParam;
        if(diDataPropertyName.indexOf(postParamName) >= 0){
            return true;
        }
    }

    return false;
}

//starts with polyfill
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
            return this.lastIndexOf(searchString, position) === position;
        }
    });
}

function _sendCallToAdobeAnalytics(di, logger){
    if (!logger) {
        logger = console;
    }

    var body = _xmlPre + di.getPostXmlRequestBody() + _xmlPost;
    //console.info(body);
    var call_options = {
        host: self.getTrackingServerUrl() || self.getReportingSuiteId()+".112.2o7.net",
        port: 80,
        path: '/b/ss//6',
        method: 'POST',
        agent: _adobeAnalyticsHttpAgent,
        headers: {
            'Cookie': "cookie",
            'Content-Type': 'text/xml',
            'Content-Length': Buffer.byteLength(body)
        }
    };

    return new Promise(function(resolve, reject) {
        var req;
        try{
            //console.info(call_options);
            req = http.request(call_options, function(res) {
                /* */
                //console.info("calling adobe analytics " + res.statusCode);
                var buffer = "";
                res.on("data",function(data){
                    buffer = buffer + data;
                });


                res.on("end",function(data){
                    if (res.statusCode !== 200) {
                        reject(buffer);
                    }
                    resolve(buffer);
                });

            });

            req.on('error', function(e) {
                reject(e.message);
            });

            req.write( body );

        }catch(e){
            reject(e);
        }finally{
            req.end();
        }
    });
};

function _validateValidDiParameters(diData){
    Object.keys(diData).forEach(function(key) {
        //is multi
        var fetchTest = _parameters[key]; //does the key exist if so its valid for the call to the backend
        if(!fetchTest){
            var isMulti = _isMultiform(key); //on multiform you wont get a direct name match so we need to check and make sure its valid and in range
            if(isMulti){
                //so we know its semi valid would could check the number against the max range but I am lazy and thats just extra overhead and I already have a lot of overhead in the validation.
                return true;
            }else{
                throw new Error("Passed reporting property name "+key+" is invalid");
            }
        }
    });
}

function _getSpropsFromDiParameters(diData){
    var propsReturn = {};
    Object.keys(diData).forEach(function(key) {
        if(key.startsWith(_parameters.prop.postParam)){
            propsReturn[key] = diData[key];
        }
    });

    return propsReturn;
}

function _getEvarsFromDiParameters(diData){
    var evarReturn = {};
    Object.keys(diData).forEach(function(key) {
        if(key.startsWith(_parameters.eVar.postParam)){
            //console.log("################ starts with evar #####");
            evarReturn[key] = diData[key];
        }
        //console.info(JSON.stringify(key, null, 2));
        //console.info(JSON.stringify(diData[key], null, 2));
    });

    return evarReturn;
}

function DataInsertion(data){
    _validateValidDiParameters(data);

    /** check persistence **/
    if(_persistPageName && (typeof data[_parameters.pageName.postParam] != 'undefined')){
        _pageName = data[_parameters.pageName.postParam];
    }else if(_persistPageName && (typeof data[_parameters.pageName.postParam] == 'undefined') && (_pageName != null)){
        //set it to the last value used
        data[_parameters.pageName.postParam] = _pageName;
    }

    if(_persistReportingSuiteId && (typeof data[_parameters.reportSuiteID.postParam] != 'undefined')){
        _reportingSuiteId = data[_parameters.reportSuiteID.postParam];
    }else if(_persistReportingSuiteId && (typeof data[_parameters.reportSuiteID.postParam] == 'undefined') && (_reportingSuiteId != null)){
        //set it to the last value used
        data[_parameters.reportSuiteID.postParam] = _reportingSuiteId;
    }

    if(_persistEvars){
        var callEvars = _getEvarsFromDiParameters(data);
        var mergedEvars = _.extend(_eVars,callEvars);
        _eVars = mergedEvars; //update the persistence
        data = _.extend(data,mergedEvars); //update the original request object with any cached
    }

    if(_persistSProps){
        var callSprops = _getSpropsFromDiParameters(data);
        var mergedSprops = _.extend(_sProps,callSprops);
        _sProps = mergedSprops; //update the persistence
        data = _.extend(data,mergedSprops); //update the original request object with any cached
    }
    /** check persistence end **/

    /*** Checking Requirements ***/
    //CHECK for the definition of either reportSuiteID on data parameter or in the helper
    if((typeof data.reportSuiteID == 'undefined') && (_reportingSuiteId == null)){
        throw new Error('reportSuiteID is required');
    }else{
        data['reportSuiteID'] = data.reportSuiteID || _reportingSuiteId;
    }

    //visitor id or ipAddress is required
    if(typeof data.ipaddress == 'undefined'){
        if((typeof _defaultIpAddress != 'undefined') && (_defaultIpAddress != null)){
            data['ipaddress'] = _defaultIpAddress;
        }
    }

    //check either ip or visitor is defined
    if((typeof data.visitorID == 'undefined') && (typeof data.ipaddress == 'undefined')){
        throw new Error('visitorID OR ipaddress must be defined');
    }

    //Page name or page url is required
    if((typeof data.pageName == 'undefined') && (typeof data.pageURL == 'undefined')){
        throw new Error('pageName OR pageURL must be defined');
    }
    /*** End Checking Requirements ***/

    this.getPostXmlRequestBody=function(){
        //return big xml string with the requestProps formatted correctly
        var xmlString = "";

        //loop over values passed
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                xmlString += "<"+property+">"+data[property]+"</"+property+">";
            }
        }

        return xmlString;
    };

    /****
     * getRequestPropsAsJson
     *
     * @returns {json} request properties
     */
    this.getRequestPropsAsJson=function(){
        return JSON.stringify(data, null, 2);
    };

};

var AdobeAnalyticsHelper = {
    evars:_eVars,
    sprops:_sProps,
    /**
     * @doc linkType
     * @name AdobeAnalyticsHelper:linkType
     *
     * @description Enum for the link type.
     *
     * When passing in options on what to track you can pass in linkType.CUSTOM or o if you are fancy
     *
     */
    linkType:{
        "CUSTOM":"o",
        "EXIT":"e",
        "DOWNLOAD":"d"
    },
    recordEvent:function(){

    },
    /**
     * @doc setReportingSuiteId
     * @name AdobeAnalyticsHelper:setReportingSuiteId
     *
     * @description sets the reporting suite id
     *
     */
    setReportingSuiteId:function(reportingSuiteId){
        _reportingSuiteId = reportingSuiteId;
    },
    /**
     * @doc getReportingSuiteId
     * @name AdobeAnalyticsHelper:getReportingSuiteId
     *
     * @description gets the reporting suite id
     *
     */
    getReportingSuiteId:function(){
        return _reportingSuiteId;
    },
    /**
     * @doc setTrackingServerUrl
     * @name AdobeAnalyticsHelper:setTrackingServerUrl
     *
     * @description sets the tracking server url
     *
     */
    setTrackingServerUrl: function (trackingServerUrl) {
        _trackingServerUrl = trackingServerUrl
    },
    /**
     * @doc getTrackingServerUrl
     * @name AdobeAnalyticsHelper:getTrackingServerUrl
     *
     * @description gets the tracking server url
     *
     */
    getTrackingServerUrl:function(){
        return _trackingServerUrl;
    },
    /**
     * @doc getDataInsertion
     * @name AdobeAnalyticsHelper:getDataInsertion
     *
     * @description gets the Data Insertion object that will be sent to the server
     *
     * the server wants XML, i thought it was cleaner to make an new object and mock serialize it out to xml
     * over dealing with xml objects or some serialization lib.  I think it will be easier and have less overhead to use.
     */
    getDataInsertion:function(diData){
        return new DataInsertion(diData);
    },
    sendCallToAdobeAnalytics:function(di, logger){
        if(di instanceof DataInsertion){
            return _sendCallToAdobeAnalytics(di, logger);
        }
        else{
            throw new Error('di parameter passed is not an instance of DataInsertion. Please use getDataInsertion to get a new object instance to pass.');
        }
    },
    /**
     * @doc sendToAdobeAnalytics
     * @name AdobeAnalyticsHelper:sendToAdobeAnalytics
     *
     * @description this method will take a generic object then create a DI object and pass it to the analytics backend
     *
     * Its the same as calling sendCallToAdobeAnalytics(di) except it will create the DI object for you off a generic object then pass it in for you.
     *
     */
    sendToAdobeAnalytics:function(myDataObject, logger){
        var myDi = self.getDataInsertion(myDataObject);
        self.sendCallToAdobeAnalytics(myDi, logger);
    },
    /**
     * @doc getMaxSockets
     * @name AdobeAnalyticsHelper:getMaxSockets
     *
     * @description gets the pool size on the custom node http agent used to connect to the Adobe Analytics Data Insertion API. Default is 20
     *
     */
    getMaxSockets:function(){
        return _adobeAnalyticsHttpAgent.maxSockets;
    },
    /**
     * @doc setMaxSockets
     * @name AdobeAnalyticsHelper:setMaxSockets
     *
     * @description sets the pool size on the custom node http agent used to connect to the Adobe Analytics Data Insertion API. Default is 20
     *
     */
    setMaxSockets:function(max){
        _adobeAnalyticsHttpAgent.maxSockets;
    },
    /**
     * @doc getDiParameters
     * @name AdobeAnalyticsHelper:getDiParameters
     *
     * @description gets the map we use to drive the API
     *
     * Just in case you need this for something or were interested to see whats in there
     */
    getDiParameters:function(){
        return _parameters;
    }
};

var self = module.exports = AdobeAnalyticsHelper;