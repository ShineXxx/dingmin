var Base = require('../../utils/res/js/Base')

Page({
  data:{
    authCode:'',
    sourceid:'',
    domain:getApp().domain
  },
  onLoad(query){
    var _this=this;
    _this.setData({
      authCode:query.authCode,
      sourceid:query.sourceid
    })
    this.webViewContext = dd.createWebViewContext('web-view-1');    
  },
  onmessage: function(e) {
    Base.GetContext();
    dd.redirectTo({url: '/pages/index/index'});
  }
});