# adobe-analytics-di
Adobe Analytics aka SiteCatalyst data insertion module for Node.js<br/>
This module allows you to push data into your Adobe Analytics reporting suite from the server side.  It uses the Data Insertion API to push your data in.

## Installation

  npm install adobe-analytics-di --save

<br/>
USE Example<br/>
Setup<br/>
```javascript
var adobeAnalyticsHelper = require('adobe-analytics-di');<br/>
adobeAnalyticsHelper.setReportingSuiteId("MY-REPORTING-SUITE-ID");<br/>
```
<br/>
Send data to Adobe Analytics<br/>
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