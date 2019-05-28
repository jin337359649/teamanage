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
    disSubmit: false,
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
    var obj = this;
    wx.request({
      url: 'http://localhost:56555/api/TeaOrder/GetById',
      data: {
        id: this.data.teaOrder.Id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.state) {
          obj.setData({
            'teaOrder.Address': res.data.data.address,
            'teaOrder.Tea_Name': res.data.data.teaName,
            'teaOrder.Price': res.data.data.price,
            'teaOrder.Count': res.data.data.count,
            'teaOrder.CustomerName': res.data.data.customerName,
            'teaOrder.Phone': res.data.data.phone,
            'teaOrder.Carton_Name': res.data.data.cartonName,
            'teaOrder.Carton_Id': res.data.data.cartonId,
            'teaOrder.Tea_Id': res.data.data.teaId
          });
        }
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
        if (res.data.state) {
          obj.teaList = res.data.data;
          obj.setData({
            teas: res.data.data.map((p) => p.name)
          });
        }
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
        if (res.data.state) {
          obj.cartonList = res.data.data;
          obj.setData({
            wrappers: res.data.data.map((p) => p.name)
          });
        }
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
        if (res.data.state) {
          obj.customerList = res.data.data;
        }
      }
    })
  },
  onLoad: function(options) {

    if (options.orderId) {
      this.data.teaOrder.Id = options.orderId;

      this.GetOrderById();

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
    this.setData({
      disSubmit: true
    });
    if (!this.validate()) {

      return;
    }

    let customer
    if (this.customerList) {
      customer = this.customerList.filter((p) => p.name == this.data.teaOrder.CustomerName && p.phone == this.data.teaOrder.Phone);
    }

    if (customer[0]) {
      this.data.teaOrder.Customer_Id = customer[0].id;
      this.DoSave(this.data.teaOrder);
    } else {
      this.CreateCustomer({
        Phone: this.data.teaOrder.Phone,
        Address: this.data.teaOrder.Address,
        Name: this.data.teaOrder.CustomerName
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
          obj.data.teaOrder.Customer_Id = res.data.data;
          obj.DoSave(obj.data.teaOrder);
        } else {
          this.setData({
            disSubmit: false
          });
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
          this.setData({
            disSubmit: false
          });
          Toast.fail(res.data.message);
        }
      }
    });
  },
  fieldChange: function(e) {
    let name = e.currentTarget.dataset.name;
    let nameMap = {};
    let value = (e.detail || e.detail.value);
    nameMap[name] = value ? value : '';

    this.setData(nameMap);
  },
  returnList:function(){
    wx.redirectTo({
      url: '/pages/list/index',
    })
  },
  validate: function() {
    if (!this.data.teaOrder.CustomerName) {
      Toast.fail("顾客姓名不能为空！");
      return false;
    }

    if (!this.data.teaOrder.Phone) {
      Toast.fail("顾客电话不能为空！");
      return false;
    }

    if (!this.data.teaOrder.Address) {
      Toast.fail("顾客地址不能为空！");
      return false;
    }

    if (!this.data.teaOrder.Carton_Id) {
      Toast.fail("请选择包装！");
      return false;
    }

    if (!this.data.teaOrder.Tea_Id) {
      Toast.fail("请选择茶叶！");
      return false;
    }

    if (!this.data.teaOrder.Count) {
      Toast.fail("数量不能为空！");
      return false;
    }

    if (!this.data.teaOrder.Price) {
      Toast.fail("价格不能为空！");
      return false;
    }

    return true;
  }
})