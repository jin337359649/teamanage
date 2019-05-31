//index.js
//获取应用实例
const app = getApp()
import Toast from "../../miniprogram_npm/vant-weapp/toast/toast";

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    sendFee: '',
    sendCode: '',
    orderId: '',
    count: '',
    address: '',
    customerName: '',
    price: '',
    teaName: ''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function(options) {

    this.data.orderId = options.orderId;
    this.LoadOrderById();

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
  submit: function(e) {
    this.setData({
      disSubmit: true
    });
    let obj = this;
    wx.request({
      url: app.globalData.baseApiPath + 'TeaOrder/Send',
      data: {
        Id: this.data.orderId,
        Send_Code: this.data.sendCode,
        Send_Fee: this.data.sendFee
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function(res) {
        if (res.data.state) {
          wx.redirectTo({
            url: '/pages/list/index'
          })
        } else {
          obj.setData({
            disSubmit: false
          });
          Toast.fail(res.data.message);
        }
      }
    })
  },
  fieldChange: function(e) {
    let name = e.currentTarget.dataset.name;
    let nameMap = {};
    let value = (e.detail || e.detail.value);
    nameMap[name] = value ? value : '';

    this.setData(nameMap);
  },
  LoadOrderById: function() {
    let obj = this;
    wx.request({
      url: app.globalData.baseApiPath + 'TeaOrder/GetById',
      data: {
        id: this.data.orderId
      },
      method: 'GET',
      success: function(res) {
        let order = res.data.data;
        if (res.data.state) {
          obj.setData({
            sendCode: order.send_Code,
            sendFee: order.send_Fee,
            price: order.price,
            count: order.count,
            address: order.address,
            customerName: order.customerName,
            teaName: order.teaName,
            phone: order.phone,
            sendTag: order.sendTag
          });
        } else {
          Toast.fail(res.data.message);
        }
      }
    })
  }
})