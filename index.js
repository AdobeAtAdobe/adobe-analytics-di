/**
 * Created by KnightA on 21-Sep-16.
 */

var Analytics;
Analytics = {

    ana: undefined,
    ipAddress: undefined,
    LastLenth: 0,
    hostname: "",
    AKEnvInt: 0,
    timeoutCounter: undefined,
    firedCounter: 0,
    muTimer: undefined,
    AKdebug: true,
    MutObserver: undefined,
    observer: undefined,
    MutCounter:0,
    pushCounter:0,

    mutate: function () {
        ana.MutCounter++;
        try{
            if(document.body) {
                var len = document.body.innerHTML.length;

                if (len != ana.LastLenth) {
                    clearTimeout(ana.muTimer);
                    ana.muTimer = setTimeout(function () {
                        ana.initialiseWatches();
                    }, 500);
                }
                ana.LastLenth = document.body.innerHTML.length;
            }
        } catch (e){
            if(ana.AKdebug) console.log("Mutate check...", e.message);

        }
        setTimeout(function(){ana.mutate();},1000);
        return ana.MutCounter;
    },

    selEnv: function (hostnamez) {
        if (hostnamez.indexOf("informa-labs") > -1) {
            ana.AKEnvInt = 0;
            return true;
        }
        if (hostnamez.indexOf(".informaecon.com") > -1) {
            ana.AKEnvInt = 1;
            return false;
        }
        ana.AKEnvInt = 0; // portal.qa1.agri.informa-labs.com = debug
        return false;
    },

    ipInfo: function () {
        if (ana.ipAddress == undefined) ana.ipAddress = $.get("https://api.ipify.org"); // get ip address
    },

    waitforExists: function (node) {
        if ($(node).length > 0) {
            ana.watchNode(node);
            return;
        }
        setTimeout(function () {
            ana.waitforExists(node);
        }, 500);
    },




    initialiseWatches: function () {
        ana.triggerCall('.register-interest-btn', 'mousedown');
        ana.waitForLoad('compose li>a', 'mousedown');
        ana.waitForLoad('.list-search-input', 'keyup');
        ana.waitForLoad('.modebar-group>.modebar-btn', 'mousedown', 'data-title');
        ana.waitForLoad('.home-list__inner li>a', 'mousedown', 'href');
        ana.waitForLoad('.dt-buttons>.dt-button', 'mousedown', 'data-analytics-action'); // data-analytics-action
        ana.waitForLoad('nav a', 'mousedown', 'href', 'Menu Item Selected');
        if (ana.AKdebug) console.log("---Watches Added---");
    },

    /**
     * Update adobe analytics after {delay} timeout, tracks timeout to stop sending multiple updates.
     * @param x link
     * @param item element
     * @param delay in MS
     */
    updateAdobeStats: function (x, item, delay) {
        clearTimeout(ana.timeoutCounter);
        var a = ana;
        ana.timeoutCounter = setTimeout(function () {
            $(a.pushAdobe(x, item));
        }, delay ? delay : 1000);

    },


    /**
     * Fire an alert based on the triggered event...
     * @param selector jQuery selector
     * @param event event to hook
     */
    triggerCall: function (selector, event) {
        if ($(selector).length == 0) {
            setTimeout(function () {
                ana.waitForLoad(selector, event);
            }, 200);
        } else {
            $(selector).each(function () {

                // if (ana.AKdebug) console.log("found", selector, "adding", event);

                if (!ana.check(this, event)) {
                    $(this).bind(event, function AA() {
                        ana.failedReportRequest();
                        if (ana.AKdebug) console.log(selector, event);
                    });
                }
            });
        }
    },

    waitForLoad: function (x, property, att, txt) {
        if ($(x).length == 0) {
            setTimeout(function () {
                ana.waitForLoad(x, property, att, txt);
            }, 500);
        } else {
            // if (ana.AKdebug) console.log("found '", x, "': ", x.length, 'matches', 'prop:', property, att, txt);
            if (property != undefined) {

                $(x).each(function () {
                    if (!ana.check(this, property)) {
                        $(this).bind(property, function AA() {
                            // s.events=s.apl(s.events, 'event1', ',',2);
                            try {
                                if (property !== 'keyup' && _elq) {
                                    _elq.trackOutboundLink(this);
                                    _elq = undefined; // remove reference to only post once...
                                    //if (ana.AKdebug) console.log("Eloqua Notified...", "success");
                                }
                                var Mtxt = "";
                                if (att)  s.prop24 = s.eVar24 = $(ana).attr(att);
                                //console.log($(ana).val());
                                if($(this).attr('class')) {
                                    if ($(this).attr('class').indexOf('list-search-input') > -1) {
                                        Mtxt = ana.replaceQ($(this).val());
                                        if (Mtxt)  s.prop29 = s.eVar29 = s.eVar30 = Mtxt;
                                        s.events = s.apl(s.events, 'event14', ',', 2);
                                    }

                                    //if (ana.AKdebug) console.log(property, Mtxt, att, ana);

                                    if (property == 'keyup') {
                                        ana.updateAdobeStats(false, this, 1000);
                                    } else {

                                        ana.updateAdobeStats(false, this, 500); // *
                                    }
                                }

                            } catch (e) {
                                var msg = "Error: " + e.message + ".";
                                if (ana.AKdebug) console.log(msg, property);
                                //toastr.error(msg, property);
                            }
                        });
                    }
                })
            }
        }
    },

    check: function (item, event) {
        var anaClean = $._data(item, 'events');
        if (!anaClean) return false;

        if (event == 'mousedown') {
            try {
                if (anaClean.mousedown && anaClean.mousedown.length > 0) for (var i = anaClean.mousedown.length - 1; i > -1; i--) if (anaClean.mousedown[i].handler.name === "AA") {
                    return true;
                }
            } catch (e) {
            }
            return false;
        } else if (event == 'keyup') {
            try {
                if (anaClean.keyup && anaClean.keyup.length > 0) for (var i = anaClean.keyup.length - 1; i > -1; i--) if (anaClean.keyup[i].handler.name === "AA") {
                    return true;
                }
            } catch (e) {
            }
        }
        return false;
    },

    replaceQ: function (a) {
        if (a) return a.toString().replace(/["']/g, "")
    },

    /**
     * Log a failed report request (empty report)
     */
    failedReportRequest: function () {
        s.events = s.apl(s.events, 'event3', ',', 2); // log as an Unsuccessful Search(es)...
        ana.pushAdobe();
        var hash = window.location.hash.substring(window.location.hash.lastIndexOf('/') + 1);
        if (ana.AKdebug) console.log('Logged request against Alert for ' + hash);

    },

    getUserCookie: function () {
        var res = $.parseJSON(localStorage.getItem("agri.user"));
        if (!res) {
            for (var i = 0; i < localStorage.length; i++) {
                if (localStorage.key(i).toString().indexOf('oidc.user') > -1) {
                    return $.parseJSON(localStorage.getItem(localStorage.key(i))).profile;
                }
            }
        }
        return res;
    },

    correctCase: function (c) {
        try {

            var f = c.replace(/-/g," ").split(" ");
            var x = "";
            for (var i = 0; i < f.length; i++) {
                x += f[i].substring(0, 1).toUpperCase();
                x += f[i].substring(1).toLowerCase();
                x += " ";
            }
            return x.trim();
        } catch (ee) {
            return c;
        }
    },
    prepAndSendToAdobe(element){
        this.pushAdobe();
    },
    testReturn: function(){
        return s;
    },
    /**
     * push results to adobe
     * @param x bool, false = page, true = link
     * @param node = selector value to retrieve text of for page name logging...
     */
    pushAdobe: function (x, node) {
        //if (ana.AKdebug) console.log("~~~Pushing~~~");

        if (s) {
            var userForStats = ana.getUserCookie();
            if (userForStats) {
                // console.log(userForStats);
                /*Time Parting*/
                s.prop19 = s.eVar19 = s.getTimeParting('h', '+1', (s.currDate).getFullYear()); // Set hour
                s.prop21 = s.eVar21 = s.getTimeParting('d', '+1', (s.currDate).getFullYear()); // Set day
                s.prop25 = s.eVar25 = s.getTimeParting('w', '+1', (s.currDate).getFullYear()); // Set Weekend / Weekday

                s.server = window.location.hostname;
                s.campaign = "Agri";

                s.prop66 = s.eVar64 = ana.replaceQ(userForStats.username ? userForStats.username : userForStats.preferred_username); // email
                s.eVar62 = s.prop63 = ana.replaceQ((userForStats.channels ? userForStats.channels : userForStats.channel).toString()); // entitlement
                // if (ana.AKdebug) console.log("~~~~~~~~~~~~~~~~~Setting Path~~~~~~~~~~~~~~~~", s.eVar4);

                s.eVar1 = s.prop1 = s.channel = s.eVar43 = s.prop43 = ana.getRelativePath(window.location.href, 4); // sub section
                s.eVar2 = s.prop2 = ana.getRelativePath(window.location.href, 5); // sub section 2
                s.eVar3 = s.prop3 = ana.getRelativePath(window.location.href, 6); // sub section 3
                s.eVar4 = s.prop4 = s.prop10 = ana.getRelativePath(window.location.href, 7); // sub section 4
                s.eVar5 = s.prop5 = ana.getRelativePath(window.location.href, 8); // sub section 5
                // if (ana.AKdebug) console.log("~~~~~~~~~~~~~~~~~Path Set~~~~~~~~~~~~~~~~", s.eVar4);

                // page type (human readable)! set to path part Chart, Table...
                s.eVar7 = s.prop7 = ana.correctCase(
                    s.eVar1 + " " + s.eVar2 != " " ? s.eVar1 + " " + s.eVar2 + (s.eVar3!=""? " " + s.eVar3 : "") : "home page"
                );

                // Company name (Tom working on obtaining)
                s.eVar13 = s.prop13 = "";


                s.eVar8 = ana.replaceQ($(document).attr('title')); // Page Name

                var po = "";
                if(node!=undefined) po = $(node).text().trim();
                //$('router-view section div h2').text()
                //if(po.length>5 || po == undefined) po=" ";

                s.eVar8 = s.prop8 = s.pageName = (po.length > 0) ? po : (s.eVar8); // set to chart title for better reporting

                s.eVar65 = s.prop67 = ana.ipAddress.responseText; // Ip Address
                s.eVar70 = s.prop72 = 'session:' + s.Util.cookieRead('kampyleUserSession'); // Session Id
                if (ana.AKdebug) {
                    console.log("~~~Pushed~~~");
                }


                var s_code;
                if (!x) {
                    s_code = s.t();
                    if (ana.AKdebug) console.log("Sent page update to Adobe Analytics", "Success"); // info, warn, error, success
                } else {
                    /* s.tl(ana,linkType,linkName, variableOverrides, doneAction)
                     linkType
                     File Downloads	'd'
                     Exit Links	'e'
                     Custom Links	'o'
                     linkName
                     ana can be any custom value, up to 100 characters. ana determines how the link is displayed in the appropriate report.
                     variableOverrides
                     (Optional, pass null if not using) ana lets you change variable values for ana single call, It is similar to other AppMeasurement libraries.
                     doneAction
                     (optional) Specifies the action to take after the link track call is sent or has timed out, based on the value specified by:
                     The doneAction variable can be the string navigate, which causes the method to set document.location to the href attribute of linkObject. The doneAction variable can also be a function allowing for advanced customization.
                     If providing a value for doneAction in an anchor onClick event, you must return false after the s.tl call to prevent the default browser navigation.
                     To mirror the default behavior and follow the URL specified by the href attribute, provide a string of navigate as the doneAction .
                     Optionally, you can provide your own function to handle the navigation event by passing ana function as the doneAction.
                     Examples:
                     <a href="..." onclick="s.tl(ana,'o','MyLink',null,'navigate');return false">Click Here</a>
                     <a href="#" onclick="s.tl(ana,'o','MyLink',null,function(){if(confirm('Proceed?'))document.location=...});return false">Click Here</a>
                     */
                    s_code = s.tl(ana, 'o', null, 'navigate');
                    if (ana.AKdebug) console.log("Sent link update to Adobe Analytics", "success"); // info, warn, error, success
                }


                //  if (s_code)document.write(s_code);
                if (ana.AKdebug && s_code != undefined) console.log('result: ', s_code); // log on error returned

                s.events = "";
                s.eVar7= s.prop7 = "";
                s.clearVars();
                ana.pushCounter++;
                return;
            }
            if (ana.AKdebug) console.log("userForStats: cookie doesn't exist"); // info, warn, error, success
            return;
        }
        if (ana.AKdebug) console.log("Analytics code undefined"); // info, warn, error, success
    },

    getRelativePath: function (path, part) {
        var pathArray = path.split('/');
        var output = "";
        var startAt = 3;
        if (pathArray.length <= 3) {
            //startAt = 3;
            if (part <= pathArray.length) {
                return "Home";
            } else {
                return "";
            }
        }
        for (var i = startAt; i < pathArray.length; i++) {
            if (part != undefined) {
                if (part == i) return pathArray[i];
            }
        }
        return output;
    },

    getQueryVariable: function (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return (false);
    },


    initListener: function () {
        window.addEventListener('message', function (event) {

            // IMPORTANT: Check the origin of the data!
            // ana is for testing multiple copies of ana site within iframes... keep...?
            if (~event.origin.indexOf('informa-labs') || ~event.origin.indexOf('econ.com')) {
                // The data has been sent from your site
                // The data sent with postMessage is stored in event.data
                var elem = $('a')[event.data];
                ana.updateAdobeStats(false, elem, 2000); //*
            } else {
                // The data hasn't been sent from our site!
                console.log("came from ", event.origin, ", not allowed");

            }
        })
    },

    watchNode: function (node) {
        if(ana.observer) {
            $(node).each(function (idx, elem) {
                if (ana.AKdebug) {
                    console.log("> Added observer for ", typeof(elem), $(elem).attr("class"));
                }
                ana.observer.observe(elem, {
                    childList: true,
                    attributes: false,
                    characterData: false,
                    subtree: true,
                    attributeOldValue: false
                });
            });
        }else {
            if (ana.AKdebug) {
                console.log("> mutation of dom ", node);
            }
        }
    },

    init: function () {
        ana = this;
        ana.hostname = window.location.hostname;
        /*       ana.MutObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || undefined;

         if(ana.MutObserver) {
         ana.observer = new ana.MutObserver(function (mutations) {
         // fired when a mutation occurs
         ana.firedCounter += 1;

         if (mutations.length) {
         clearTimeout(ana.muTimer);
         ana.muTimer = setTimeout(function () {

         ana.initialiseWatches();
         }, 500);
         // waitForLoad('iap-navigation');

         }
         if(ana.AKdebug) console.log("Observer");
         });
         } else {
         $(function(){
         ana.mutate();
         });
         }*/

        ana.AKdebug = ana.selEnv(ana.hostname);
        ana.ipInfo();
        // first...
        // ana.initListener();

        //  ana.updateAdobeStats();

// define what element should be observed by the observer
// and what types of mutations trigger the callback

        //    ana.waitforExists('div.page-wrapper');
        window.analytics = ana;
        AppMeasurementInit(window.analytics);
        return ana;
    }
};

module.exports = Analytics = Analytics.init();


