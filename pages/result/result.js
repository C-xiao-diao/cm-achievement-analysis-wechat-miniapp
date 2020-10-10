const app = getApp();
import * as echarts from './../../components/ec-canvas/echarts'

var rankData = [],monthData = [],chartLine = null;

Page({
  data: {
    userId: '',
    subject: '',
    class: '',
    yearMonth: '',
    studentName: '',
    ticketNumber: '',
    scoreArray: [],
    allRight: [],
    wrongQuestions: [],
    ec: {
      lazyLoad: true
    }
  },
  onLoad(option){
    this.initPage(option);
  },
  initPage(option){//页面初始
    this.setData({'subject': option.subject});
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
          that.setData({
            scoreArray: d.list,
            allRight: d.allRight,
            wrongQuestions: d.wrongQuestions,
            class: d.class_,
            yearMonth: (y + '-' + m),
            studentName: d.list[0].studentName,
            ticketNumber: d.list[0].ticketNumber,
          })
          this.getChartData();
        }
      }
    })
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
    if(!this.chart){
      this.chart = this.selectComponent('#mychart');  
    }
    this.chart.init((canvas, width, height) => {
      chartLine = echarts.init(canvas, null, {
        width: width,
        height: height,
      });
      chartLine.setOption(this.getLineOption()); 
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
  }
})