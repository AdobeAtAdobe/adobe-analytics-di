var should = require('chai').should();
var adobeAnalyticsHelper = require('../index')


it('should create a submission package', function () {
    var callData = {
        visitorID: '301334FA53DB0A850A490D44@AdobeOrg',
        pageName: 'My Home Page',
        channel: 'My Channel name',
        eVar10: 'test evar10 value',
        prop10: 'test prop10 value',
        events: "event10,event11"
    };


    console.log(adobeAnalyticsHelper.testReturn());

    adobeAnalyticsHelper.pushAdobe();

});