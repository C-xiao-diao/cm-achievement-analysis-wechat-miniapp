//app.js
App({
  globalData: {
    userInfo: null,
    domain: 'https://cminor.dookbook.info',
    userId: '',
    openId: ''
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs) 
    this.Login();
  },
  Login: function(){// 登录
    var Url = this.globalData.domain + '/api/weChat/appletsGetOpenid',that = this;
    wx.login({
      success (res) {
        if (res.code) {
          wx.request({
            url: Url,
            data: {code: res.code},
            success:res=>{
              var resData = res.data;
              if(resData.code == 200){
                that.globalData.userId = resData.data.id;
                that.globalData.openId = resData.data.openid;
                // that.getUserInfo();
              }
            }
          })
        } else {
          // console.log('登录失败'+res.errMsg);
          wx.showToast({title: '登录失败!'});
        }
      }
    })
  },
  getUserInfo: function(){// 获取用户信息
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