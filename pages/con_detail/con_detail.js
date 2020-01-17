var Base = require('../../utils/res/js/Base')
var forcetk = require('../../utils/forcetk')

Page({
  data: {
    records:'',
  },
  onLoad(query) {
    var _this=this
    // 标题被点击
    // this.getlist()
    forcetk.query('select id,name from Account where id = \''+query.id+'\'',
    function(res){
      _this.setData({
        records: res.data.records[0],
      });
      _this.setData({
        records: JSON.stringify(res.data.records[0])
      });
      console.log(_this.data.records)
    },
    function(res){
        console.log(res)
    })
  },
});
