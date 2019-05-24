//index.js
//获取应用实例
const app = getApp()
import Toast from "../../miniprogram_npm/vant-weapp/toast/toast";

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showTea: false,
    showCustomer: false,
    showWrapper: false,
    teas: [],
    wrappers: [],
    customers: [],
    teaOrder: {

    }
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  popTea() {
    this.setData({
      showTea: true
    });
  },
  popCustomer() {
    this.setData({
      showCustomer: true
    });
  },
  popWrapper() {
    this.setData({
      showWrapper: true
    });
  },
  onTeaCancel() {
    this.setData({
      showTea: false
    });
  },
  onTeaConfirm(event) {
    const {
      picker,
      value,
      index
    } = event.detail;

    this.data.teaOrder.Tea_Id = this.teaList[index].id;
    this.data.teaOrder.Tea_Name = this.teaList[index].name;

    this.setData({
      showTea: false,
      teaOrder: this.data.teaOrder
    });
  },
  onCartonCancel() {
    this.setData({
      showWrapper: false
    });
  },
  onCartonConfirm(event) {
    const {
      picker,
      value,
      index
    } = event.detail;
    this.data.teaOrder.Carton_Id = this.cartonList[index].id;
    this.data.teaOrder.Carton_Name = this.cartonList[index].name;

    this.setData({
      showWrapper: false,
      teaOrder: this.data.teaOrder
    });
  },
  GetOrderById: function() {
    wx.request({
      url: 'localhost:9320/api/TeaOrder/GetById',
      data: {
        id: this.teaOrder.Id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        teaOrder = res;
      }
    })
  },
  LoadTeas: function() {
    var obj = this;
    wx.request({
      url: 'http://localhost:56555/api/TeaOrder/GetTeaList',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        obj.teaList = res.data;
        obj.setData({
          teas: res.data.map((p) => p.name)
        });
      }
    })
  },
  LoadCartons: function() {
    var obj = this;
    wx.request({
      url: 'http://localhost:56555/api/TeaOrder/GetCartonList',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        obj.cartonList = res.data;
        obj.setData({
          wrappers: res.data.map((p) => p.name)
        });
      }
    })
  },
  LoadCustomer: function() {
    var obj = this;
    wx.request({
      url: 'http://localhost:56555/api/TeaOrder/QueryCustomer',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        obj.customerList = res.data;
      }
    })
  },
  onLoad: function(options) {

    if (options.orderId) {
      teaOrder.Id = options.orderId;

      GetOrderById();

    }

    this.LoadCartons();
    this.LoadTeas();
    this.LoadCustomer();

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
  submit: function() {
    let customer 
    if (this.customerList){
      customer = this.customerList.filter((p) => p.name == this.data.teaOrder.CustomerName && p.phone == this.data.teaOrder.phone);
    }

    if (customer[0]) {
      this.data.teaOrder.Customer_Id = customer[0].id;
      this.DoSave(this.data.teaOrder);
    } else {
      this.CreateCustomer({
        Phone: this.data.teaOrder.phone,
        Address: this.data.teaOrder.address,
        Name: this.data.teaOrder.name
      });
    }
  },
  CreateCustomer: function(customer) {
    var obj = this;
    wx.request({
      url: 'http://localhost:56555/api/TeaOrder/SaveCustomer',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: customer,
      success(res) {
        if (res.data.state) {
          DoSave(obj.data.teaOrder);
        } else {
          Toast.fail(res.data.message);
        }
      }
    });
  },
  DoSave: function(order) {
    wx.request({
      url: 'http://localhost:56555/api/TeaOrder/Save',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: order,
      success(res) {
        if (res.data.state) {
          wx.redirectTo({
            url: '/pages/list/index'
          });
        } else {
          Toast.fail(res.data.message);
        }
      }
    });
  },
  fieldChange: function(e) {
    let name = e.currentTarget.dataset.name;
    let nameMap = {}
    nameMap[name] = e.detail || e.detail.value;

    this.setData(nameMap);
  }
})