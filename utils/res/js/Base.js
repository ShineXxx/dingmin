
var context = {
  OpenId: "",
  WEQYUserId: ""
};

var AppId=getApp().AppId
var AgentId =getApp().AgentId
var code =getApp().code
var domain = getApp().domain
var sessionKey = getApp().sessionKey
var activedAgentIdSessionKey =getApp().activedAgentIdSessionKey
var keyPrefix = getApp().keyPrefix
var errorKey = getApp().errorKey
var localKey = getApp().localKey

function GetContext() {

  var IsTest = false;

  /**********************以下代码部署到微信环境可以删除******************************/
  if (IsTest) {
    context.AppId = "wxf6176dca48afed40";
    context.SessionId = "00DO000000550Y5!ARkAQIcdblyQIHsbRtI9oX42k.oBo.6Zb4l1KT6Qtx2WlxOT1KZ8z60r5t8g1Pxi2roN9klRUYyluBxZSMayxGHopA7UZtag";
    context.OpenId = "o3GBrs_nSWBqxZ8sCYPpg4d1W-TY";
    context.ApiVersion = "v37.0";
    context.InstanceUrl = "https://cs5r.veevlink.com";
    context.RefreshTokenProxyUrl = "https://dev.veevlink.com/Proxy/SFDCAccessTokenProxy.aspx";
    context.ShowDevError = true;
    context.Domain = "test.veevlink.com";
    context.WEQYUserId = "luby";
    context.SFDCUserId = "";
    context.JSAPITicket = '88888';
    return;
  }
  /**********************以上代码部署到微信环境可以删除******************************/

  if (code == null) {
  }
  //如果code不为空，说明是第一次进行身份认证，微信会带着code返回本页面
  else {
    //拼接localKey
    localKey = keyPrefix + AppId;
    if(AgentId!=null)
    {
      localKey = keyPrefix + AppId + "_" + AgentId;
    }
    let res = dd.getStorageSync({ key: localKey });
    if (res.data ==null||res.data.contextStr==null||res.data.contextStr=='') {
    //获取state参数，暂时没用到
    var state ="state"
    //动态获取当前url中的protocol和host，
    //var url = window.location.protocol + "//" + window.location.host;
    //拼接进行身份认证服务的url
    var BaseUrl = domain + "/Ding_Base.aspx";
    dd.getAuthCode({
        success:function(res){
            //发送ajax请求到身份认证地址，带上code，appid，state参数
            dd.httpRequest({
              url: BaseUrl,
              method: 'GET',
              data:  {"code": code, "AppId": AppId, "AgentId": AgentId, "state": state,"authcode":res.authCode},
              dataType: 'json',
              success: function(res) {
                console.log("getauthcode")
                //请求成功后，将返回的json字符串，转换成context对象
                if (res !== null && res !== "") {
                  context = JSON.parse(JSON.stringify(res.data));
                  console.log(context)
                  // alert("base" + context)
                  //设置当前激活的公众号appid为当前appid
                  dd.setStorageSync({
                    key: sessionKey,
                    data: {
                      AppId: AppId,
                    }
                  });
                  // veevlinkSession.setItem(sessionKey, AppId);
                  if (AgentId != null) {
                    dd.setStorageSync({
                      key: activedAgentIdSessionKey,
                      data: {
                        AgentId: AgentId,
                      }
                    });
                    // veevlinkSession.setItem(activedAgentIdSessionKey, AgentId);
                  }
                  //将认证后的信息保存到localstorage
                  SetContext(context);
                }
                //如果微信账号为企业号或微信企业，并且context里的SessionId为空，跳转到Salesforce OAuth授权页面
              if ((context.WechatAccountType == "Official" || context.WechatAccountType == "Ding") && context.WechatIdentityMode == "SSOIntegrated" && (context.SessionId == null || context.SessionId == undefined || context.SessionId == "")) {
                // self.location = domain + "/Wechat2SFDC/OAuth/DingPreOAuth.aspx?sourceid=" + AppId + "&authCode=" + AgentId;
                console.log("本地缓存为空，进行跳转授权")
                jump();
              }
              },
              fail: function(res) {
                console.log(JSON.stringify(res))
                dd.alert({content: '"获取用户ID失败"'});
              },
              complete: function(res) {
                // dd.alert({content: 'complete'});
              }
            });
        },
        fail:function(err){
          console.log(JSON.stringify(err))
        }
    });
    
    }
	  else {
    GetContextFromStorage();
    if ((context.OpenId == null || context.OpenId == "") && (context.WEQYUserId == null || context.WEQYUserId == "") && AppId != null && AppId != "") {
        console.log("之前已有缓存，但本地缓存中sessionid为null，所以进行跳转授权")
        jump()
      }
    }
    // jump()
  }
}


function jump(){
    dd.getAuthCode({
        success:function(res){
        dd.navigateTo({
            url: '/pages/sfwebview/sfwebview?authCode='+res.authCode+'&sourceid='+AppId
        })
        },
        fail:function(err){
        }
    });
}
//显示页面主内容,保证每个页面都有一个id为content的顶级div，显示Content，隐藏Loading和Error
function ShowContent() {
  document.getElementById("content").style.display = 'block';
  document.getElementById("loading-box").style.display = 'none';
}
//如果只有openId,根据openId获取到context
function GetContextFromVeevlik(AppId) {
  //动态获取当前url中的protocol和host，
  //var url = window.location.protocol + "//" + window.location.host;
  //拼接获取Context的url
  var BaseContextUrl = domain + "/BaseContext.aspx";
  //发送ajax请求到获取Context地址，带上appid，userid参数
  ajax({
    url: BaseContextUrl,
    data: {
      "AppId": AppId
    },
    type: "GET",
    dataType: "json",
    success: function (res, xml) {
      //请求成功后，将返回的json字符串，转换成context对象
      if (res !== null && res !== "") {
        context = JSON.parse(res);
        // alert("basecontext" + context)
        // resJson.OpenId = context.OpenId;
        // resJson.WEQYUserId = context.WEQYUserId;
        // context = resJson;
        //设置当前激活的公众号appid为当前appid
        veevlinkSession.setItem(sessionKey, context.AppId);
        SetContext(context);
      }
    },
    fail: function (status) {
      alert("获取Context失败");
    }
  });
}

//从缓存获取Context
function GetContextFromStorage() {
  let res = dd.getStorageSync({ key: localKey });
  // context = JSON.parse(res.data.contextStr);
  context=res.data.contextStr
  // console.log(context)
  //如过Context已过期，重新从服务器获取
  if (((context.WechatAccountType == "Official" || context.WechatAccountType == "Ding") && context.WechatIdentityMode == "SSOIntegrated" && (context.SessionId == null || context.SessionId == undefined || context.SessionId == "")) || new Date().getTime() > context.ExpireTime || context.ExpireTime == undefined || context.ExpireTime == null || context.ExpireTime == "") {
    //动态获取当前url中的protocol和host，
    //var url = window.location.protocol + "//" + window.location.host;
    //拼接获取Context的url
    var BaseContextUrl = domain + "/BaseContext.aspx";
    //发送ajax请求到获取Context地址，带上appid，userid参数
    dd.httpRequest({
      url: BaseContextUrl,
      method: 'GET',
      data: {
        "AppId": context.AppId,
        "AgentId": context.AgentId,
        "WEQYUserId": context.WEQYUserId,
        "OpenId": context.OpenId
      },
      dataType: 'json',
      success: function(res) {
        //请求成功后，将返回的json字符串，转换成context对象
        if (res !== null && res !== "") {
          context = JSON.parse(JSON.stringify(res.data));
          // alert("base" + context)
          //设置当前激活的公众号appid为当前appid
          dd.setStorageSync({
            key: sessionKey,
            data: {
              AppId: AppId,
            }
          });
          // veevlinkSession.setItem(sessionKey, AppId);
          if (AgentId != null) {
            dd.setStorageSync({
              key: activedAgentIdSessionKey,
              data: {
                AgentId: AgentId,
              }
            });
            // veevlinkSession.setItem(activedAgentIdSessionKey, AgentId);
          }
          //将认证后的信息保存到localstorage
          SetContext(context);
        }
        //如果微信账号为企业号或微信企业，并且context里的SessionId为空，跳转到Salesforce OAuth授权页面
      if ((context.WechatAccountType == "Official" || context.WechatAccountType == "Ding") && context.WechatIdentityMode == "SSOIntegrated" && (context.SessionId == null || context.SessionId == undefined || context.SessionId == "")) {
        // self.location = domain + "/Wechat2SFDC/OAuth/DingPreOAuth.aspx?sourceid=" + AppId + "&authCode=" + AgentId;
        jump();
      }
      },
      fail: function(res) {
        dd.alert({content: '"获取用户ID失败"'});
      },
      complete: function(res) {
        // dd.alert({content: 'complete'});
      }
    });
  }
}


//封装设置Context的方法
function SetContext(context) {
  var contextStr = JSON.stringify(context);
  let res1 = dd.getStorageSync({ key: sessionKey });
  let res2 = dd.getStorageSync({ key: activedAgentIdSessionKey });
  var AppId = res1.data.AppId
  var AgentId = res2.data.AgentId
  if (AgentId == null) {
    localKey = keyPrefix + AppId;
  }
  else {
    localKey = keyPrefix + AppId + "_" + AgentId;
  }
  
  dd.setStorageSync({
    key: localKey,
    data: {
      contextStr: context,
    }
  });
  // veevlinkStorage.setItem(localKey, contextStr);
}


//显示页面主内容,保证每个页面都有一个id为content的顶级div，显示Content，隐藏Loading和Error
function ShowContent() {
  document.getElementById("content").style.display = 'block';
  document.getElementById("loading-box").style.display = 'none';
}


//格式化URL参数
function formatParams(data) {
  var arr = [];
  for (var name in data) {
    arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
  }
  arr.push(("v=" + Math.random()).replace(".", ""));
  return arr.join("&");
}

//获取url所有参数
function getKeyValue(url) {
  var result = {};
  var reg = new RegExp('([\?|&])(.+?)=([^&?#]*)', 'ig');
  var arr = reg.exec(url);

  while (arr) {
    result[arr[2]] = arr[3];

    arr = reg.exec(url);
  }

  return result;
}

// 错误收集api
function reportError(error, success) {
  var errData = {
    Url: window.location.href,
    CreateAt: new Date().toLocaleString(),
    body: JSON.stringify(error)
  };
  ajax({
    type: 'POST',
    url: 'https://api.veevlink.com/Log/ErrorLog',
    data: JSON.stringify(errData),
    success: function (data) {
      console.log("收集错误成功: ", data);
      success && success(data);
    },
    error: function (error) {
      console.log("收集错误失败：", error);
    }
  });
}

//Base.js加载完成主动调用GetContext()方法
GetContext();


module.exports ={
  SetContext:SetContext,
  GetContext:GetContext
}