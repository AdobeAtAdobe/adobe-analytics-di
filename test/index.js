var should = require('chai').should();
var adobeAnalyticsHelper = require('../index')

it('should set reporting suite ID', function () {
    adobeAnalyticsHelper.setReportingSuiteId("MY-REPORTING-SUITE-ID");
    adobeAnalyticsHelper.getReportingSuiteId().should.equal("MY-REPORTING-SUITE-ID")
});

it('should set reporting suite ID', function () {
    adobeAnalyticsHelper.setTrackingServerUrl("custom.tracking.com");
    adobeAnalyticsHelper.getTrackingServerUrl().should.equal("custom.tracking.com")
});

it('should create a DI xml object to post (using visitorID)', function () {
    var callData = {
        visitorID: 'myvisitorId',
        pageName: 'My Home Page',
        channel: 'My Channel name',
        eVar10: 'test evar10 value',
        prop10: 'test prop10 value',
        events: "event10,event11",
        referrer: adobeAnalyticsHelper.getReportingSuiteId()
    };

    var testResult = '<visitorID>myvisitorId</visitorID><pageName>My Home Page</pageName><channel>My Channel name</channel><eVar10>test evar10 value</eVar10><prop10>test prop10 value</prop10><events>event10,event11</events><referrer>MY-REPORTING-SUITE-ID</referrer><reportSuiteID>MY-REPORTING-SUITE-ID</reportSuiteID>';

    var myDi = adobeAnalyticsHelper.getDataInsertion(callData);

    myDi.getPostXmlRequestBody().should.equal(testResult);
});

it('should create a DI xml object to post (using ipaddress)', function () {
    var callData = {
        ipaddress: '127.0.0.1',
        pageName: 'My Home Page',
        channel: 'My Channel name',
        eVar10: 'test evar10 value',
        prop10: 'test prop10 value',
        events: "event10,event11",
        referrer: adobeAnalyticsHelper.getReportingSuiteId()
    };

    var testResult = '<ipaddress>127.0.0.1</ipaddress><pageName>My Home Page</pageName><channel>My Channel name</channel><eVar10>test evar10 value</eVar10><prop10>test prop10 value</prop10><events>event10,event11</events><referrer>MY-REPORTING-SUITE-ID</referrer><reportSuiteID>MY-REPORTING-SUITE-ID</reportSuiteID>';

    var myDi = adobeAnalyticsHelper.getDataInsertion(callData);

    myDi.getPostXmlRequestBody().should.equal(testResult);
});