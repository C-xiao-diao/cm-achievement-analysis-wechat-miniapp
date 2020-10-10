const app = getApp();
import * as echarts from './../../components/ec-canvas/echarts'

var rankData = [],monthData = [],chartLine = null;
var legendData = [];
var seriesData = []

Page({
  data: {
    userId: '',
    subject: '',
    role: '老师',
    yearMonth: '',
    studentName: '',
    ticketNumber: '',
    scoreArray: [],
    allRight: [],
    wrongQuestions: [],
    listResult: [],
    ec: {
      lazyLoad: true
    }
  },
  onLoad(option){
    this.initPage(option);
  },
  initPage(option){//页面初始
    if(option.subject){
      this.setData({
        'subject': option.subject,
        'role': option.role
      });
    }
    this.getSubjectData();
  },
  getSubjectData(){//获取成绩分析数据
    let Url = app.globalData.domain + '/auth/monthlyExamResults/list';
    var that = this;
    wx.request({
      url: Url,
      header: {'uid': app.globalData.userId},
      data: {'weChatUserId': app.globalData.userId},
      success:res=>{
        var resData = res.data;
        if(resData.code == 200){
          var d = resData.data;
          var y = d.yearMonth.substr(0,4);
          var m = d.yearMonth.substr(4,5);
          if(that.data.role==0){//老师
            if(that.data.subject!='全科'){//单科
              for(var i = 0; i < d.list.length; i++){
                d.list[i].objectiveQuestionsCorrectRate = Math.ceil(d.list[i].objectiveQuestionsCorrectRate*100) +'%';
              }
              for(var i = 0; i < d.wrongQuestions.length; i++){
                d.wrongQuestions[i].percentage = Math.ceil(d.wrongQuestions[i].percentage*100) +'%';
              }
              that.setData({
                scoreArray: d.list,
                allRight: d.allRight,
                wrongQuestions: d.wrongQuestions,
                class: d.class_,
                yearMonth: (y + '-' + m),
                studentName: d.list[0].studentName,
                ticketNumber: d.list[0].ticketNumber
              })
            }else{//全科
              that.setData({
                scoreArray: d.list,
                class: d.class_,
                yearMonth: (y + '-' + m),
                studentName: d.list[0].studentName,
                ticketNumber: d.list[0].ticketNumber
              })
            }
            this.getChartData();
          }else {//家长
            for(var i = 0; i < d.listResult.length; i++){
              d.listResult[i].scoreRange = Math.ceil(d.listResult[i].scoreRange*100) +'%';
            }
            that.setData({
              class: d.class_,
              yearMonth: (y + '-' + m),
              studentName: d.studentName,
              listResult: d.listResult
            })
            this.getStudentData();
          }
        }
      }
    })
  },
  getStudentData(){
    var list = this.data.listResult,legendData=[];
    for(var i = 0; i < list.length; i++){
      var arr = [];
      legendData.push(list[i].subject);
      arr.push(parseInt(list[i].scoreRange));
      seriesData.push({
        name: list[i].subject,
        type: 'line',
        stack: '排名',
        data: arr
      })
    }
    this.initChart();
  },
  getChartData(){
    var str = '';
    if(this.data.subject == '全科'){
      str = '/auth/monthlyExamResults/overallRankingTrend';
    }else {
      str = '/auth/monthlyExamResults/singleRankingTrend';
    }
    var Url = app.globalData.domain + str;
    var that = this;
    wx.request({
      url: Url,
      header: {'uid': app.globalData.userId},
      data: {
        'studentName': that.data.studentName,
        'ticketNumber': that.data.ticketNumber
      },
      success:res=>{
        var resData = res.data;
        if(resData.code == 200){
          var list = resData.data.list;
          rankData = [];monthData=[];
          for(var i = 0 ; i < list.length; i++){
            rankData.push(list[i].ranking);
            monthData.push(list[i].month +'月')
          }
          this.initChart();
        }
      }
    })
  },
  initChart(){
    var that = this;
    if(!this.chart){
      this.chart = this.selectComponent('#mychart');  
    }
    this.chart.init((canvas, width, height) => {
      chartLine = echarts.init(canvas, null, {
        width: width,
        height: height,
      });
      if(that.data.role==0){
        chartLine.setOption(this.getLineOption()); 
      }else {
        chartLine.setOption(this.getLinesOption()); 
      }
      
      return chartLine;
    });
  },
  getLineOption(){
    var option = {
      xAxis: {
        type: 'category',
        data: monthData,
        nameTextStyle: {
          fontSize: 40
        }
      },
      yAxis: {
        type: 'value',
        nameTextStyle: {
          fontSize: 40
        },
        inverse: true
      },
      series: [{
          data: rankData,
          type: 'line'
      }]
    };
    return option;
  },
  getLinesOption(){
    var option = {
      tooltip: {
          trigger: 'axis'
      },
      legend: {
          data: legendData
      },
      grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
      },
      xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['08月','09月','10月','11月','12月','01月','02月','03月','04月','05月','06月','07月']
      },
      yAxis: {
          type: 'value',
          inverse: true
      },
      series: seriesData
    };
    return option;
  }
})