//index.js
//获取应用实例
const app = getApp()
import Toast from "../../miniprogram_npm/vant-weapp/toast/toast";

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    orders: [],
    currentPage: 1,
    pageSize: 10
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  LoadTeas: function() {
    var obj = this;
    wx.request({
      url: app.globalData.baseApiPath + '/TeaOrder/QueryOrder',
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        CurrentPage: obj.data.currentPage,
        PageSize: obj.data.pageSize,
        Order: "Create_Time desc"
      },
      success(res) {
        if (res.data.state) {
          console.log(res.data.data);
          obj.setData({
            currentPage: res.data.data.currentPage,
            orders: res.data.data.items,
            pageSize: res.data.data.pageSize
          });
        }
      }
    })
  },
  onLoad: function() {
    this.LoadTeas();

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  ClickCreate: function() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },
  send:function(e) {
    wx.redirectTo({
      url: '/pages/send/index?orderId=' + e.target.dataset.id
    })
  }
})