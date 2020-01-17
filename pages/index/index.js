var Base = require('../../utils/res/js/Base')
var forcetk = require('../../utils/forcetk')

Page({
  data: {
    array: ['客户', '联系人'],
    objectArray: [
      {
        id: 0,
        name: '客户',
      },
      {
        id: 1,
        name: '联系人',
      },
    ],
    arrIndex: 0,
    index: 0,
    listData: {
      onItemTap: 'handleListItemTap',
      header: 'list1',
      data: [
      ]
    },
  },
  onLoad(query) {
    // 页面加载
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    var _this=this
    // 标题被点击
    // this.getlist()
    forcetk.query('select id,name from Account ',
    function(res){
      console.log(JSON.stringify(res))
      _this.setData({
        'listData.data': res.data.records,
      });
    },
    function(res){
        console.log(res)
    })
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
  getlist(){
      forcetk.ajax('acc_get',function(res){
        console.log(res)
      },'error','GET',{name:''},'json')
  },
  bindPickerChange(e) {
    var _this=this
    this.setData({
      index: e.detail.value,
    });
    var obj=''
    if(e.detail.value==0){
      obj='Account'
    }else if (e.detail.value==1){
      obj='Contact'
    }
    forcetk.query('select id,name,Phone from '+obj,
    function(res){
      _this.setData({
        'listData.data': res.data.records,
      });
    },
    function(res){
        console.log(res)
    })
  },
  handleListItemTap(e) {
    if(this.data.index==0){
      dd.navigateTo({
          url: '/pages/con_detail/con_detail?id='+e.currentTarget.dataset.id
        })
    }else{
      dd.navigateTo({
        url: '/pages/acc_detail/acc_detail?id='+e.currentTarget.dataset.id
      })
    }
  },
});
