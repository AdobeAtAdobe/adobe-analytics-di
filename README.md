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
      visitorID: message.user.uid,
      pageName: message.collectionPoint.friendlyGroupName,
      channel: message.collectionPoint.reportingChannel,
      eVar10: message.collectionPoint.friendlyGroupName,
      prop10: message.collectionPoint.friendlyGroupName,
      eVar11: message.event,
      prop11: message.event,
      eVar12: message.clientId,
      prop12: message.clientId,
      eVar13: message.eventTime,
      prop13: message.eventTime,
      events: "event10,event11"
    };

var myDi = adobeAnalyticsHelper.getDataInsertion(callData);

if (myDi != null) {
    adobeAnalyticsHelper.sendCallToAdobeAnalytics(myDi);
}
```


