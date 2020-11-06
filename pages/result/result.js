const app = getApp();
const util = require('../../utils/util.js')
import { http, chart } from "./../../utils/util";
import "./../../utils/fix";
import _ from "./../../utils/lodash";

var trendChart = null, topChartByScore = null, topChart = null, secondChart = null, bottomChart = null;
var rankData = [], monthData = [];

Page({
  data: {
    userId: '',
    subject: '',
    userType: 1,
    class_: '',
    yearMonth: '',
    studentName: '',
    ticketNumber: '',
    scoreArray: [],
    showTrendChart: false,
    articleIntervalValue: 10,
    allRight: [],
    wrongQuestions: [],
    listResult: [],
    pass: 0,
    avgWrongQuestions: 0,//平均错误率
    maxScore: 0,//最高分(班级)
    minScore: 0,//最低分(班级)
    avgScore: 0,//平均分(班级)
    maxScoreAllClass: 0,//最高分(年级)
    minScoreAllClass: 0,//最高分(年级)
    avgScoreAllClass: 0,//最高分(年级)
    fullMarks: 100,
    excellentLine: 85,//优秀线
    excellentRate: 0,//优秀率
    passingRate: 0,//及格率
    distinction: 0, //区分度
    sqrt: 0,//标准差
    difficultyFactor: 0,//难度
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
    ecTopByScore: {
      lazyLoad: true
    },
    topDataSeriesByScoreMax: [],    //顶部图表最高分
    topDataSeriesByScoreMin: [],    //顶部图表最低分
    topDataSeriesByScoreAvg: [],    //顶部图表平均分
    topDataAxis1: [], //优秀及格率图表 - 班级列表
    topDataAxis2: [], //最高低分图表 - 班级列表
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
  onLoad(option) {
    //获取缓存内的数据，初始化数据
    let excellentLine = null;
    try {
      excellentLine = wx.getStorageSync('excellentLine');
    } catch (e) {

    }
    wx.showLoading({
      title: '加载中...',
    })
    this.initPage(option,excellentLine);
  },
  onShareAppMessage:function(e){
    console.log(e,'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
  },
  onUnload: function(){
    this.topComponent = null;
    this.topChartComponent = null;
    this.secondComponent = null;
    this.bottomComponent = null;
    this.trendComponent = null;
  },
  //页面初始
  initPage(option,excellentLine) {
    if (option.subject) {
      this.setData({
        subject: option.subject,
        subjectId: option.subjectId,
        schoolId: option.schoolId,
        class_: option.class_,
        userType: option.userType,
        excellentLine: excellentLine || 85
      });
    }
    this.getSubjectData(this.data.excellentLine, option);
    this.getDifficulty(option);
  },
  //获取用户输入的优秀线
  getExcellentRate(e){
    const { subject, subjectId, schoolId, excellentLine, class_,userType } = this.data;
    var regInterger = /(^[1-9]\d*$)/;
    let value = e.detail.value;
    if(!regInterger.test(value)){
      wx.showToast({title: '请输入正整数',icon: 'none',duration: 1500});
      return;
    }
    if(value < 10 || value > 100){
      wx.showToast({title: '请输入两位数',icon: 'none',duration: 1500});
      return;
    }
    //存入本地缓存
    try {
      wx.setStorageSync('excellentLine', value)
    } catch (e) {

    }
    let option = {};
    option.subject = subject;
    option.subjectId = subjectId;
    option.schoolId = schoolId;
    option.excellentRate = value || excellentLine;
    option.class_ = class_;
    option.userType  = userType;
    //end
    this.getSubjectData(value, option);
  },
  //获取成绩分析页面数据
  getSubjectData(exLine,option) {
    let cmd = "/auth/monthlyExamResults/list";
    let data = { 
      'weChatUserId': app.globalData.userId, 
      excellentRate: exLine
    };
    data = _.assign(data, option, {subject: _.get(option, 'subjectId')});
    http.get({
      cmd,
      data,
      success: res=>{
        var resData = res.data;
        if (resData.code == 200) {
          var d = resData.data;
          //年-月 月考时间
          var y = d.yearMonth.substr(0, 4);
          var m = d.yearMonth.substr(4, 5);

          
          if (this.data.subject != '全科') {//单科老师页面数据
            //小数点数据*100操作
            for (var i = 0; i < d.list.length; i++) {
              d.list[i].objectiveQuestionsCorrectRate = Math.ceil(d.list[i].objectiveQuestionsCorrectRate * 100) + '%';
            }
            for (var i = 0; i < d.wrongQuestions.length; i++) {
              d.wrongQuestions[i].percentage = Math.ceil(d.wrongQuestions[i].percentage * 100) + '%';
            }
            let topDataSeriesByExcellent = [], topDataSeriesByPassing = [], topDataAxis1 = [];
            //顶部各班对比数据
            for (var i = 0; i < d.listClassResult.length; i++) {
              topDataSeriesByExcellent.unshift(util.returnFloat(d.listClassResult[i].excellentRate * 100));
              topDataSeriesByPassing.unshift(util.returnFloat(d.listClassResult[i].passingRate * 100));
              topDataAxis1.unshift(d.listClassResult[i].class_);
            }
            //作文分数段统计
            if (this.data.subject && this.data.subject === "语文") {
              this.getEssayAnalysis(option);
            }
            //总体情况 数据修改
            d.avgScore = util.returnFloat(d.avgScore);
            d.excellentRate = util.returnFloat(d.excellentRate * 100);
            d.passingRate = util.returnFloat(d.passingRate * 100);
            d.avgWrongQuestions = Math.ceil(d.avgWrongQuestions * 100);
            // --------------  end  ---------------
            this.setData({
              excellentLine: exLine,
              topDataAxis1,
              topDataSeriesByExcellent,
              topDataSeriesByPassing,
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
              pass: (d.fullMarks * 0.6),
              fullMarks: d.fullMarks
            })
          } else {//班主任页面数据
            this.setData({
              scoreArray: d.list,
              class: d.class_,
              yearMonth: (y + '-' + m)
            })
          }
          //初始化图表
          this.initTopChart();
          this.initSecondChart();
          
          // ------- end --------
        } else if (resData.code == 107) {
          wx.showModal({
            title: '提示',
            content: resData.msg || '暂无数据',
            success(res) {
              if (res.confirm) {
                wx.navigateBack({ delta: 0, })
              } else if (res.cancel) {
                wx.navigateBack({ delta: 0, })
              }
            }
          })
        }
      },
      complete: res => {
        wx.hideLoading();
      }
    })
    //获取单科页面全年级分析及各班的优秀率
    this.getAllClassesAnalysisScore(option);
    //获取单科分段人数统计
    this.getSingleScoreSegmentStatistics(0, 0,option);
  },
  //获取单科页面全年级分析及各班的优秀率
  getAllClassesAnalysisScore: function (option) {
    let cmd = "/auth/allClassesAnalysis/allClassesAnalysisScore";
    let data = _.assign({ 'weChatUserId': app.globalData.userId, },option, {subject: _.get(option, 'subjectId')});
    http.get({
      cmd,
      data,
      success: res => {
        if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
          let responseData = _.get(res, 'data.data');
          let topDataSeriesByScoreMax = [], topDataSeriesByScoreMin = [], topDataSeriesByScoreAvg = [], topDataAxis2 = [];
          let { minScore, avgScore, maxScore, listGroupClassStatistics } = responseData;
          for (let i = 0; i < listGroupClassStatistics.length; i++) {
            topDataSeriesByScoreMax.unshift(listGroupClassStatistics[i].maxScore)
            topDataSeriesByScoreMin.unshift(listGroupClassStatistics[i].minScore)
            topDataSeriesByScoreAvg.unshift(util.returnFloat(listGroupClassStatistics[i].avgScore))
            topDataAxis2.unshift(listGroupClassStatistics[i].class_)
          }
          this.setData({
            topDataSeriesByScoreMax, topDataSeriesByScoreMin, topDataSeriesByScoreAvg,
            maxScoreAllClass: maxScore,
            minScoreAllClass: minScore,
            avgScoreAllClass: util.returnFloat(avgScore),
            topDataAxis2
          });
          this.initTopChartByScore();
        }
      }
  })
  },
  //获取用户输入的分数段
  getScoreInterval:function(e){
    var reg = /(^[1-9]\d*$)/;
    let name = e.currentTarget.dataset.name;
    let value = e.detail.value;
    if(!reg.test(value)){
      wx.showToast({ title: '请输入正整数', icon: 'none', duration: 1500 });
      return;
    }
    const { subjectId, schoolId, class_, userType } = this.data;
    this.setData({ [name]: value });
    let option = {
      subjectId: subjectId,
      schoolId: schoolId,
      class_: class_,
      userType: userType
    }
    this.getEssayAnalysis(option);
  },
  //获取作文分数段统计
  getEssayAnalysis:function(option){
    let cmd = "/auth/monthlyExamResults/essayAnalysis";
    let data = { 
      schoolId: option.schoolId,
      class_: option.class_,
      userType: option.userType,
      subject: option.subjectId,
      intervalValue: this.data.articleIntervalValue
     };
    http.get({
        cmd,
        data,
        success: res=>{
            if(_.get(res,'data.code')===200){
              let d = _.get(res,'data.data');
              let bottomBarDataSeries = [], bottomPieDataSeries = [], bottomBarYAxis = [], studentScoreList2 = [];
              for (var i = 0; i < d.scoreSegmentStatisticsEssay.length; i++) {
                let obj = {};
                obj.value = _.get(d, `scoreSegmentStatisticsEssay.${i}.list.amount`);
                obj.name = _.get(d, `scoreSegmentStatisticsEssay.${i}.score`);
                bottomBarYAxis.push(_.get(d, `scoreSegmentStatisticsEssay.${i}.score`));
                bottomBarDataSeries.push(_.get(d, `scoreSegmentStatisticsEssay.${i}.list.amount`))
                studentScoreList2.push(_.get(d, `scoreSegmentStatisticsEssay.${i}`));
                bottomPieDataSeries.push(obj)
              }
              this.setData({bottomBarYAxis,bottomBarDataSeries,studentScoreList2,bottomPieDataSeries});
              this.initBottomChart();
            }
        }
    })
    
  },
  //获取单科分数段得统计
  getSingleScoreSegmentStatistics: function (current, currentTab1, option) {
    let intervalValue = '';
    if(current == 0){
      intervalValue = '10'
    }else if (current == 1){
      intervalValue = '20'
    }else {
      intervalValue = '50'
    }

    let cmd = "/auth/monthlyExamResults/scoreSegmentStatistics";
    let data = _.assign({ 'weChatUserId': app.globalData.userId, intervalValue},option, {subject: _.get(option, 'subjectId')});
    http.get({
      cmd,
      data,
      success: res => {
          if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
            var resData = res.data;
            let secondPieDataSeries = [], secondBarYAxis = [], secondBarDataSeries = [], studentScoreList1 = [];
            let scoreSegmentStatistics = resData.data.scoreSegmentStatistics;
            for (var i = 0; i < scoreSegmentStatistics.length; i++) {
              let obj = {};
              studentScoreList1.push(scoreSegmentStatistics[i]);
              obj.value = _.get(scoreSegmentStatistics, `${i}.list.amount`);
              obj.name = _.get(scoreSegmentStatistics, `${i}.score`);
              secondPieDataSeries.push(obj);
              secondBarYAxis.push(_.get(scoreSegmentStatistics, `${i}.score`))
              secondBarDataSeries.push(_.get(scoreSegmentStatistics, `${i}.list.amount`))
            }
            this.setData({ 
              secondPieDataSeries, 
              secondBarYAxis, 
              secondBarDataSeries, 
              studentScoreList1,
              tegmentedTab: current
            }, () => {
              // this.initSecondChart();
              if (!this.secondComponent) {
                this.secondComponent = this.selectComponent('#secondChart');
              }
              if (currentTab1 == 0) {
                chart.initChart(this, 'secondComponent', '#secondBarChart', secondChart);
              } else {
                chart.initChart(this, 'secondComponent', '#secondPieChart', secondChart);
              }
              wx.hideLoading();
            });
          }
      }
    })
  },
  //获取试卷难度分析
  getDifficulty(option) {
    let cmd = "/auth/monthlyExamResults/difficultyAnalysisOfTestPaper";
    let data = _.assign({ 'weChatUserId': app.globalData.userId}, option, {subject: _.get(option, "subjectId")});
    http.get({
      cmd,
      data,
      success: res => {
          if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
            var d = res.data.data;
            let description = _.toNumber(d.sqrt) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(d.sqrt) > 5 ? "此次成绩为正常水平。" : "此次成绩趋于集中，没有拉开差距。";
            let description2 = _.toNumber(d.difficultyFactor) >= 0.7 ? " 此次试题容易。" : _.toNumber(d.sqrt) > 0.4 ? "此次试题难度适中。" : "此次试题偏难。";
            this.setData({
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
  getStudentInfo(e) {
    var name = e.currentTarget.dataset.name;
    this.getTrendData(name);
  },
  //获取学生成绩排名趋势图数据
  getTrendData(Name) {
    var str = '';
    var params = {
      'studentName': Name,
      'schoolId': this.data.schoolId,
      'class_': this.data.class
    };
    if (this.data.subject == '全科') {
      str = '/auth/monthlyExamResults/overallRankingTrend';
    } else {
      str = '/auth/monthlyExamResults/singleRankingTrend';
      params.subject = this.data.subjectId;
    }

    let cmd = str;
    let data = params;
    http.get({
      cmd,
      data,
      success: res => {
          if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
            var resData = res.data;
            var list = resData.data.list;
            rankData = []; monthData = [];
            for (var i = 0; i < list.length; i++) {
              rankData.push(list[i].ranking);
              monthData.push(list[i].month)
            }
            this.setData({ showTrendChart: true, studentName: Name });
            this.initTrendChart();//打开趋势图
          }
      }
    })
  },
  //关闭趋势图弹窗
  closePopup() {
    this.setData({ showTrendChart: false })
    this.trendComponent = null;
  },
  //初始化顶部柱图（各班对比-优秀率和及格率）
  initTopChart: function () {
    this.topComponent = this.selectComponent('#topChart');
    chart.initChart(this, 'topComponent', '#topChart', topChart);
  },
  //初始化顶部柱图（各班对比-分数）
  initTopChartByScore: function () {
    this.topChartComponent = this.selectComponent('#topChartByScore');
    chart.initChart(this, 'topChartComponent', '#topChartByScore', topChartByScore);
  },
  //初始化第二项分数段统计（柱图/饼图 切换）
  initSecondChart: function () {
    this.secondComponent = this.selectComponent('#secondChart');
    chart.initChart(this, 'secondComponent', '#secondBarChart', secondChart);
  },
  //初始化底部柱状图
  initBottomChart: function () {
    this.bottomComponent = this.selectComponent('#bottomChart');
    chart.initChart(this, 'bottomComponent', '#bottomBarChart', bottomChart);
  },
  //初始化趋势图
  initTrendChart: function () {
    this.trendComponent = this.selectComponent('#trendChart');
    chart.initChart(this, 'trendComponent', '#trendChart', trendChart);

  },
  /*
    获取全年级各班对比数据 
    type==0 : 优秀率/及格率
    type==1 : 最高分/最低分/平均分
  */
  getClassCompareData(type) {
    let _this = this;
    var colorData = [], legendData = [], xData = [], yData = [],
      gridSetting = {}, seriesData = [], tooltipSetting = [];
    const { topDataAxis1, topDataAxis2, topDataSeriesByExcellent, topDataSeriesByPassing
      , topDataSeriesByScoreMax, topDataSeriesByScoreMin, topDataSeriesByScoreAvg } = this.data;

    if (type == 0) {
      colorData = ['#edafda', '#93b7e3'];
      legendData = ['优秀率', '及格率'];
      yData = [
        {
          data: topDataAxis1,  //y轴数据
          inverse: true,
          axisLabel: {
            formatter: function (value) {
              if(value === _this.data.class){
                return '{' + value + '| }{value|' + value + '}';   
              } else {
                return value;
              }           
            },
            rich: {
              value: {
                color: 'red'
              }
            }
          },
        }
      ];
      seriesData = [{
        name: '优秀率',
        type: 'bar',
        label: {
          show: true,
          position: 'right',
          formatter: (params) => {
            return params.value + "%";
          }
        },
        barGap: "0",
        data: topDataSeriesByExcellent,
      },
      {
        name: '及格率',
        type: 'bar',
        label: {
          show: true,
          position: 'right',
          formatter: (params) => {
            return params.value + "%";
          },
        },
        barGap: "0",
        data: topDataSeriesByPassing,
      }]
    } else {
      colorData = ['#99b7df', '#fad680', '#e4b2d8'];
      legendData = ['最高分', '最低分', '平均分'];
      yData = [
        {
          data: topDataAxis2,  //y轴数据
          inverse: true,
          axisLabel: {
            formatter: function (value) {
              if(value === _this.data.class){
                return '{' + value + '| }{value|' + value + '}';   
              } else {
                return value;
              }           
            },
            rich: {
              value: {
                color: 'red'
              }
            }
          },
        }
      ];
      seriesData = [
        {
          name: '最高分',
          type: 'bar',
          label: {
            show: true
          },
          barGap: "0",
          data: topDataSeriesByScoreMax,
        },
        {
          name: '最低分',
          type: 'bar',
          label: {
            show: true
          },
          barGap: "0",
          data: topDataSeriesByScoreMin,
        },
        {
          name: '平均分',
          type: 'bar',
          label: {
            show: true
          },
          barGap: "0",
          data: topDataSeriesByScoreAvg,
        },
      ]
    }

    gridSetting = {
      left: "20%",
      top: "10%",
      bottom: "10%",
    }

    xData = [
      {
        type: 'value',
      }
    ];

    tooltipSetting = {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    };

    return chart.barChartOption({ topChart, colorData, legendData, xData, yData, gridSetting, seriesData, tooltipSetting });
  },
  /*
    分数段柱状图：
    postion==0：班级分数段统计数据
    postion==1：作文题分数段统计
  */
  getBandScoreBarData(postion) {
    var colorData = ['#516b91'], legendData = [], xData = [], yData = [],
      gridSetting = {}, seriesData = [], tooltipSetting = [];
    const { bottomBarYAxis, bottomBarDataSeries, secondBarYAxis, secondBarDataSeries,
      studentScoreList1, studentScoreList2 } = this.data;
    let title ={};  
    yData = [
      {
        name: '分数区间段',
        data: postion === 0 ? secondBarYAxis : bottomBarYAxis,
      }
    ];

    xData = [{ type: 'value', name: '人数' }]
    gridSetting = { left: "18%", right: "15%" }

    seriesData = [
      {
        name: '优秀率 ',
        type: 'bar',
        barGap: 0,
        label: {
          show: true
        },
        data: postion === 0 ? secondBarDataSeries : bottomBarDataSeries
      }
    ]

    tooltipSetting = {
      trigger: 'axis',
      axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
        triggerOn: 'click'
      },
      position: ['15%', '0%'],
      extraCssText: 'width: 60%;height:100%;',
      formatter: function (params) {
        var data;
        postion === 0 ? data = studentScoreList1 : data = studentScoreList2
        var res = chart.getFormatter(params, 'bar', data);
        return res;
      }
    }

    return chart.barChartOption({ title,colorData, legendData, xData, yData, gridSetting, seriesData, tooltipSetting });
  },
  /*分数段饼状图：
    postion==0：班级分数段统计数据
    postion==1：作文题分数段统计
  */
  getBandScorePieData(postion) {
    var colorData = [], pieData = [], tooltipSetting = {};
    const { secondPieDataSeries, bottomPieDataSeries, studentScoreList1, studentScoreList2 } = this.data;

    let title ={
      text: "（点击饼状查看学生名字及分数）",
      textStyle:{
        color: 'gray',
        fontSize: 14,
        fontWeight: 400,

      }
    }; 
    colorData = ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3', '#fad680', '#9ee6b7', '#37a2da', '#ff9f7f', '#67e0e3', '#9ee6b7', '#a092f1', '#c1232b', '#27727b']
    postion === 0 ? pieData = secondPieDataSeries : pieData = bottomPieDataSeries;
    tooltipSetting = {
      trigger: 'item',
      position: ['15%', '0'],
      // textStyle: { 'width': '80%' },
      formatter: function (params) {
        var data;
        postion === 0 ? data = studentScoreList1 : data = studentScoreList2;
        var res = chart.getFormatter(params, 'pie', data);
        return res;
      }
    }

    return chart.pieChartOption({ title,colorData, pieData, tooltipSetting });
  },
  /*
    获取学生成绩排名数据
  */
  getGradeTrendData() {
    var gridSetting = {}, xData = [], legendData = [], yAxisInverse = true, seriesData = [],tooltipSetting={};

    gridSetting = { left: "15%", right: "5%", top: "5%", bottom: "18%", }
    xData = monthData;
    seriesData = [{ data: rankData, type: 'line' }];
    tooltipSetting = {
      trigger: 'axis',
      position: ['15%', '0']
  }

    return chart.lineChartOption({ gridSetting, xData, legendData, yAxisInverse, seriesData,tooltipSetting });
  },
  //切换 柱状图/饼状图
  swichNav: function (e) {
    var tab = e.currentTarget.dataset.name;
    if (this.data[tab] === e.target.dataset.current) {
      return false;
    } else {
      this.setData({ [tab]: e.target.dataset.current, })
    }
    if (tab == 'currentTab1') {//分数段柱状图
      if (this.data[tab] == 0) {
        chart.initChart(this, 'secondComponent', '#secondBarChart', secondChart, true);
      } else {
        chart.initChart(this, 'secondComponent', '#secondPieChart', secondChart, true);
      }
    } else if (tab == 'currentTab2') {
      if (this.data[tab] == 0) {
        chart.initChart(this, 'bottomComponent', '#bottomBarChart', bottomChart, true);
      } else {
        chart.initChart(this, 'bottomComponent', '#bottomPieChart', bottomChart, true);
      }
    }
  },
  //切换：10分段/20分段/50分段
  swichNav2: function (e) {
    let current = e.currentTarget.dataset.current;
    if (this.data.tegmentedTab === current) {
      return false;
    }
    let currentTab1 = this.data.currentTab1;
    wx.showLoading({ title: '请稍等...',});
    let option = {};
    option.subject = this.data.subject;
    option.subjectId = this.data.subjectId;
    option.schoolId = this.data.schoolId;
    option.class_ = this.data.class_;
    option.excellentRate = this.data.excellentLine;
    option.userType = this.data.userType;
    this.getSingleScoreSegmentStatistics(current, currentTab1, option);
  },
  //导航至统计分析
  navAnalysis: function (e) {
    // const { subject, subjectId, schoolId, class_,userType,} = this.data;
    let type = e.target.dataset.type;
    let str = '?class_=' + this.data.class 
      + '&subject=' + this.data.subject 
      + '&subjectId=' + this.data.subjectId 
      + '&yearMonth=' + this.data.yearMonth
      + '&schoolId=' + this.data.schoolId
      + '&userType=' + this.data.userType;
    if (type === 0) {
      wx.navigateTo({
        url: '/pages/objective/objective' + str
      });
    } else {
      wx.navigateTo({
        url: '/pages/supervisor/supervisor' + str
      });
    }
  },
})