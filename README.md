# adobe-analytics-di
![TrackingImage](https://adobeatadobe.d1.sc.omtrdc.net/b/ss/adbeaaagit/1/H.27.5--NS/0?AQB=1&ndh=1&ce=UTF-8&ns=adobeatadobe&pageName=github%3Aadobe-analytics-di%3Areadme&g=%2FAdobeAtAdobe%2Fadobe-analytics-di&ch=github)
Adobe Analytics aka SiteCatalyst data insertion module for Node.js<br/>
This module allows you to push data into your Adobe Analytics reporting suite from the server side.  It uses the Data Insertion API to push your data in.

## Installation

  npm install adobe-analytics-di --save

Example
Setup the analytics di api

```javascript
var adobeAnalyticsHelper = require('adobe-analytics-di');
adobeAnalyticsHelper.setReportingSuiteId("MY-REPORTING-SUITE-ID");
```

Send data to Adobe Analytics. Note that the property names are case sensitive because they get used in the XML sent to the DI API
```javascript
var callData = {
      visitorID: 'myvisitorId',
      pageName: 'My Home Page',
      channel: 'My Channel name',
      eVar10: 'test evar10 value',
      prop10: 'test prop10 value',
      events: "event10,event11"
    };

var myDi = adobeAnalyticsHelper.getDataInsertion(callData);

if (myDi != null) {
    adobeAnalyticsHelper.sendCallToAdobeAnalytics(myDi);
}
```

## Tests

  npm test


## Release History

* 1.0.0 Initial release
* 1.0.1 Added missing dependency
* 1.0.2 Updated the README
* 1.0.3 Updated the README to remove the html formatting from the code section
* 1.0.4 Updated the keywords
