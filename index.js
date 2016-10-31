/* */
(function(Buffer, process) {
    "use strict";
    var http = require('http');
    var _ = require('underscore');
    var _adobeAnalyticsHttpAgent = new http.Agent();
    _adobeAnalyticsHttpAgent.maxSockets = 20;
    var _eVars = [];
    var _persistEvars = true;
    var _sProps = [];
    var _trackingServer="";
    var _trackingServerSecure="";
    var _persistSProps = false;
    var _reportingSuiteId = null;
    var _persistReportingSuiteId = true;
    var _pageName = null;
    var _persistPageName = true;
    var _defaultIpAddress = process.env.OPENSHIFT_NODEJS_IP;
    var _xmlPre = "<?xml version=1.0 encoding=UTF-8?><request><sc_xml_ver>1.0</sc_xml_ver>";
    var _xmlPost = "</request>";
    var _parameters = {
        browserHeight: {
            postParam: "browserHeight",
            description: "Browser height in pixels (For example, 768).",
            multiform: false,
            getParam: "bh"
        },
        browserWidth: {
            postParam: "browserWidth",
            description: "Browser width in pixels (For example, 1024).",
            multiform: false,
            getParam: "bw"
        },
        campaign: {
            postParam: "campaign",
            description: "The campaign tracking code associated with the page.",
            multiform: false,
            getParam: "v0"
        },
        channel: {
            postParam: "channel",
            description: "The page title or bread crumb.",
            multiform: false,
            getParam: "ch"
        },
        colorDepth: {
            postParam: "colorDepth",
            description: "Monitor color depth in bits (For example, 24).",
            multiform: false,
            getParam: "c"
        },
        connectionType: {
            postParam: "connectionType",
            description: 'Visitors connection type ("lan" or "modem").',
            multiform: false,
            getParam: "ct"
        },
        contextData: {
            postParam: "contextData",
            description: 'Key-values pairs are specified in one of the following formats:<my.a>red</my.a> or: <my><a>red</a></my>',
            multiform: false,
            getParam: "c.key"
        },
        cookiesEnabled: {
            postParam: "cookiesEnabled",
            description: 'Whether the visitor supports first party session cookies (Y or N).',
            multiform: false,
            getParam: "k"
        },
        currencyCode: {
            postParam: "currencyCode",
            description: 'Revenue currency code For example, USD.',
            multiform: false
        },
        eVar: {
            postParam: "eVar",
            description: 'eVar',
            multiform: true,
            max: 75
        },
        events: {
            postParam: "events",
            description: 'A list of Analytics events. Multiple events are separated by a comma.event1 or event1,event2',
            multiform: false,
            getParam: "events"
        },
        hier: {
            postParam: "hier",
            description: 'A hierarchy string.',
            multiform: true,
            max: 5,
            getParam: "h"
        },
        homePage: {
            postParam: "homePage",
            description: 'Whether the current page is the visitors homepage (Y or N).',
            multiform: false,
            getParam: "hp"
        },
        ipaddress: {
            postParam: "ipaddress",
            description: 'The visitors IP address.',
            multiform: false,
            getParam: ""
        },
        javaEnabled: {
            postParam: "javaEnabled",
            description: 'Whether the visitor has Java enabled (Y or N).',
            multiform: false,
            getParam: "v"
        },
        javaScriptVersion: {
            postParam: "javaScriptVersion",
            description: 'JavaScript version. For example, 1.3.',
            multiform: false,
            getParam: "j"
        },
        language: {
            postParam: "language",
            description: 'The browsers supported language. For example, "en-us".',
            multiform: false,
            getParam: ""
        },
        linkName: {
            postParam: "linkName",
            description: 'Name of link.',
            multiform: false,
            getParam: "pev2"
        },
        linkType: {
            postParam: "linkType",
            description: 'Type of link ("d", "e", or "o").',
            multiform: false,
            getParam: "pe"
        },
        linkURL: {
            postParam: "linkURL",
            description: 'The links HREF. For custom links, page values are ignored.',
            multiform: false,
            getParam: "pev1"
        },
        list: {
            postParam: "list",
            description: 'A delimited list of values that are passed into a variable, then reported as individual line items for reporting.',
            multiform: true,
            max: 3,
            getParam: "l"
        },
        pageName: {
            postParam: "pageName",
            description: 'The Web page name.',
            multiform: false,
            getParam: "pageName"
        },
        pageType: {
            postParam: "pageType",
            description: 'The Web page type. This is only used on 404 error pages. Set pageType to "Error Page" for when a 404 error is detected.',
            multiform: false,
            getParam: "pageType"
        },
        pageURL: {
            postParam: "pageURL",
            description: 'The Web page URL For example, http://www.mysite.com/index.html.',
            multiform: false,
            getParam: "g"
        },
        plugins: {
            postParam: "plugins",
            description: 'Semicolon separated list of Netscape plug-in names.',
            multiform: false,
            getParam: "p"
        },
        products: {
            postParam: "products",
            description: 'List of all products on the page. Separate products with a comma. For example: Sports;Ball;1;5.95, Toys; Top;1:1.99.',
            multiform: false,
            getParam: "products"
        },
        prop: {
            postParam: "prop",
            description: 'Analytics property name.',
            multiform: true,
            getParam: "c",
            max: 75
        },
        purchaseID: {
            postParam: "purchaseID",
            description: 'Purchase ID number.',
            getParam: "purchaseID",
            multiform: false
        },
        referrer: {
            postParam: "referrer",
            description: 'The URL of the page referrer.',
            getParam: "r",
            multiform: false
        },
        reportSuiteID: {
            postParam: "referrer",
            description: 'Specifies the report suites where you want to submit data. Separate multiple report suite IDs with a comma.',
            getParam: "",
            multiform: false
        },
        resolution: {
            postParam: "resolution",
            description: 'Monitor resolution For example, 1280x1024.',
            getParam: "s",
            multiform: false
        },
        server: {
            postParam: "server",
            description: 'The Web server serving the page.',
            getParam: "server",
            multiform: false
        },
        state: {
            postParam: "state",
            description: 'The visitors U.S. state.',
            getParam: "state",
            multiform: false
        },
        timestamp: {
            postParam: "timestamp",
            description: 'The time and date on which the data was collected.',
            getParam: "ts",
            multiform: false
        },
        timezone: {
            postParam: "timezone",
            description: 'XML POST: Visitors time zone offset from GMT in hours. For example, -8. GET: The visitors time zone is included in the t query string parameter, which contains the local time. The t parameter is in the following format:',
            getParam: "t",
            multiform: false
        },
        transactionID: {
            postParam: "transactionID",
            description: 'Common value used to tie multi-channel user activities together for reporting purposes.',
            getParam: "xact",
            multiform: false
        },
        userAgent: {
            postParam: "userAgent",
            description: 'The visitors browser type and OS.',
            getParam: "",
            multiform: false
        },
        visitorID: {
            postParam: "visitorID",
            description: 'Visitors Analytics ID',
            getParam: "vid",
            multiform: false
        },
        marketingCloudVisitorID: {
            postParam: "marketingCloudVisitorID",
            description: 'Marketing Cloud ID',
            getParam: "mid",
            multiform: false
        },
        zip: {
            postParam: "zip",
            description: 'The visitors zip code.',
            getParam: "zip",
            multiform: false
        }
    };
    var _parametersMultiformCache = null;
    function _getMultiformProperties() {
        if (_parametersMultiformCache != null) {
            return _parametersMultiformCache;
        } else {
            _parametersMultiformCache = [];
            Object.keys(_parameters).forEach(function(key) {
                var isMultiform = _parameters[key].multiform || false;
                if (isMultiform) {
                    _parametersMultiformCache.push(_parameters[key]);
                }
            });
            return _parametersMultiformCache;
        }
    }
    ;
    function _isMultiform(diDataPropertyName) {
        var multiFormProperties = _getMultiformProperties();
        for (var i = 0; i < multiFormProperties.length; i++) {
            var postParamName = multiFormProperties[i].postParam;
            if (diDataPropertyName.indexOf(postParamName) >= 0) {
                return true;
            }
        }
        return false;
    }
    if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, 'startsWith', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: function(searchString, position) {
                position = position || 0;
                return this.lastIndexOf(searchString, position) === position;
            }
        });
    }

    function _getTrackingServer(){
        return _trackingServer;
    }
    function _getTrackingServerSecure(){
        return _trackingServerSecure;
    }
    function _setTrackingServers(unsecure, secure){
        _trackingServer = unsecure;
        _trackingServerSecure = secure;
    }
    function _sendCallToAdobeAnalytics(di, secure) {
        var body = _xmlPre + di.getPostXmlRequestBody() + _xmlPost;
        var call_options = {
            host: secure? _trackingServerSecure : _trackingServer,
            port: secure? 8080 : 80,
            path: '/b/ss//6',
            method: 'POST',
            agent: _adobeAnalyticsHttpAgent,
            headers: {
                'Cookie': "cookie",
                'Content-Type': 'text/xml',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        var req;
        try {
            req = http.request(call_options, function(res) {
                var buffer = "";
                res.on("data", function(data) {
                    buffer = buffer + data;
                });
                res.on("end", function(data) {
                    console.log(buffer);
                });
            });
            req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
            });
            req.write(body);
        } catch (e) {
            console.error("Unable to make call to DI API");
            console.error(e);
        } finally {
            req.end();
        }
    }
    ;
    function _validateValidDiParameters(diData) {
        Object.keys(diData).forEach(function(key) {
            var fetchTest = _parameters[key];
            if (!fetchTest) {
                var isMulti = _isMultiform(key);
                if (isMulti) {
                    return true;
                } else {
                    throw new Error("Passed reporting property name " + key + " is invalid");
                }
            }
        });
    }
    function _getSpropsFromDiParameters(diData) {
        var propsReturn = {};
        Object.keys(diData).forEach(function(key) {
            if (key.startsWith(_parameters.prop.postParam)) {
                propsReturn[key] = diData[key];
            }
        });
        return propsReturn;
    }
    function _getEvarsFromDiParameters(diData) {
        var evarReturn = {};
        Object.keys(diData).forEach(function(key) {
            if (key.startsWith(_parameters.eVar.postParam)) {
                evarReturn[key] = diData[key];
            }
        });
        return evarReturn;
    }
    function DataInsertion(data) {
        _validateValidDiParameters(data);
        if (_persistPageName && (typeof data[_parameters.pageName.postParam] != 'undefined')) {
            _pageName = data[_parameters.pageName.postParam];
        } else if (_persistPageName && (typeof data[_parameters.pageName.postParam] == 'undefined') && (_pageName != null)) {
            data[_parameters.pageName.postParam] = _pageName;
        }
        if (_persistReportingSuiteId && (typeof data[_parameters.reportSuiteID.postParam] != 'undefined')) {
            _reportingSuiteId = data[_parameters.reportSuiteID.postParam];
        } else if (_persistReportingSuiteId && (typeof data[_parameters.reportSuiteID.postParam] == 'undefined') && (_reportingSuiteId != null)) {
            data[_parameters.reportSuiteID.postParam] = _reportingSuiteId;
        }
        if (_persistEvars) {
            var callEvars = _getEvarsFromDiParameters(data);
            var mergedEvars = _.extend(_eVars, callEvars);
            _eVars = mergedEvars;
            data = _.extend(data, mergedEvars);
        }
        if (_persistSProps) {
            var callSprops = _getSpropsFromDiParameters(data);
            var mergedSprops = _.extend(_sProps, callSprops);
            _sProps = mergedSprops;
            data = _.extend(data, mergedSprops);
        }
        if ((typeof data.reportSuiteID == 'undefined') && (_reportingSuiteId == null)) {
            throw new Error('reportSuiteID is required');
        } else {
            data['reportSuiteID'] = data.reportSuiteID || _reportingSuiteId;
        }
        if (typeof data.IPaddress == 'undefined') {
            if ((typeof _defaultIpAddress != 'undefined') && (_defaultIpAddress != null)) {
                data['IPaddress'] = _defaultIpAddress;
            }
        }
        if ((typeof data.visitorID == 'undefined') && (typeof data.IPaddress == 'undefined')) {
            throw new Error('visitorID OR IPaddress must be defined');
        }
        if ((typeof data.pageName == 'undefined') && (typeof data.pageURL == 'undefined')) {
            throw new Error('pageName OR pageURL must be defined');
        }
        this.getPostXmlRequestBody = function() {
            var xmlString = "";
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    xmlString += "<" + property + ">" + data[property] + "</" + property + ">";
                }
            }
            return xmlString;
        };
        this.getRequestPropsAsJson = function() {
            return JSON.stringify(data, null, 2);
        };
    }
    ;
    var AdobeAnalyticsHelper = {
        evars: _eVars,
        sprops: _sProps,
        linkType: {
            "CUSTOM": "o",
            "EXIT": "e",
            "DOWNLOAD": "d"
        },
        recordEvent: function() {},
        setReportingSuiteId: function(reportingSuiteId) {
            _reportingSuiteId = reportingSuiteId;
        },
        getReportingSuiteId: function() {
            return _reportingSuiteId;
        },
        getDataInsertion: function(diData) {
            return new DataInsertion(diData);
        },
        sendCallToAdobeAnalytics: function(di) {
            if (di instanceof DataInsertion) {
                _sendCallToAdobeAnalytics(di);
            } else {
                throw new Error('di parameter passed is not an instance of DataInsertion. Please use getDataInsertion to get a new object instance to pass.');
            }
        },
        sendToAdobeAnalytics: function(myDataObject) {
            var myDi = self.getDataInsertion(myDataObject);
            self.sendCallToAdobeAnalytics(myDi);
        },
        getMaxSockets: function() {
            return _adobeAnalyticsHttpAgent.maxSockets;
        },
        setMaxSockets: function(max) {
            _adobeAnalyticsHttpAgent.maxSockets;
        },
        getDiParameters: function() {
            return _parameters;
        }
    };
    var self = module.exports = AdobeAnalyticsHelper;
})(require('buffer').Buffer, require('process'));
