import "./../../utils/fix";
import _ from "lodash";
import { http, chart } from "./../../utils/util";
const util = require('../../utils/util.js')

var supervisorFirstChart = null, supervisorSecondChart = null, supervisorThirdChart = null, supervisorFourthChart = null;

const app = getApp();

Page({
    data: {
        //客观题班级统计数据
        classStatistics: {},
        //客观题年级统计数据(PS 这里服务端年级数据没有用对象包起来)
        subjectiveFullMarks: 0,
        maxScore: 0,
        minScore: 0,
        avgScore: 0,
        sqrtDouble: 0,
        difficultyFactor: 0,
        distinction: 0,

        //第一张图
        ecFirstChart: {
            lazyLoad: true
        },
        // firstDataSeriesByExcellent: [],
        // firstDataSeriesByPassing: [],
        firstfirstDataSeriesByScoringRrate: [],
        firstDataAxis: [],
        //第二张图
        ecSecondChart: {
            lazyLoad: true
        },
        secondDataSeriesByMax: [],
        secondDataSeriesByMin: [],
        secondDataSeriesByAvg: [],
        secondDataAxis: [],
        //第三张图
        ecThirdChart: {
            lazyLoad: true
        },
        thirdDataAxis: [],
        thirdDataSeries: [],
        studentScoreList1: [],
        studentScoreList1: [],
        //第四张图
        ecFourthChart: {
            lazyLoad: true
        },
        fourthDataAxis: [],
        fourthDataSeries: [],
        //说明1
        firstDescriptionSqrt: "",
        firstDescriptionDifficulty: "",
        //说明2
        secondDescriptionSqrt: "",
        secondDescriptionDifficulty: "",
        tabList: ["第一题", '第二题', '第三题', '第四题', '第五题', '第六题', '第七题', '第八题', '第九题', '第十题'],
        activeTabIndex: 0,
        activeTabName: "第一题",
    },
    onReady() {
        // this.initFirstChart();
        // this.initSecondChart();
        // this.initThirdChart();
        this.initFourthChart();
    },
    onLoad: function (option) {
        this.setData({
            'subject': option.subject,
            'class': option.class,
        });
        wx.showLoading({
            title: '加载中...',
        })
        this.getSupervisorQuestionAnalysis();
    },
    //获取页面数据
    getSupervisorQuestionAnalysis() {
        let cmd = "/auth/subjectiveQuestionAnalysis/subjectiveQuestionAnalysis";
        let data = { weChatUserId: app.globalData.userId };
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    let responseData = _.get(res, 'data.data'), firstDataAxis = [], firstfirstDataSeriesByScoringRrate = [];
                    let secondDataSeriesByMax = [], secondDataSeriesByMin = [], secondDataSeriesByAvg = [];
                    let {
                        subjectiveFullMarks,
                        classStatistics,
                        listGroupClassStatistics,
                        maxScore,
                        minScore,
                        avgScore,
                        scoringRrate,
                        sqrtDouble,
                        difficultyFactor,
                        distinction,
                        topicSet,
                        listTotalScore,
                        listClassTotalScore
                    } = responseData;
                    //数据组装和清洗
                    for (let key in classStatistics) {
                        if (key === "maxScore" || key === "minScore") {
                            classStatistics[key] = _.round(classStatistics[key]);
                        } else if (key === "avgScore") {
                            classStatistics[key] = util.returnFloat(classStatistics[key]);
                        } else if (key === "scoringRrate") {
                            classStatistics[key] = util.returnFloat(classStatistics[key] * 100);
                        }
                    }
                    maxScore = _.round(maxScore);
                    minScore = _.round(minScore);
                    avgScore = util.returnFloat(avgScore);
                    scoringRrate = util.returnFloat(scoringRrate * 100)
                    for (let i = 0; i < listGroupClassStatistics.length; i++) {
                        //班级得游戏率和及格率
                        firstDataAxis.unshift(listGroupClassStatistics[i].class_);
                        firstfirstDataSeriesByScoringRrate.push(_.round(listGroupClassStatistics[i].scoringRrate, 1))
                        //班级的 最高分，最低分，平均分（班级总数是一样的，可以一个遍历搞定）
                        secondDataSeriesByMax.push(_.round(listGroupClassStatistics[i].maxScore, 1))
                        secondDataSeriesByMin.push(_.round(listGroupClassStatistics[i].minScore, 1))
                        secondDataSeriesByAvg.push(util.returnFloat(listGroupClassStatistics[i].avgScore))
                    }
                    let firstDescriptionSqrt = _.toNumber(classStatistics.sqrtDouble) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(classStatistics.sqrtDouble) > 5 ? "此次成绩为正常水平。" : "此次成绩趋于集中，没有拉开差距。";
                    let firstDescriptionDifficulty = _.toNumber(classStatistics.difficultyFactor) >= 0.7 ? " 此次试题容易。" : _.toNumber(classStatistics.difficultyFactor) > 0.4 ? "此次试题难度适中。" : "此次试题偏难。";
                    let secondDescriptionSqrt = _.toNumber(sqrtDouble) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(sqrtDouble) > 5 ? "此次成绩为正常水平。" : "此次成绩趋于集中，没有拉开差距。";
                    let secondDescriptionDifficulty = _.toNumber(difficultyFactor) >= 0.7 ? " 此次试题容易。" : _.toNumber(difficultyFactor) > 0.4 ? "此次试题难度适中。" : "此次试题偏难。";
                    //----------------  end  ------------------
                    this.setData({
                        subjectiveFullMarks,
                        classStatistics,
                        firstDescriptionSqrt,
                        firstDescriptionDifficulty,
                        secondDescriptionSqrt,
                        secondDescriptionDifficulty,
                        listGroupClassStatistics,
                        maxScore,
                        minScore,
                        avgScore,
                        scoringRrate,
                        sqrtDouble,
                        difficultyFactor,
                        distinction,
                        firstDataAxis,
                        firstfirstDataSeriesByScoringRrate,
                        secondDataSeriesByMax,
                        secondDataSeriesByMin,
                        secondDataSeriesByAvg,
                        tabList: topicSet,
                        listTotalTopic: listTotalScore,
                        listClassTotalScore
                    })
                    //画图
                    this.initFirstChart();
                    this.initSecondChart();
                    this.setTopicData(0, topicSet[0], listTotalScore);
                }
            }
        })
    },
    //初始化第一个图
    initFirstChart: function () {
        this.firstComponent = this.selectComponent('#supervisorFirstChart');
        chart.initChart(this, 'firstComponent', '#supervisorFirstChart', supervisorFirstChart);
    },
    //初始化第二个图
    initSecondChart: function () {
        this.secondComponent = this.selectComponent('#supervisorSecondChart');
        chart.initChart(this, 'secondComponent', '#supervisorSecondChart', supervisorSecondChart);
    },
    //初始化第三个图
    initThirdChart: function () {
        this.thirdComponent = this.selectComponent('#supervisorThirdChart');
        chart.initChart(this, 'thirdComponent', '#supervisorThirdChart', supervisorThirdChart);
    },
    //初始化第四个图
    initFourthChart: function () {
        this.fourthComponent = this.selectComponent('#supervisorFourthChart');
        chart.initChart(this, 'fourthComponent', '#supervisorFourthChart', supervisorFourthChart);
    },
    /*
        主观题分析
        type==0: 得分率
        type==1: 最高分/最低分/平均分
    */
    getHorizontalOption(type) {
        let _this = this;
        var colorData = [], legendData = [], xData = [], yData = [],
            gridSetting = {}, seriesData = [], tooltipSetting = [];
        const { firstDataAxis, firstfirstDataSeriesByScoringRrate, secondDataSeriesByMax,
            secondDataSeriesByMin, secondDataSeriesByAvg } = this.data;

        if (type === 0) {
            colorData = ['#93b7e3'];
            legendData = ['得分率'];
            seriesData = [
                {
                    name: '得分率',
                    type: 'bar',
                    label: {
                        show: true
                    },
                    barGap: "0",
                    data: firstfirstDataSeriesByScoringRrate,
                }
            ]
        } else {
            colorData = ['#99b7df', '#fad680', '#e4b2d8'];
            legendData = ['最高分', '最低分', '平均分'];
            seriesData = [{
                name: '最高分',
                type: 'bar',
                label: {
                    show: true
                },
                barGap: "0",
                data: secondDataSeriesByMax,
            },
            {
                name: '最低分',
                type: 'bar',
                label: {
                    show: true
                },
                barGap: "0",
                data: secondDataSeriesByMin,
            },
            {
                name: '平均分',
                type: 'bar',
                label: {
                    show: true
                },
                barGap: "0",
                data: secondDataSeriesByAvg,
            }]
        }
        xData = [{ type: 'value' }];
        yData = [{
            data: firstDataAxis, inverse: true,
            axisLabel: {
                formatter: function (value) {
                    if (value === _this.data.class) {
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
        }];
        gridSetting = { left: "20%", top: "10%", bottom: "10%" };
        tooltipSetting = { trigger: 'axis', axisPointer: { type: 'shadow' } };
        return chart.barChartOption({ colorData, legendData, xData, yData, gridSetting, seriesData, tooltipSetting });
    },
    /*
        主观题答题分布分析
    */
    getVerticalOption() {
        let _this = this;
        var Title = '', colorData = [], xData = [], gridSetting = {}, seriesData = [], subTitle = '', tooltipSetting = {};
        let { thirdDataAxis, thirdDataSeries, studentScoreList1 } = this.data;

        Title = '答题得分分布';
        colorData = ['#566b8e'];
        xData = thirdDataAxis;
        gridSetting = { left: "20%", top: "20%", bottom: "10%" }
        seriesData = thirdDataSeries;
        tooltipSetting = {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                triggerOn: 'click'
            },
            position: ['15%', '0%'],
            extraCssText: 'width: 60%;height:100%;',
            formatter: function (params) {
                return _this.getFormatter(studentScoreList1, params[0].axisValue);
            }
        }

        return chart.verticalBarChartOption({ Title, colorData, xData, gridSetting, seriesData, tooltipSetting, subTitle });
    },

    getFormatter: function (studentScoreList1, score) {
        let item = _.find(studentScoreList1, o => o.score === score);
        let studentNameList = _.get(item, 'studentNameList', []);
        let str = "";
        for (let i = 0; i < studentNameList.length; i++) {

            if (i % 2 === 0) {
                if (studentNameList[i + 1]) {
                    str += studentNameList[i].studentName + '   ' + studentNameList[i + 1].studentName + '\n';
                } else {
                    str += studentNameList[i].studentName + '   ' + '\n';
                }
            }
        }
        return str;
    },
    
    //第四张图option
    getTopicHorizontalOption: function () {
        let Title = '世界人口总量';
        let colorData = ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3', '#fad680', '#9ee6b7', '#37a2da', '#ff9f7f', '#67e0e3', '#9ee6b7', '#a092f1', '#c1232b', '#27727b'];
        let tooltipSetting = {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        };
        let legendData = ['2011年', '2012年'];
        let gridSetting = {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        };
        let subTitle = '数据来自网络';
        let xData = {
            type: 'value',
            boundaryGap: [0, 0.01]
        };
        let yData = {
            type: 'category',
            data: ['巴西', '印尼', '美国', '印度', '中国', '世界人口(万)'],
        };
        let seriesData = [
            {
                name: '2011年',
                type: 'bar',
                data: [18203, 23489, 29034, 104970, 131744, 630230]
            },
            {
                name: '2012年',
                type: 'bar',
                data: [19325, 23438, 31000, 121594, 134141, 681807]
            }
        ];
        return chart.barChartOption({
            Title, colorData, xData, yData, legendData,
            gridSetting, seriesData, tooltipSetting, subTitle
        });
    },
    // 切换tab页试题
    swichNav: function (e) {
        let { listTotalTopic, listClassTotalScore } = this.data;
        let activeTabIndex = _.get(e, "currentTarget.dataset.current");
        let activeTabName = _.get(e, "currentTarget.dataset.name");
        this.setTopicData(activeTabIndex, activeTabName, listTotalTopic, listClassTotalScore);
    },
    // 试题分析
    setTopicData: function (activeTabIndex, activeTabName, listTotalTopic, listClassTotalScore) {
        let thirdDataAxis = [], thirdDataSeries = [], studentScoreList1 = [];
        let item = _.find(listTotalTopic, o => o.topic === activeTabName);
        let listTopic = item && item.listScore;
        let listTopicIndex = _.findIndex(listTotalTopic, o => o.topic === activeTabName);
        if (listTopic && _.isArray(listTopic)) {
            for (let i = 0; i < listTopic.length; i++) {
                thirdDataAxis.push(listTopic[i].score);
                thirdDataSeries.push(_.round(listTopic[i].ratio * 100, 2));
            }
        }
        this.setData({ activeTabIndex, activeTabName, thirdDataAxis, thirdDataSeries, studentScoreList1: listTopic })
        chart.initChart(this, 'thirdComponent', '#supervisorThirdChart', supervisorThirdChart);
    }
})