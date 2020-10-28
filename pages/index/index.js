
import "./../../utils/fix";
import _ from "lodash";

const app = getApp()

Page({
  data: {
    //授权按钮
    isShowUserInfoBtn: true,
    hasUserInfo: false,
    userInfo: {},
    userId: '',
    province: ['湖南省'],
    provinceArray: [{ id: 0, name: '湖南省' }],
    provinceIndex: 0,
    city: ['长沙市'],
    cityArray: [{ id: 0, name: '长沙市' }],
    cityIndex: 0,
    schoolArray: [],
    school: '',
    schoolId: '',
    classArray: [],
    class: '',
    subject: ['语文', '数学', '英语', '生物', '物理', '地理', '政治', '历史','化学','体育','全科'],
    subjectIndex: 0,
    subjectId: 1,
    subjectArray: [{ id: 1, name: '语文' }, { id: 2, name: '数学' }, { id: 3, name: '英语' }, { id: 4, name: '生物' }, { id: 5, name: '物理' }, { id: 6, name: '地理' }, { id: 7, name: '政治' }, { id: 8, name: '历史' }, { id: 10, name: '化学' }, { id: 11, name: '体育' }, { id: 9, name: '全科' }],
    gradeIndex: 0,
    grade: ['初中2018级','初中2019级','初中2020级'],
    gradeArray: [
      {
        id: 0,
        name: '初中2018级',
        class: 'C18'
      },
      {
        id: 1,
        name: '初中2019级',
        class: 'C19'
      },
      {
        id: 2,
        name: '初中2020级',
        class: 'C20'
      }
    ],
    currentGrade: 'C18',
    //角色
    role: 1,            // 1老师   2家长   3年级主任
    ticketNumber: "",
  },
  onLoad() {
    //获取缓存内的数据，初始化数据
    try {
      var info = wx.getStorageSync('lastDataSource');
      let infoObj = JSON.parse(info);
      if (info) {
        this.setData({
          class: infoObj.class_,
          schoolId: infoObj.schoolId,
          school: infoObj.school,
          subjectId: infoObj.subjectId,
          subjectIndex: infoObj.subjectIndex,
          ticketNumber: infoObj.ticketNumber
        })
      }
    } catch (e) {

    }
  },
  onShow: function () {
    //注意，主页 onLoad可能提前于 小程序 onLaunch 执行完， 
    // 用户id 在onLaunch 的login里获取，所以 首页加载数据，要么 写在 onShow里，要么写在onLoad的 callback回调里
    let _this = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          _this.setData({ isShowUserInfoBtn: false });
        }
      }
    })
  },
  closeUl() {
    this.setData({
      'schoolArray': [],
      'classArray': []
    })
  },
  pickerGrade(e){  //选择年级
    var classArr = this.data.gradeArray[e.detail.value].class;
    var str = classArr.toString();
    this.setData({ 
      gradeIndex: e.detail.value,
      currentGrade: str
    });
  },
  bindPickerProvince(e) {//选择省
    this.setData({ provinceIndex: e.detail.value })
  },
  bindPickerCity(e) {//选择城市
    this.setData({ cityIndex: e.detail.value })
  },
  bindPickerSubject(e) {//选择科目
    var str = this.data.subject[e.detail.value];
    var obj = this.data.subjectArray.find(x => x.name == str);
    this.setData({
      subjectIndex: e.detail.value,
      subjectId: obj.id
    })
  },
  getSchoolArray(e) {//获取学校列表
    var reg = /.*[\u4e00-\u9fa5]+.*$/;
    if (!reg.test(e.detail.value)) {
      wx.showToast({ title: '请输入中文', icon: 'none', duration: 1500 });
      return;
    }
    let Url = app.globalData.domain + '/auth/school/listBy';
    var that = this;
    wx.request({
      url: Url,
      header: { 'uid': app.globalData.userId },
      data: {
        schoolAlias: e.detail.value
      },
      success: res => {
        var resData = res.data;
        if (resData.code == 200) {
          that.setData({
            'schoolArray': resData.data.list
          })
        }
      }
    })
  },
  getCurSchool(e) {  //获取当前选择得学校
    this.setData({
      school: e.currentTarget.dataset.name,
      schoolId: e.currentTarget.dataset.id,
      schoolArray: []
    });
  },
  getClassArray(e) {//获取班级列表
    this.setData({class: e.detail.value});
    let Url = app.globalData.domain + '/auth/school/queryClass';
    var that = this;
    wx.request({
      url: Url,
      header: { 'uid': app.globalData.userId },
      data: {'schoolId': that.data.schoolId},
      success: res => {
        var resData = res.data;
        if (resData.code == 200) {
          var list = resData.data.list;
          that.setData({'classArray': list})
        }
      }
    })
  },
  getCurClass(e) {  //获取当前选择得班级
    this.setData({
      class: e.currentTarget.dataset.name,
      classArray: []
    });
  },
  analyzeInfo() {//月考分析提交
    var Grade = '';
    const { role, ticketNumber, currentGrade } = this.data;
    if (role === 1) {//老师
      if (!this.data.school || !this.data.class) {
        wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
        return;
      }
    } else if(role == 2) {//家长
      if (!ticketNumber) {
        wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
        return;
      }
    }else if(role == 3 ) {//年级主任
      Grade = this.data.currentGrade;
      if (!currentGrade) {
        wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
        return;
      }
    }
    //将选择存入本地缓存
    let dataSource = {
      schoolId: this.data.schoolId, class_: this.data.class,school: this.data.school,
      subjectId: this.data.subjectId,subjectIndex: this.data.subjectIndex, ticketNumber: ticketNumber,
      currentGrade: this.data.currentGrade
    }
    try {
      wx.setStorageSync('lastDataSource', JSON.stringify(dataSource))
    } catch (e) {

    }
    //end
    let Url = app.globalData.domain + '/auth/userRole/addUserRole';
    var that = this;
    wx.request({
      url: Url,
      header: { 'uid': app.globalData.userId },
      method: "POST",
      data: {
        weChatUserId: app.globalData.userId,
        userType: role,
        schoolId: that.data.schoolId,
        class_: that.data.class,
        subject: that.data.subjectId,
        ticketNumber: ticketNumber,
        grade: Grade
      },
      success: res => {
        var resData = res.data;
        if (resData.code == 200 || resData.code == 103) {
          if(role == 1){//to教师
            wx.navigateTo({
              url: '/pages/result/result?subject=' + this.data.subject[this.data.subjectIndex] + '&schoolId=' + that.data.schoolId
              + '&subjectId=' + that.data.subjectId
            });
          }else if(role == 2){//to家长
            wx.navigateTo({url: '/pages/parent/parent'});
          }else if(role == 3) {//年级主任
            wx.navigateTo({url: '/pages/classManager/classManager'});
          }
        } else if (resData.code === 106) {
          wx.showToast({
            title: resData.msg || '准考证号不存在',
          })
        }
      }
    })
  },
  //切换角色
  changeRole: function (e) {
    let role = e.currentTarget.dataset.role;
    if (role !== null && role !== undefined) {
      this.setData({ role });
    }
  },
  //准考证
  getAdmissionTicket: function (e) {
    let value = e.detail.value;
    if (value !== null && value !== undefined) {
      this.setData({ ticketNumber: value });
    }
  },
  //登录接口
  userInfoHandler: function (e) {
    if(!_.isEmpty(e.detail.userInfo)){
      app.globalData.userInfo = e.detail.userInfo;
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
        isShowUserInfoBtn: false
      })
      if(app.globalData.userId){
        this.updateUserInfoTosServer(e.detail.userInfo)
      } else {
        this._login(e.detail.userInfo);
      }
    } else {
      
    }
  },
  _login:function(userInfo){
    var Url = app.globalData.domain + '/api/weChat/appletsGetOpenid',that = this;
    wx.login({
      success (res) {
        if (res.code) {
          wx.request({
            url: Url,
            data: {code: res.code},
            success:res=>{
              var resData = res.data;
              if(resData.code == 200){
                app.globalData.userId = resData.data.id;
                app.globalData.openId = resData.data.openid;
                app.globalData.unionid = resData.data.unionid;
                that.updateUserInfoTosServer(userInfo)
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
  updateUserInfoTosServer: function (userInfo) {
    let Url = app.globalData.domain + '/auth/wechat/editUser';
    var that = this;
    wx.request({
      url: Url,
      header: { 'uid': app.globalData.userId },
      method: "POST",
      data: {
        openid: app.globalData.openId,
        unionid: app.globalData.unionid,
        nickname: userInfo.nickName,
        sex: userInfo.gender,
        province: userInfo.province,
        city: userInfo.city,
        country: userInfo.country,
        headimgurl: userInfo.avatarUrl,
        userId: app.globalData.userId
      },
      success: res => {
        var resData = res.data;
        if (resData.code == 200 || resData.code == 103) {
          wx.showToast({
            title: '授权成功',
          })
        }
      }
    })
  }
})
