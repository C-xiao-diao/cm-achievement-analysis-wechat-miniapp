//app.js
import { http } from "utils/util";
import config from "./configs/config"

App({
  globalData: {
    userInfo: null,
    // userId: 'b9354f02763144dc9a1003627881f7c5',      //TODO 方便开发，先写死
    userId: "",
    openId: '',
    unionid: "",
    isIpx: false,   //适配IPhoneX
    statusBarHeight: 20,
    isConnected: true,
    pixelRatio: 1
  },
  onLaunch: function () {
    let _this = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    this.Login();
    this.getSystemInfo();
  },
  onShow: function(){
    wx.onMemoryWarning(function () {
      console.log('onMemoryWarningReceive')
    })
  },
  getSystemInfo: function(){
    var that = this;
    wx.getSystemInfo({
      success: (res) => {
        that.globalData.pixelRatio = res.pixelRatio;
        let modelmes = res.model; //手机品牌
        let statusBarHeight = res.statusBarHeight;//获取状态栏高度
        that.globalData.statusBarHeight = statusBarHeight;
        console.log('手机品牌', modelmes)
        //其实后面关于XS、XR、XS MAX的判断都可以去掉,因为他们里面都包含了'iPhone X'这个字符;
        if (modelmes.indexOf('iPhone X') != -1) {
          that.globalData.isIpx = true
        } else if (modelmes.indexOf('iPhone XS') != -1) {
          that.globalData.isIpx = true
        } else if (modelmes.indexOf('iPhone XR') != -1) {
          that.globalData.isIpx = true
        } else if (modelmes.indexOf('iPhone XS Max') != -1) {
          that.globalData.isIpx = true
        } else if (modelmes.indexOf('iPhone 11') != -1) {
          that.globalData.isIpx = true
        } else if (modelmes.indexOf('iPhone 11 Pro') != -1) {
          that.globalData.isIpx = true
        } else if (modelmes.indexOf('iPhone 11 Pro Max') != -1) {
          that.globalData.isIpx = true
        }
      },
    })
  },
  Login: function () {// 登录
    var that = this;
    wx.login({
      success(res) {
        if (res.code) {
          let cmd = "/api/weChat/appletsGetOpenid";
          http.get({
            cmd,
            data: { code: res.code },
            success: res => {
              if (res.data.code == 200) {
                var resData = res.data;
                wx.setStorageSync('isFirst','yes');
                that.globalData.userId = resData.data.id;
                that.globalData.openId = resData.data.openid;
                that.globalData.unionid = resData.data.unionid;
              }
            }
          })
        } else {
          // console.log('登录失败'+res.errMsg);
          wx.showToast({ title: '登录失败!' });
        }
      }
    })
  },
  getUserInfo: function () {// 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  }
})


Object.assign(global, {
  Array: Array,
  Date: Date,
  Error: Error,
  Function: Function,
  Math: Math,
  Object: Object,
  RegExp: RegExp,
  String: String,
  TypeError: TypeError,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
});