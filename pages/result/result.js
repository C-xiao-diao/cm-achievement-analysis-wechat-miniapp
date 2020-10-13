const app = getApp();
import * as echarts from './../../components/ec-canvas/echarts'
import _ from "lodash";

var trendChart = null,topChart=null,secondChart=null,bottomChart=null;
var rankData = [],monthData = [];
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
    currentTab1: 0,
    currentTab2: 0,
    //
    ecTop: {
      lazyLoad: true
    },
    ecSecond: {
      lazyLoad: true
    },
    ecThree: {
      lazyLoad: true
    },
    ecBottom: {
      lazyLoad: true
    },
  
  },
  onLoad(option){
    wx.showLoading({
      title: '加载中...',
    })
    this.initPage(option);
  },
  onReady(){
    this.initAllCharts();
  },
  //页面初始
  initPage(option){
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
  //获取成绩分析页面数据
  getSubjectData(){
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
          //年-月 月考时间
          var y = d.yearMonth.substr(0,4);
          var m = d.yearMonth.substr(4,5);

          if(that.data.role==0){
            if(that.data.subject!='全科'){//单科老师页面数据
              //小数点数据*100操作
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
            }else{//班主任页面数据
              that.setData({
                scoreArray: d.list,
                class: d.class_,
                yearMonth: (y + '-' + m),
                studentName: d.list[0].studentName,
                ticketNumber: d.list[0].ticketNumber
              })
            }
            // this.getTrendData(d.list[0].studentName, d.class_);
          }else {//家长端页面数据
            for(var i = 0; i < d.listResult.length; i++){
              d.listResult[i].scoreRange = Math.ceil(d.listResult[i].scoreRange*100);
            }
            that.setData({
              class: d.class_,
              yearMonth: (y + '-' + m),
              studentName: d.studentName,
              listResult: d.listResult
            })
            //this.getStudentData(d.listResult);//家长端查询学生排名趋势
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
  //修改学生排名趋势数据
  // getStudentData(list){ 
  //   var legendData=[],
  //       seriesData = [],
  //       str = this.data.yearMonth, 
  //       month = str.substr(str.length-2)+'月',
  //       index = 0;
  //   monthArr.map((i, f)=>{
  //     if(i == month){ index = f;}
  //   });
  //   for(var i = 0; i < list.length; i++){
  //     legendData.push(list[i].subject);
  //     seriesData.push({
  //       name: list[i].subject,
  //       type: 'line',
  //       stack: '排名',
  //       data: []
  //     })
  //   }
  //   for(var i = 0; i < list.length; i++){
  //     for(var j = 0; j < list.length; j++){
  //       seriesData[i].data[index] = list[i].scoreRange;
  //     }
  //   }
  //   // this.initChart();
  // },
  //获取学生成绩排名趋势图数据
  getTrendData(Name, Class){
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
        }
      }
    })
  },
  /**
   * 初始化所有需要初始化得图表
   */
  initAllCharts: function(){
    //初始化顶部柱图（各班对比）
    this.initTopChart()
    //初始化第二项分数段统计（柱图/饼图 切换）
    this.initSecondChart();
    //初始化底部柱状图
    this.initBottomChart();
    //初始化趋势图
    // this.initTrendChart();
  },

  //初始化顶部柱图（各班对比）
  initTopChart: function(){
    this.topComponent = this.selectComponent('#topChart');  
    this.initChart('topComponent', '#topChart', topChart);
  },
  //初始化第二项分数段统计（柱图/饼图 切换）
  initSecondChart: function(){
    this.secondComponent = this.selectComponent('#secondChart');  
    this.initChart('secondComponent', '#secondChart', secondChart);
  },
  //初始化底部柱状图
  initBottomChart: function(){
    this.bottomComponent = this.selectComponent('#bottomChart');
    this.initChart('bottomComponent', '#bottomChart', bottomChart);  
  },
  //初始化趋势图
  initTrendChart: function(){
    this.trendComponent = this.selectComponent('#trendChart');
    this.initChart('trendComponent', '#trendChart', trendChart);  
  },
  //图表设置
  setOption:function(whichChart,dom){
    var option;
    switch(dom){
      case '#topChart':
        option = this.getTopChartOption(); 
        break;
      case '#secondChart':
        option = this.getPieOption(); 
        break;
      case '#bottomChart':
        option = this.getBarOption();
        break;
      case '#trendChart':
        option = this.getTrendChartOption();
        break;
    }
    whichChart.setOption(option); 
    return whichChart;
  },
  //图表初始化方法
  initChart(chartComponent, dom, whichChart){
    if(!this[chartComponent]){
      this[chartComponent] = this.selectComponent(dom);  
    }
    this[chartComponent].init((canvas, width, height) => {
      whichChart = echarts.init(canvas, null, {
        width: width,
        height: height,
      });
      this.setOption(whichChart, dom);
    });
  },
  //切换 柱状图/饼状图
  swichNav: function( e ) {
    var that = this, tab = e.currentTarget.dataset.name;
    if( this.data[tab] === e.target.dataset.current ) {
        return false;
    } else {
        that.setData( {
            [tab]: e.target.dataset.current
        })
    }
    if(tab=='currentTab1' && this.data[tab]==0){//分数段饼状图
      
    }
    console.log(tab, this.data[tab])
  },
  //老师端 - 各班对比图option
  getTopChartOption(){
    var option = {
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
      grid:{
        left: "20%",
        top: "10%",
        bottom: "10%",
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
              label: {
                  show:true
              },
              barGap: "0",
              data: [0.3, 0.2, 0.4, 0.5, 0.3,0.3, 0.2, 0.4, 0.5, 0.3]
          },
          {
              name: '及格率',
              type: 'bar',
              label: {
                  show:true
              },
              barGap: "0",
              data: [0.3, 0.2, 0.4, 0.5, 0.3,0.3, 0.2, 0.4, 0.5, 0.3]
          }
      ]
    };
    return option;
  },
  //老师端 - 分数段统计饼图option
  getPieOption(){
    var option = {
      title: {
          left: 'center'
      },
      backgroundColor:'#fff',
      color:['#516b91','#59c4e6','#edafda','#93b7e3','#a5e7f0','#cbb0e3'],
      tooltip: {
          trigger: 'item',
          // formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      series: [
          {
              name: '访问来源',
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: [
                  {value: 1, name: '0-10'},
                  {value: 2, name: '10-20'},
                  {value: 3, name: '20-30'},
                  {value: 4, name: '30-40'},
                  {value: 5, name: '40-50'},
                  {value: 6, name: '50-60'},
                  {value: 7, name: '60-70'},
                  {value: 8, name: '70-80'},
                  {value: 9, name: '80-90'},
                  {value: 20, name: '90-100'}
              ],
              emphasis: {
                  itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              }
          }
      ]};
    return option;
  },
  //老师端 - 分数段统计柱状图option
  getBarOption(){
    var option = {
      color: ['#516b91'],
      grid:{
        left: "15%",
        right:"15%"
      },
      xAxis: [
          {
              type: 'value',
              name:'人数'
          }
      ],
      yAxis: [
          {   
              name:'分数区间段',
              data: ['0-10', '10-20', '20-30', '30-40', '40-50','50-60', '60-70', '70-80', '80-90', '90-100']
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
              data: [1, 2, 3, 5, 6, 5, 7, 8, 12, 20]
          }
      ]};
      return option;
  },
  //老师端 - 学生排名趋势图option
  getTrendChartOption(){
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
  // getLinesOption(){//家长端 - 排名趋势图
  //   var option = {
  //     tooltip: {
  //         trigger: 'axis'
  //     },
  //     legend: {
  //         data: legendData
  //     },
  //     grid: {
  //         left: '3%',
  //         right: '4%',
  //         bottom: '3%',
  //         containLabel: true
  //     },
  //     xAxis: {
  //         type: 'category',
  //         boundaryGap: false,
  //         data: ['08月','09月','10月','11月','12月','01月','02月','03月','04月','05月','06月','07月']
  //     },
  //     yAxis: {
  //         type: 'value',
  //         inverse: true
  //     },
  //     series: seriesData
  //   };
  //   return option;
  // }
})