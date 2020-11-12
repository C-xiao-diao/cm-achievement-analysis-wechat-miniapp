import { http } from "./../../utils/util";
import "./../../utils/fix";
import _ from "./../../utils/lodash";
import config from "./../../configs/config"
import log from "./../../utils/log"

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
    class: '',//教师端
    class1: '',//家长端
    subject: ['全科','语文', '数学', '英语', '生物', '物理', '地理', '政治', '历史','化学','体育'],
    subjectIndex: 0,
    subjectId: 9,
    subjectArray: [{ id: 9, name: '全科' },{ id: 1, name: '语文' }, { id: 2, name: '数学' }, { id: 3, name: '英语' }, { id: 4, name: '生物' }, { id: 5, name: '物理' }, { id: 6, name: '地理' }, { id: 7, name: '政治' }, { id: 8, name: '历史' }, { id: 10, name: '化学' }, { id: 11, name: '体育' }],
    gradeIndex: 0,
    grade: ['初中2018级','初中2019级','初中2020级','高中2018级','高中2019级','高中2020级'],
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
      },
      {
        id: 3,
        name: '高中2018级',
        class: 'G18'
      },
      {
        id: 4,
        name: '高中2019级',
        class: 'G19'
      },
      {
        id: 5,
        name: '高中2020级',
        class: 'G20'
      }
    ],
    currentGrade: 'C18',
    //角色
    role: 1,            // 1老师   2家长   3年级主任
    ticketNumber: "",
    //提交按钮
    isSubmitLoading: false,
    //收藏引导图
    isShowFavoritesBg: false,
    //是否订阅过一次性服务消息
    // mainSwitch: false,
    showGuideStep: false,  //是否显示引导页
    guideStep: 1
  },
  onLoad() {
    //获取缓存内的数据，初始化数据
    try {
      this.isFirstComing();
      var info = wx.getStorageSync('lastDataSource');
      let infoObj = JSON.parse(info);
      if (info) {
        this.setData({
          class: infoObj.class_,
          class1: infoObj.class1,
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
  //是否第一次进来
  isFirstComing: function(){
    let isFirst = wx.getStorageSync('isFirst') || '';
    if(!isFirst){
      this.openGuide();
    }
  },
  openGuide: function(){
    this.setData({
      showGuideStep: true,
      guideStep: 1
    })
  },
  //引导步骤
  goToNextStep: function(e){
    let num = e.currentTarget.dataset.num;
    if(num < 5) {
      this.setData({guideStep: (num+1)})
    }else{
      this.setData({showGuideStep: false})
    }
  },
  onHide: function(){
    this.printLogs();
  },
  onShow: function () {
    this.printLogs();
    //注意，主页 onLoad可能提前于 小程序 onLaunch 执行完， 
    // 用户id 在onLaunch 的login里获取，所以 首页加载数据，要么 写在 onShow里，要么写在onLoad的 callback回调里
    let _this = this;
    wx.getSetting({
      withSubscriptions: true,
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          _this.setData({ isShowUserInfoBtn: false });
        }
      }
    })
  },
  //客服会话
  onShareAppMessage:function(e){
  },
  //打印log
  printLogs: function(){
    log.info('info') 
    log.warn('warn')
    log.error('error')
    log.setFilterMsg('filterkeyword')
    log.setFilterMsg('addfilterkeyword')
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

    let cmd = "/auth/school/listBy";
    let data = {schoolAlias: e.detail.value};
    http.get({
      cmd,
      data,
      success: res => {
        var resData = res.data;
        if (resData.code == 200) {
          this.setData({
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
    let role = e.currentTarget.dataset.role;
    let timestamp  = Date.parse(new Date());

    let cmd = "/auth/school/queryClass";
    let data = {schoolId: this.data.schoolId, timestamp, classLike:e.detail.value};
    http.get({
      cmd,
      data,
      success: res => {
        var resData = res.data;
        if (resData.code == 200) {
          var list = resData.data.list;
          let className = '';
          role === 'teacher' ? className = 'class' : className = 'class1'
          this.setData({classArray: list, [className]: e.detail.value})
        }
      }
    })
  },
  getCurClass(e) {  //获取当前选择得班级
    let role = e.currentTarget.dataset.role;
    let className = '';
    role == 'teacher' ? className = 'class' : className = 'class1';
    this.setData({
      [className]: e.currentTarget.dataset.name,
      classArray: []
    });
  },
  analyzeInfo() {//月考分析提交
    const { role, ticketNumber, currentGrade } = this.data;
    this.setData({isSubmitLoading: true})
    var Grade = '';
    if (role === 1) {//老师
      if (!this.data.school || !this.data.class) {
        wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
        this.setData({isSubmitLoading: false});
        return;
      }
    } else if(role == 2) {//家长
      if (!ticketNumber || !this.data.class1 ) {
        wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
        this.setData({isSubmitLoading: false});
        return;
      }
    }else if(role == 3 ) {//年级主任
      Grade = this.data.currentGrade;
      if (!currentGrade) {
        wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
        this.setData({isSubmitLoading: false});
        return;
      }
    }
    //将选择存入本地缓存
    let dataSource = {
      schoolId: this.data.schoolId, class1: this.data.class1, class_: this.data.class,school: this.data.school,
      subjectId: this.data.subjectId,subjectIndex: this.data.subjectIndex, ticketNumber: ticketNumber,
      currentGrade: this.data.currentGrade
    }
    try {
      wx.setStorageSync('lastDataSource', JSON.stringify(dataSource))
    } catch (e) {

    }
    //end
    var params = {
      weChatUserId: app.globalData.userId,
      userType: role,
      schoolId: this.data.schoolId,
      subject: this.data.subjectId,
      ticketNumber: ticketNumber,
      grade: Grade
    }
    if(role===2){
      params.class_ = this.data.class1
    }else {
      params.class_ = this.data.class
    }

    let cmd = "/auth/userRole/addUserRole";
    let data = params;
    http.post({
      cmd,
      data,
      success: res => {
        if (_.get(res, 'data.code') === 200) {
          if(role == 1){//to教师
            if(this.data.subjectId==9){///班主任
              wx.navigateTo({
                url: '/pages/headTeacher/headTeacher?subject=' + this.data.subject[this.data.subjectIndex] + '&schoolId=' + this.data.schoolId
                + '&subjectId=' + this.data.subjectId
                + '&class_=' + this.data.class
                + '&userType=' + role
              });
            }else {//单科老师
              wx.navigateTo({
                url: '/pages/result/result?subject=' + this.data.subject[this.data.subjectIndex] 
                + '&schoolId=' + this.data.schoolId
                + '&subjectId=' + this.data.subjectId
                + '&class_=' + this.data.class
                + '&userType=' + role
              });
            }
          }else if(role == 2){//to家长
            wx.navigateTo({url: '/pages/parent/parent?ticketNumber=' + ticketNumber 
            + '&schoolId=' + this.data.schoolId
            + '&class_=' + this.data.class1
          });
          }else if(role == 3) {//年级主任
            wx.navigateTo({url: '/pages/classManager/classManager?grade=' + Grade + '&schoolId=' + this.data.schoolId});
          }
        }else if (_.get(res, 'data.code') === 106) {
          wx.showToast({
            title: _.get(res, 'data.msg') || '准考证号不存在',
          })
        }
      },
      complete: res =>{
        this.setData({ isSubmitLoading: false })
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
        this.updateUserInfoTosServer(e.detail.userInfo, e.detail.iv, e.detail.encryptedData)
      } else {
        this._login(e.detail.userInfo, e.detail.iv, e.detail.encryptedData);
      }
    } else {
      
    }
  },
  _login:function(userInfo, iv, encryptedData){
    var that = this;
    wx.login({
      success (res) {
        if (res.code) {
          let cmd = "/api/weChat/appletsGetOpenid";
          http.get({
            cmd,
            data:{code: res.code},
            success: res => {
              if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                var resData = res.data;
                app.globalData.userId = resData.data.id;
                app.globalData.openId = resData.data.openid;
                app.globalData.unionid = resData.data.unionid;
                that.updateUserInfoTosServer(userInfo, iv, encryptedData)
              }
            }
          })
        }else {
          // console.log('登录失败'+res.errMsg);
          wx.showToast({title: '登录失败!'});
        }
      }
    })
  },
  updateUserInfoTosServer: function (userInfo, iv, encryptedData) {
    let cmd = "/auth/wechat/editUser";
    let data = {
      openid: app.globalData.openId,
      unionid: app.globalData.unionid,
      nickname: userInfo.nickName,
      sex: userInfo.gender,
      province: userInfo.province,
      city: userInfo.city,
      country: userInfo.country,
      headimgurl: userInfo.avatarUrl,
      userId: app.globalData.userId,
      iv,
      encryptedData
    };
    http.post({
      cmd,
      data,
      success: res => {
        var resData = res.data;
        if (resData.code == 200 || resData.code == 103) {
          wx.showToast({
            title: '授权成功',
          })
        }
      }
    })
  },
  //点击联系客服
  connectCustomerService: function(e){
  },
  //点击弹出授权订阅消息弹框
  getSubscriptionPermisssion:function(){
    var isAcceptSubscriptionsSetting = wx.getStorageSync('isAcceptSubscriptionsSetting');
    if(isAcceptSubscriptionsSetting && isAcceptSubscriptionsSetting == 'accept'){
      this.analyzeInfo();
      return;
    }

    //验证输入框，因为 analyzeInfo 方法后移，故在此验证
    const { role, ticketNumber, currentGrade } = this.data;
    this.setData({isSubmitLoading: true})
    var Grade = '';
    if (role === 1) {//老师
      if (!this.data.school || !this.data.class) {
        wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
        this.setData({isSubmitLoading: false});
        return;
      }
    } else if(role == 2) {//家长
      if (!ticketNumber || !this.data.class1 ) {
        wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
        this.setData({isSubmitLoading: false});
        return;
      }
    }else if(role == 3 ) {//年级主任
      Grade = this.data.currentGrade;
      if (!currentGrade) {
        wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
        this.setData({isSubmitLoading: false});
        return;
      }
    }
    // ------------ end --------------

    wx.requestSubscribeMessage({
      tmplIds: config.tmplIds,
      success: res => {
        if(res[config.tmplIds[0]] == 'accept'){
          wx.showToast({  title: '订阅消息成功',})
          try {
            wx.setStorageSync('isAcceptSubscriptionsSetting', "accept");
          } catch (e) {
      
          }
        } else if(res[config.tmplIds[0]] == 'reject'){
          wx.showToast({  title: '已拒绝订阅消息',})
        } else {
          wx.showToast({  title: '订阅异常，请联系客服',})
        }
      },
      fail: res => {
        wx.showToast({
          title: '订阅消息失败',
        })
      },
      complete: res => {
        this.analyzeInfo();
      }
    });
  },
  //点击收藏
  showFavorites: function(){
    this.setData({ isShowFavoritesBg: true });
  },
  //点击隐藏收藏引导图
  cancelFavorites: function(){
    this.setData({ isShowFavoritesBg: false });
  }
})
