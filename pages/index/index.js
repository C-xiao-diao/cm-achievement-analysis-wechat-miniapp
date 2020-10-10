const app = getApp()

Page({
  data: {
    userInfo: {},
    userId: '',
    hasUserInfo: false,
    province: ['湖南省'],
    provinceArray: [{id: 0,name: '湖南省'}],
    provinceIndex: 0,
    city: ['长沙市'],
    cityArray: [{id: 0,name: '长沙市'}],
    cityIndex: 0,
    schoolArray: [],
    school: '',
    schoolId: '',
    classArray: [],
    class: '',
    subject: ['语文','数学','英语','生物','物理','地理','政治','历史','全科'],
    subjectIndex: 0,
    subjectId: 0,
    subjectArray: [{id:1,name:'语文'},{id:2,name:'数学'},{id:3,name:'英语'},{id:4,name:'生物'},{id:5,name:'物理'},{id:6,name:'地理'},{id:7,name:'政治'},{id:8,name:'历史'},{id:9,name:'全科'}],
    //角色
    role: 0,            // 0老师   1 家长
    ticketNumber: "",
  },
  onLoad(){
    
  },
  closeUl(){
    this.setData({ 
      'schoolArray': [],
      'classArray': []
    })
  },
  bindPickerProvince(e) {//选择省
    this.setData({provinceIndex: e.detail.value})
  },
  bindPickerCity(e) {//选择城市
    this.setData({cityIndex: e.detail.value})
  },
  bindPickerSubject(e){//选择科目
    this.setData({
      subjectIndex: e.detail.value,
      subjectId: e.detail.value
    })
  },
  getSchoolArray(e){//获取学校列表
    var reg = /.*[\u4e00-\u9fa5]+.*$/;
    if(!reg.test(e.detail.value)){ 
      wx.showToast({title: '请输入中文',icon: 'none',duration: 1500}); 
      return; 
    } 
    let Url = app.globalData.domain + '/auth/school/listBy';
    var that = this;
    wx.request({
      url: Url,
      header: {'uid': app.globalData.userId},
      data: {
        schoolAlias: e.detail.value
      },
      success:res=>{
        var resData = res.data;
        if(resData.code == 200){
          that.setData({
            'schoolArray': resData.data.list
          })
        }
      }
    })
  },
  getCurSchool(e){  //获取当前选择得学校
    this.setData({
      school: e.currentTarget.dataset.name,
      schoolId: e.currentTarget.dataset.id,
      schoolArray: []
    });
  },
  getClassArray(e){//获取班级列表
    let Url = app.globalData.domain + '/auth/school/queryClass';
    var that = this;
    wx.request({
      url: Url,
      header: {'uid': app.globalData.userId},
      data: {
        'schoolId': that.data.schoolId
      },
      success:res=>{
        var resData = res.data;
        if(resData.code == 200){
          that.setData({
            'classArray': resData.data.list
          })
        }
      }
    })
  },
  getCurClass(e){  //获取当前选择得班级
    this.setData({
      class: e.currentTarget.dataset.name,
      classArray: []
    });
  },
  analyzeInfo(){//月考分析提交
    const { role,ticketNumber } = this.data;
    if(role === 0){
      if(!this.data.school || !this.data.class){
        wx.showToast({title: '请填写完整的信息', icon: 'none', duration: 2000 });
        return;
      }
    } else{
      if(!ticketNumber){
        wx.showToast({title: '请填写完整的信息', icon: 'none', duration: 2000 });
        return;
      }
    }
    let Url = app.globalData.domain + '/auth/userRole/addUserRole';
    var that = this;
    wx.request({
      url: Url,
      header: {'uid': app.globalData.userId},
      method: "POST",
      data: {
        weChatUserId: app.globalData.userId,
        userType: role === 0 ? 1 : 2,
        schoolId: that.data.schoolId,
        class_: role === 0 ? that.data.class : "C1802",                   //TODO 家长状态下class 随便写一个，后期删掉
        subject: Number(that.data.subjectId)+1,
        ticketNumber: ticketNumber
      },
      success:res=>{
        var resData = res.data;
        if(resData.code == 200 || resData.code == 103){
          wx.navigateTo({
            url: '/pages/result/result?subject='+ this.data.subject[this.data.subjectIndex] + '&role=' + role
          });
        }
      }
    })
  },
  //切换角色
  changeRole: function(e){
    let role = e.currentTarget.dataset.role;
    if(role !== null && role !== undefined){
      this.setData({role});
    }
  },
  //准考证
  getAdmissionTicket: function(e){
    let value = e.detail.value;
    if(value !== null && value !== undefined){
      this.setData({ticketNumber: value});
    }
  }
})
