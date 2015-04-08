# adobe-analytics-di
Adobe Analytics aka SiteCatalyst data insertion module for Node.js<br/>
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


