var Base = require('../utils/res/js/Base')
var forcetk;
var refreshtokenCount = 0;
if (forcetk === undefined) {
    forcetk = {};
}
var AppId=getApp().AppId
var AgentId =getApp().AgentId
var code =getApp().code
var domain = getApp().domain
var sessionKey = getApp().sessionKey
var activedAgentIdSessionKey =getApp().activedAgentIdSessionKey
var keyPrefix = getApp().keyPrefix
var errorKey = getApp().errorKey
var localKey = getApp().localKey
var retry=0;

if (forcetk.Client === undefined) {

    /**
     * The Client provides a convenient wrapper for the Force.com REST API,
     * allowing JavaScript in Visualforce pages to use the API via the Ajax
     * Proxy.
     * @param [clientId=null] 'Consumer Key' in the Remote Access app settings
     * @param [loginUrl='https://login.salesforce.com/'] Login endpoint
     * @param [proxyUrl=null] Proxy URL. Omit if running on Visualforce or
     *                  PhoneGap etc
     * @constructor
     */
    forcetk.Client = function () {
        'use strict';
        this.sessionId = null;
        this.apiVersion = null;
        this.instanceUrl = null;
        this.authzHeader = "Authorization";
        this.asyncAjax = true;
        this.refreshtokenProxyUrl = null;
        this.openId = null;
        this.sourceId = null;
        this.sfdcUserId = null;
        this.weqyUserId = null;
    };

    /**
     * Set a session token and the associated metadata in the client.
     * @param sessionId a salesforce.com session ID. In a Visualforce page,
     *                   use '{!$Api.sessionId}' to obtain a session ID.
     * @param [apiVersion="v29.0"] Force.com API version
     * @param [instanceUrl] Omit this if running on Visualforce; otherwise
     *                   use the value from the OAuth token.
     */
    forcetk.Client.prototype.setSessionToken = function (sessionId, apiVersion, instanceUrl) {
        'use strict';
        this.sessionId = sessionId;
        this.apiVersion = (apiVersion === undefined || apiVersion === null)
            ? 'v29.0' : apiVersion;
        if (instanceUrl === undefined || instanceUrl === null) {
            this.visualforce = true;

            // location.hostname can be of the form 'abc.na1.visual.force.com',
            // 'na1.salesforce.com' or 'abc.my.salesforce.com' (custom domains). 
            // Split on '.', and take the [1] or [0] element as appropriate
            var elements = location.hostname.split("."),
                instance = null;
            if (elements.length === 4 && elements[1] === 'my') {
                instance = elements[0] + '.' + elements[1];
            } else if (elements.length === 3) {
                instance = elements[0];
            } else {
                instance = elements[1];
            }

            this.instanceUrl = "https://" + instance + ".salesforce.com";
        } else {
            this.instanceUrl = instanceUrl;
        }
    };

    /**
     * 设置RefreshTokenProxy，AccessToken失效后会调用RefreshTokenProxy刷新AccessToken
     */
    forcetk.Client.prototype.setRefreshTokenProxy = function (openId, weqyUserId, sourceId, refreshtokenProxyUrl,sfdcUserId) {
        'use strict';
        this.openId = openId;
        this.weqyUserId = weqyUserId;
        this.sourceId = sourceId;
        this.refreshtokenProxyUrl = refreshtokenProxyUrl;
        this.sfdcUserId = sfdcUserId;
    }

    /**
     * 调用RefreshTokenProxy刷新AccessToken
     */
    forcetk.Client.prototype.refreshAccessTokenByProxy = function (callback, error) {
        'use strict';
        //失败去刷新sftoken
        let res = dd.getStorageSync({ key: localKey });
        // context = JSON.parse(res.data.contextStr);
        var context=res.data.contextStr
        var url = context.RefreshTokenProxyUrl + '?openId=' + context.OpenId + '&WEQYUserId=' + 'weqyUserId' + '&SourceId=' + context.AppId + '&SFDCUserId=' + context.SFDCUserId;
        dd.httpRequest({
          headers: {
            "Content-Type": "application/json",
          },
          url: url,
          method: 'get',
          data: {},
          dataType: 'json',
          success: function(res) {
            context.SessionId = res.data.access_token;
            Base.SetContext(context);
            
            return callback;

          },
          fail: function(res) {
          },
          complete: function(res) {
          }
        });
    };
    /*
     * Low level utility function to call the Salesforce endpoint.
     * @param path resource path relative to /services/data
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     * @param [method="GET"] HTTP method for call
     * @param [payload=null] payload for POST/PATCH etc
     */
    forcetk.Client.prototype.ajax=function(path, callback, error, method, payload, dataType) {
        'use strict';
        let res = dd.getStorageSync({ key: localKey });
        if(res.data==null){
            return;
        }
        var context=res.data.contextStr
        var _this=this;
        var thisurl= context.InstanceUrl+'/services/apexrest/'+path
        if(typeof(dataType) == "undefined"){
            thisurl= context.InstanceUrl+'/services/data'+path
            method='GET'
        }
        if(method=='GET'||method=='get'){
            dd.httpRequest({
                headers: {
                    "Authorization": 'Bearer '+context.SessionId
                },
                url: thisurl,
                method: 'GET',
                data: payload,
                dataType: dataType,
                success: callback,
                fail: function(res) {
                    if(res.status==401){//401
                        if(retry<3){
                            retry++
                            client.refreshAccessTokenByProxy(client.ajax(path, callback, error, method, payload, dataType))
                        }else{
                            retry=0;
                            return;
                        }
                    }
                    return error(res);
                    
                },
                complete: function(res) {
                }
                });
        }else{
            dd.httpRequest({
                headers: {
                    "Content-Type":"application/json",
                    "Authorization": 'Bearer '+context.SessionId
                },
                url: thisurl,
                method: 'POST',
                data: 
                    JSON.stringify({
                        payload
                    }),
                dataType: dataType,
                success: callback,
                fail: function(res) {
                     if(res.status==401){//401
                        if(retry<3){
                            retry++
                            client.refreshAccessTokenByProxy(client.ajax(path, callback, error, method, payload, dataType))
                        }else{
                            retry=0;
                            return;
                        }
                    }
                    return error(res);
                    
                },
                complete: function(res) {
                }
                });
        }
    };

    // Local utility to create a random string for multipart boundary
    var randomString = function () {
        'use strict';
        var str = '',
            i;
        for (i = 0; i < 4; i += 1) {
            str += (Math.random().toString(16) + "000000000").substr(2, 8);
        }
        return str;
    };

    /*
     * Low level utility function to call the Salesforce endpoint specific for Apex REST API.
     * @param path resource path relative to /services/apexrest
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     * @param [method="GET"] HTTP method for call
     * @param [payload=null] string or object with payload for POST/PATCH etc or params for GET
     * @param [paramMap={}] parameters to send as header values for POST/PATCH etc
     * @param [retry] specifies whether to retry on error
     */
    forcetk.Client.prototype.apexrest = function (path, callback, error, method, payload, dataType) {
        this.ajax(path, callback, error, method, payload, dataType) 
    };

    /*
     * Creates a new record of the given type.
     * @param objtype object type; e.g. "Account"
     * @param fields an object containing initial field names and values for 
     *               the record, e.g. {:Name "salesforce.com", :TickerSymbol 
     *               "CRM"}
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.create = function (objtype, fields, callback, error) {
        'use strict';
        return this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/',
            callback, error, "POST", JSON.stringify(fields));
    };

    /*
     * Retrieves field values for a record of the given type.
     * @param objtype object type; e.g. "Account"
     * @param id the record's object ID
     * @param [fields=null] optional comma-separated list of fields for which 
     *               to return values; e.g. Name,Industry,TickerSymbol
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.retrieve = function (objtype, id, fieldlist, callback, error) {
        'use strict';
        if (arguments.length === 4) {
            error = callback;
            callback = fieldlist;
            fieldlist = null;
        }
        var fields = fieldlist ? '?fields=' + fieldlist : '';
        return this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/' + id
            + fields, callback, error);
    };

    /*
     * Upsert - creates or updates record of the given type, based on the 
     * given external Id.
     * @param objtype object type; e.g. "Account"
     * @param externalIdField external ID field name; e.g. "accountMaster__c"
     * @param externalId the record's external ID value
     * @param fields an object containing field names and values for 
     *               the record, e.g. {:Name "salesforce.com", :TickerSymbol 
     *               "CRM"}
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.upsert = function (objtype, externalIdField, externalId, fields, callback, error) {
        'use strict';
        return this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/' + externalIdField + '/' + externalId
            + '?_HttpMethod=PATCH', callback, error, "POST", JSON.stringify(fields));
    };

    /*
     * Updates field values on a record of the given type.
     * @param objtype object type; e.g. "Account"
     * @param id the record's object ID
     * @param fields an object containing initial field names and values for 
     *               the record, e.g. {:Name "salesforce.com", :TickerSymbol 
     *               "CRM"}
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.update = function (objtype, id, fields, callback, error) {
        'use strict';
        return this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/' + id
            + '?_HttpMethod=PATCH', callback, error, "POST", JSON.stringify(fields));
    };

    /*
     * Deletes a record of the given type. Unfortunately, 'delete' is a 
     * reserved word in JavaScript.
     * @param objtype object type; e.g. "Account"
     * @param id the record's object ID
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.del = function (objtype, id, callback, error) {
        'use strict';
        return this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/' + id,
            callback, error, "DELETE");
    };

    /*
     * Executes the specified SOQL query.
     * @param soql a string containing the query to execute - e.g. "SELECT Id, 
     *             Name from Account ORDER BY Name LIMIT 20"
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.query = function (soql, callback, error) {
        'use strict';
        return this.ajax('/' + this.apiVersion + '/query?q=' + encodeURIComponent(soql),
            callback, error);
    };
}


//实例化forcetk
var client = new forcetk.Client();
//console.log("SFDCAPI",context);
//设置SessionToken
var InstanceUrl;
// if (context.EnableReverseProxy) {
//     InstanceUrl = context.ReverseProxyUrl;
// }
// else {
//     InstanceUrl = context.InstanceUrl;
// }



function ajax(path, callback, error, method, payload, dataType){
    init()
    client.ajax(path, callback, error, method, payload, dataType)
}
function query(soql, callback, error){
    init()
    return client.query(soql, callback, error)
}
function retrieve(objtype, id, fieldlist, callback, error){
    init()
    return client.retrieve(objtype, id, fieldlist, callback, error)
}
function init(){
    let res = dd.getStorageSync({ key: localKey });
    if(res.data==null||res.data.contextStr==null||res.data.contextStr.sessionId==null||res.data.contextStr.sessionId==''){
        Base.GetContext()
        return;
    }
    // context = JSON.parse(res.data.contextStr);
    var context=res.data.contextStr
    InstanceUrl = context.InstanceUrl;
    client.setSessionToken(context.SessionId, context.ApiVersion, InstanceUrl);
    //client.setSessionToken(context.SessionId, context.ApiVersion, "https://p.veevlink.com");

    //设置RefreshTokenProxy，AccessToken失效后会调用RefreshTokenProxy刷新AccessToken
    //client.setRefreshTokenProxy(context.OpenId, context.AppId, context.RefreshTokenProxyUrl,context.SFDCUserId);
    client.setRefreshTokenProxy(context.OpenId, context.WEQYUserId, context.AppId, context.RefreshTokenProxyUrl, context.SFDCUserId);
}

module.exports ={
  ajax:ajax,
  query:query,
}