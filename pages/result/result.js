const app = getApp();
import * as echarts from './../../components/ec-canvas/echarts'
import "./../../utils/fix";
import _ from "lodash";

var trendChart = null,topChart=null,secondChart=null,bottomChart=null;
var rankData = [],monthData = [];

Page({
  data: {
    userId: '',
    subject: '',
    role: 0,
    yearMonth: '',
    studentName: '',
    ticketNumber: '',
    scoreArray: [],
    showTrendChart: false,
    popupTop: 0,
    allRight: [],
    wrongQuestions: [],
    listResult: [],
    pass: 0,
    avgWrongQuestions: 0,//平均错误率
    maxScore:0,//最高分
    minScore:0,//最低分
    avgScore:0,//平均分
    fullMarks: 100,
    excellentRate: 0,//优秀率
    passingRate: 0,//及格率
    distinction: 0, //区分度
    sqrt: 0,//标准差
    difficultyFactor:0 ,//难度
    description: "",
    description2: '',
    currentTab1: 0,//top饼图柱状图tab
    currentTab2: 0,//bottom饼图柱状图tab
    // currentTab3: 0,//分数段tab
    tegmentedTab: 0, //分段tab
    //图表相关
    //顶部图表（各班对比）
    ecTop: {
      lazyLoad: true
    },
    topDataSeriesByExcellent: [],    //顶部图表优秀率数据
    topDataSeriesByPassing: [],    //顶部图表及格率数据
    //分数段统计
    ecSecond: {
      lazyLoad: true
    },
    secondPieDataSeries: [],        //分数段统计饼图数据
    secondBarYAxis: [],
    secondBarDataSeries: [],        //分数段统计饼图数据
    //学生排名趋势图
    ecThree: {
      lazyLoad: true
    },
    //作文分数段统计
    ecBottom: {
      lazyLoad: true
    },
    bottomPieDataSeries: [],
    bottomBarDataSeries: [],
    bottomBarYAxis: [],
    studentScoreList1: [],
    studentScoreList2: []
  },
  onLoad(option){
    wx.showLoading({
      title: '加载中...',
    })
    this.initPage(option);
  },
  onReady(){
    // this.initAllCharts();
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
    this.getDifficulty();
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
              let topDataSeriesByExcellent =[],  topDataSeriesByPassing= [];
              //顶部各班对比数据
              for(var i = 0; i < d.listClassResult.length; i++){
                topDataSeriesByExcellent.unshift(_.round(d.listClassResult[i].excellentRate, 3));
                topDataSeriesByPassing.unshift(_.round(d.listClassResult[i].passingRate, 3));
              }
              //作文分数段统计
              let bottomBarDataSeries = [],bottomPieDataSeries = [],bottomBarYAxis = [],studentScoreList2=[];
              if(this.data.subject && this.data.subject === "语文"){
                for(var i = 0; i < d.scoreSegmentStatisticsEssay.length; i++){
                  let obj = {};
                  obj.value = _.get(d, `scoreSegmentStatisticsEssay.${i}.list.amount`);
                  obj.name = _.get(d, `scoreSegmentStatisticsEssay.${i}.score`);
                  bottomBarYAxis.push(_.get(d, `scoreSegmentStatisticsEssay.${i}.score`));
                  bottomBarDataSeries.push(_.get(d, `scoreSegmentStatisticsEssay.${i}.list.amount`))
                  studentScoreList2.push(_.get(d, `scoreSegmentStatisticsEssay.${i}`));
                  bottomPieDataSeries.push(obj)
                }
              }
              //总体情况 数据修改
              d.avgScore = parseInt(d.avgScore);
              d.excellentRate = Math.ceil(d.excellentRate * 100);
              d.passingRate = Math.ceil(d.passingRate * 100);
              d.avgWrongQuestions = Math.ceil(d.avgWrongQuestions * 100);
              // --------------  end  ---------------
              that.setData({
                studentScoreList2,
                topDataSeriesByExcellent,
                topDataSeriesByPassing,
                bottomPieDataSeries,
                bottomBarYAxis,
                bottomBarDataSeries,
                maxScore: d.maxScore,//最高分
                minScore: d.minScore,//最低分
                avgScore: d.avgScore,//平均分
                excellentRate: d.excellentRate,//优秀率
                passingRate: d.passingRate,//及格率
                avgWrongQuestions: d.avgWrongQuestions,//平均错误率
                scoreArray: d.list,
                allRight: d.allRight,
                wrongQuestions: d.wrongQuestions,
                class: d.class_,
                yearMonth: (y + '-' + m),
                pass: (d.fullMarks*0.6),
                fullMarks: d.fullMarks
              })
            }else{//班主任页面数据
              that.setData({
                scoreArray: d.list,
                class: d.class_,
                yearMonth: (y + '-' + m)
              })
            }
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
          //初始化图表
          this.initTopChart();
          // this.initSecondChart();
          this.initBottomChart();
          // ------- end --------
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
    //获取单科分段人数统计
    this.getSingleScoreSegmentStatistics("10", 0);
  },

  //获取单科分数段得统计
  getSingleScoreSegmentStatistics:function(intervalValue, currentTab1){
    if(!intervalValue){
      intervalValue = "10";
    }
    let Url2 = app.globalData.domain + '/auth/monthlyExamResults/scoreSegmentStatistics';
    wx.request({
      url: Url2,
      header: {'uid': app.globalData.userId},
      data: {'weChatUserId': app.globalData.userId, intervalValue },
      success:res=>{
        var resData = res.data;
        if(resData.code == 200){
          let secondPieDataSeries = [], secondBarYAxis = [],secondBarDataSeries = [], studentScoreList1 = [];
          let scoreSegmentStatistics = resData.data.scoreSegmentStatistics;
          for(var i = 0; i < scoreSegmentStatistics.length; i++){
            let obj = {};
            studentScoreList1.push(scoreSegmentStatistics[i]);
            obj.value = _.get(scoreSegmentStatistics, `${i}.list.amount`);
            obj.name = _.get(scoreSegmentStatistics, `${i}.score`);
            secondPieDataSeries.push(obj);
            secondBarYAxis.push(_.get(scoreSegmentStatistics, `${i}.score`))
            secondBarDataSeries.push(_.get(scoreSegmentStatistics, `${i}.list.amount`))
          }
          this.setData({secondPieDataSeries, secondBarYAxis, secondBarDataSeries,studentScoreList1},()=>{
            // this.initSecondChart();
            if(!this.secondComponent){
              this.secondComponent = this.selectComponent('#secondChart'); 
            }
            if(currentTab1 == 0){
              this.initChart('secondComponent', '#secondBarChart', secondChart);
            } else {
              this.initChart('secondComponent', '#secondPieChart', secondChart);
            }
            
          });
        }
      }
    }) 
  },
  //获取试卷难度分析
  getDifficulty(){
    let Url = app.globalData.domain + '/auth/monthlyExamResults/difficultyAnalysisOfTestPaper';
    var that = this;
    wx.request({
      url: Url,
      header: {'uid': app.globalData.userId},
      data: {'weChatUserId': app.globalData.userId},
      success:res=>{
        var resData = res.data;
        if(resData.code == 200){
          var d = resData.data;
          let description = _.toNumber(d.sqrt) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(d.sqrt) > 5 ? "此次成绩为正常水平。":"此次成绩趋于集中，没有拉开差距。";
          let description2 = _.toNumber(d.difficultyFactor) >= 0.7 ?" 此次试题容易。" : _.toNumber(d.sqrt) > 0.4 ? "此次试题难度适中。":"此次试题偏难。";
          that.setData({
            distinction: d.distinction, //区分度
            sqrt: d.sqrt,//标准差
            difficultyFactor: d.difficultyFactor,//难度
            description,
            description2
          })
        }
      }
    })
  },
  //单科成绩列表下，点击学生名字显示排名趋势图
  getStudentInfo(e){
    var name = e.currentTarget.dataset.name;
    this.getTrendData(name);
    this.setData({
      popupTop: (e.changedTouches[0].clientY - 40),
    })
  },
  //获取学生成绩排名趋势图数据
  getTrendData(Name){
    var str = '',that = this;
    this.setData({'studentName': Name})
    var params = {
      'studentName': Name,
      'schoolId': this.data.schoolId,
      'class_': this.data.class
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
            monthData.push(list[i].month)
          }
          that.setData({showTrendChart: true});
          that.initTrendChart();//打开趋势图
        }
      }
    })
  },
  //关闭趋势图弹窗
  closePopup(){
    this.setData({showTrendChart: false})
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
    if(this.data.role==0 && this.data.subject=='语文'){
      this.initBottomChart();
    }
    //初始化趋势图
    this.initTrendChart();
  },

  //初始化顶部柱图（各班对比）
  initTopChart: function(){
    this.topComponent = this.selectComponent('#topChart');  
    this.initChart('topComponent', '#topChart', topChart);
  },
  //初始化第二项分数段统计（柱图/饼图 切换）
  initSecondChart: function(){
    this.secondComponent = this.selectComponent('#secondChart');  
    this.initChart('secondComponent', '#secondBarChart', secondChart);
  },
  //初始化底部柱状图
  initBottomChart: function(){
    this.bottomComponent = this.selectComponent('#bottomChart');
    this.initChart('bottomComponent', '#bottomBarChart', bottomChart);  
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
      case '#secondBarChart':
        option = this.getBarOption(0); 
        break;
      case  '#secondPieChart':
        option = this.getPieOption(0); 
        break;
      case '#bottomBarChart':
        option = this.getBarOption(1);
        break;
      case '#bottomPieChart':
        option = this.getPieOption(1);
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
        devicePixelRatio: wx.getSystemInfoSync().pixelRatio || app.globalData.pixelRatio  // 像素
      });
      this.setOption(whichChart, dom);
      return whichChart;
    });
  },
  //切换 柱状图/饼状图
  swichNav: function( e ) {
    var that = this, tab = e.currentTarget.dataset.name;
    if( this.data[tab] === e.target.dataset.current ) {
        return false;
    } else {
      that.setData( { [tab]: e.target.dataset.current, })
    }
    if(tab=='currentTab1'){//分数段柱状图
      if(this.data[tab]==0){
        this.initChart('secondComponent', '#secondBarChart', secondChart);  
      } else {
        this.initChart('secondComponent', '#secondPieChart', secondChart);  
      }
    } else if(tab=='currentTab2'){
      if(this.data[tab]==0){
        this.initChart('bottomComponent', '#bottomBarChart', bottomChart);  
      } else {
        this.initChart('bottomComponent', '#bottomPieChart', bottomChart);  
      }
    }
  },
  swichNav2:function(e){
    let currentTab1 = this.data["currentTab1"];
    let current = e.currentTarget.dataset.current;
    this.setData({tegmentedTab: current});
    if(current == 0){
      this.getSingleScoreSegmentStatistics("10",currentTab1);
    } else if(current == 1){
      this.getSingleScoreSegmentStatistics("20",currentTab1);
    } else {
      this.getSingleScoreSegmentStatistics("50",currentTab1);
    }
  },

  //老师端 - 各班对比图option
  getTopChartOption(){
    const { topDataSeriesByExcellent, topDataSeriesByPassing, } = this.data;
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
              data: ['C1801', 'C1802', 'C1803', 'C1804', 'C1805','C1806', 'C1807', 'C1808', 'C1809', 'C1810'],
              inverse: true
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
              data: topDataSeriesByExcellent,
          },
          {
              name: '及格率',
              type: 'bar',
              label: {
                  show:true
              },
              barGap: "0",
              data: topDataSeriesByPassing,
          }
      ]
    };
    return option;
  },
  //老师端 - 分数段统计饼图option
  getPieOption(postion){
    var that = this;
    const { secondPieDataSeries,bottomPieDataSeries } = this.data;
    var option = {
      title: {
          left: 'center'
      },
      // color:['#516b91','#59c4e6','#edafda','#93b7e3','#a5e7f0','#cbb0e3'],
      color: ['#516b91','#59c4e6','#edafda','#93b7e3','#a5e7f0','#cbb0e3','#fad680','#9ee6b7','#37a2da','#ff9f7f',    '#67e0e3','#9ee6b7','#a092f1','#c1232b','#27727b'],
      tooltip: {
          trigger: 'item',
          position: ['15%', '0'],
          textStyle: {
            'width': '80%',
            // 'height': '300px'
          },
          formatter: function(params){
            var res = that.getFormatter(params, 'pie' , postion);
            return res;
          }
      },
      series: [
          {
              name: '访问来源',
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: postion === 0 ? secondPieDataSeries : bottomPieDataSeries,
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
  getBarOption(postion){
    const { bottomBarYAxis, bottomBarDataSeries, secondBarYAxis, secondBarDataSeries} = this.data;
    var that = this;
    var option = {
      color: ['#516b91'],
      grid:{
        left: "18%",
        right:"15%"
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
            triggerOn: 'click'
        },
        position: ['15%', '0%'],
        extraCssText: 'width: 60%;height:100%;',
        formatter: function(params){
          var res = that.getFormatter(params, 'bar', postion);
          return res;
        }
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
              // data: ['0-10', '10-20', '20-30', '30-40', '40-50','50-60', '60-70', '70-80', '80-90', '90-100']
              data: postion === 0 ? secondBarYAxis : bottomBarYAxis,
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
              // data: [1, 2, 3, 5, 6, 5, 7, 8, 12, 20]
              data: postion === 0 ? secondBarDataSeries : bottomBarDataSeries
          }
      ]};
      return option;
  },
  //老师端 - 学生排名趋势图option
  getTrendChartOption(){
    var option = {
      grid:{
        left: "15%",
        right: "5%",
        top:" 5%",
        bottom: "18%",
      },
      tooltip: {
        trigger: 'axis'
      },
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
  //分数段对比图 提示框数据组装
  getFormatter(params, type, postion){
    var interval;
    if(type=='pie'){
      interval = params.data.name;
    }else{
      interval = params[0].axisValue;
    }
    var data,res='',list=[];
    if(postion === 0){
      data = this.data.studentScoreList1;
    }else{
      data = this.data.studentScoreList2;
    }
    for (var i = 0; i < data.length; i++) {
      if(data[i].score==interval){
        list = data[i].list.list;
      }
    }
    for (var i = 0; i < list.length; i++) {
      if(i % 2 ===0){
        if(list[i+1]){
          res += this.clearData(list[i].studentName, list[i].score) +  '   ' + this.clearData(list[i+1].studentName,list[i+1].score) + '\n';
        } else {
          res += this.clearData(list[i].studentName, list[i].score) + '   ' + '\n';
        }
      }
    }
    return res;
  },
  // 图表tooltip 的formatter 函数的数据组装
  clearData: function(name, score){
    let str = "";
    if(_.size(name) === 2){
      str = _.first(name) + '   ' + _.last(name) + '：' + score + '分';
    } else if(_.size(name) === 3){
      str = name + '：' + score + '分';
    } else if(_.size(name) === 4){
      str = name + '：' + score + '分';
    }
    return str;
  }
})