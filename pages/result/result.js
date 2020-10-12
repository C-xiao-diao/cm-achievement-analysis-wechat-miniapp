const app = getApp();
import * as echarts from './../../components/ec-canvas/echarts'
import _ from "lodash";

var rankData = [],monthData = [],chartLine = null,compareChart=null;
var monthArr = ['08月','09月','10月','11月','12月','01月','02月','03月','04月','05月','06月','07月'];
var legendData = [];
var seriesData = [];

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
    pass: 0,
    ec: {
      lazyLoad: true
    }
  },
  onLoad(option){
    wx.showLoading({
      title: '加载中...',
    })
    this.initPage(option);
  },
  initPage(option){//页面初始
    if(option.subject){
      this.setData({
        'subject': option.subject,
        'subjectId': option.subjectId,
        'role': option.role,
        'schoolId': option.schoolId
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
            if(that.data.subject!='全科'){//单科老师
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
                pass: (d.fullMarks*0.6),
                studentName: d.list[0].studentName,
                ticketNumber: d.list[0].ticketNumber
              })
            }else{//班主任
              that.setData({
                scoreArray: d.list,
                class: d.class_,
                yearMonth: (y + '-' + m),
                studentName: d.list[0].studentName,
                ticketNumber: d.list[0].ticketNumber
              })
            }
            this.getChartData(d.list[0].studentName, d.class_);
          }else {//家长
            for(var i = 0; i < d.listResult.length; i++){
              d.listResult[i].scoreRange = Math.ceil(d.listResult[i].scoreRange*100);
            }
            that.setData({
              class: d.class_,
              yearMonth: (y + '-' + m),
              studentName: d.studentName,
              listResult: d.listResult
            })
            this.getStudentData(d.listResult);//家长端查询学生排名趋势
          }
        } else if(resData.code == 107){
          wx.showModal({
            title: '提示',
            content:  resData.msg || '暂无数据',
            success (res) {
              if (res.confirm) {
                wx.navigateBack({  delta: 0,})
              } else if (res.cancel) {
                wx.navigateBack({  delta: 0,})
              }
            }
          })
        }
      },
      complete: res=>{
        wx.hideLoading();
      }
    })
  },
  getStudentData(list){ //查询学生排名趋势
    var legendData=[],
        seriesData = [],
        str = this.data.yearMonth, 
        month = str.substr(str.length-2)+'月',
        index = 0;
    monthArr.map((i, f)=>{
      if(i == month){ index = f;}
    });
    for(var i = 0; i < list.length; i++){
      legendData.push(list[i].subject);
      seriesData.push({
        name: list[i].subject,
        type: 'line',
        stack: '排名',
        data: []
      })
    }
    for(var i = 0; i < list.length; i++){
      for(var j = 0; j < list.length; j++){
        seriesData[i].data[index] = list[i].scoreRange;
      }
    }
    this.initChart();
  },
  getChartData(Name, Class){//
    var str = '';
    var params = {
      'studentName': Name,
      'schoolId': this.data.schoolId,
      'class_': Class
    };
    if(this.data.role == 0){//老师
      if(this.data.subject == '全科'){
        str = '/auth/monthlyExamResults/overallRankingTrend';
      }else {
        str = '/auth/monthlyExamResults/singleRankingTrend';
        params.subject = this.data.subjectId;
      }
    }else {//家长
      str = '/auth/monthlyExamResults/personalPerformanceAnalysis';
    }
    
    var Url = app.globalData.domain + str;
    wx.request({
      url: Url,
      header: {'uid': app.globalData.userId},
      data: params,
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
  getBarOption(){//老师端 - 各班对比图
    var option = {
      backgroundColor:'#fff',
      color: ['#edafda', '#93b7e3'],
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          }
      },
      legend: {
          data: ['优秀率 ', '及格率']
      },
      toolbox: {
          show: true,
          orient: 'vertical',
          left: 'right',
          top: 'center',
          feature: {
              mark: {show: true},
              dataView: {show: true, readOnly: false},
              magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
              restore: {show: true},
              saveAsImage: {show: true}
          }
      },
      xAxis: [
          {
              type: 'value'
          }
      ],
      yAxis: [
          {
              data: ['C1801', 'C1802', 'C1803', 'C1804', 'C1805','C1806', 'C1807', 'C1808', 'C1809', 'C1810']
          }
      ],
      series: [
          {
              name: '优秀率 ',
              type: 'bar',
              barGap: 0,
              label: {
                  show:true
              },
              data: [0.3, 0.2, 0.4, 0.5, 0.3,0.3, 0.2, 0.4, 0.5, 0.3]
          },
          {
              name: '及格率',
              type: 'bar',
              label: {
                  show:true
              },
              data: [0.3, 0.2, 0.4, 0.5, 0.3,0.3, 0.2, 0.4, 0.5, 0.3]
          }
      ]
    };
  },
  getLineOption(){//老师端 - 排名趋势图
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
  getLinesOption(){//家长端 - 排名趋势图
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
          data: monthArr
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