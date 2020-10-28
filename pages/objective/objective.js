import "./../../utils/fix";
import _ from "lodash";
const util = require('../../utils/util.js')
import { http, chart } from "./../../utils/util";

var objectiveFirstChart = null, objectiveSecondChart = null, objectiveThirdChart = null, objectiveFourthChart = null;

const app = getApp();

Page({
    data: {
        class: '',//班级
        subject: '',//科目
        yearMonth: '',
        //客观题班级统计数据
        classStatistics: {},
        //客观题年级统计数据(PS 这里服务端年级数据没有用对象包起来)
        objectiveFullMarks: 0,
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
        firstfirstDataSeriesByCorrectRate: [],
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
        listTotalTopic: [],
        listClassTopic: [],
        thirdDataAxis: [],
        thirdDataSeries: [],
        studentScoreList1: [],
        //第四张图
        ecFourthChart: {
            lazyLoad: true,
            // disableTouch: true
        },
        fourthDataAxis: [],
        fourthDataLegend: [],
        fourthDataSeries: [],
        //说明1
        firstDescriptionSqrt: "",
        firstDescriptionDifficulty: "",
        //说明2
        secondDescriptionSqrt: "",
        secondDescriptionDifficulty: "",
        //说明3
        thirdDescriptionSqrt: "",
        thirdDescriptionDifficulty: "",
        //题目tab
        tabList: ["第一题", '第二题', '第三题', '第四题', '第五题', '第六题', '第七题', '第八题', '第九题', '第十题'],
        activeTabIndex: 0,
        activeTabName: "第一题",
        correctAnswer: [], //正确答案

    },
    onReady() {
        // this.initFirstChart();
        // this.initSecondChart();
        // this.initThirdChart();
        // this.initFourthChart();

    },
    onLoad: function (option) {
        wx.showLoading({ title: '加载中...' })
        // this.setData({
        //     'subject': option.subject,
        //     'class': option.class,
        //     'yearMonth': option.yearMonth
        // });
        this.getObjectiveQuestionAnalysis(option)
    },
    onUnload: function(){
        this.firstComponent = null;
        this.secondComponent = null;
        this.thirdComponent = null;
        this.fourthComponent = null;
    },
    //获取客观题界面数据
    getObjectiveQuestionAnalysis: function (option) {
        let cmd = "/auth/objectiveQuestionAnalysis/objectiveQuestionAnalysis";
        let data = { weChatUserId: app.globalData.userId };
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    let responseData = _.get(res, 'data.data'), firstDataAxis = [], firstfirstDataSeriesByCorrectRate = [];
                    let tabList = [];
                    let secondDataSeriesByMax = [], secondDataSeriesByMin = [], secondDataSeriesByAvg = [];
                    let {
                        classStatistics,
                        listGroupClassStatistics,
                        maxScore,
                        minScore,
                        avgScore,
                        scoringRrate,
                        sqrtDouble,
                        difficultyFactor,
                        distinction,
                        listTotalTopic,
                        listClassTopic,
                        topicSet,
                        correctAnswer,
                        objectiveFullMarks
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
                        //班级得正确率
                        firstDataAxis.unshift(listGroupClassStatistics[i].class_);
                        firstfirstDataSeriesByCorrectRate.push(util.returnFloat(listGroupClassStatistics[i].objectiveQuestionsCorrectRate * 100))
                        //班级的 最高分，最低分，平均分（班级总数是一样的，可以一个遍历搞定）
                        secondDataSeriesByMax.push(_.round(listGroupClassStatistics[i].maxScore, 1))
                        secondDataSeriesByMin.push(_.round(listGroupClassStatistics[i].minScore, 1))
                        secondDataSeriesByAvg.push(util.returnFloat(listGroupClassStatistics[i].avgScore))
                    }
                    let firstDescriptionSqrt = _.toNumber(classStatistics.sqrtDouble) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(classStatistics.sqrtDouble) > 5 ? "此次成绩为正常水平。" : "此次成绩趋于集中，没有拉开差距。";
                    let firstDescriptionDifficulty = _.toNumber(classStatistics.difficultyFactor) >= 0.7 ? " 此次试题容易。" : _.toNumber(classStatistics.difficultyFactor) > 0.4 ? "此次试题难度适中。" : "此次试题偏难。";
                    let secondDescriptionSqrt = _.toNumber(sqrtDouble) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(sqrtDouble) > 5 ? "此次成绩为正常水平。" : "此次成绩趋于集中，没有拉开差距。";
                    let secondDescriptionDifficulty = _.toNumber(difficultyFactor) >= 0.7 ? " 此次试题容易。" : _.toNumber(difficultyFactor) > 0.4 ? "此次试题难度适中。" : "此次试题偏难。";
                    for (let i = 0; i < listTotalTopic.length; i++) {
                        tabList.push(listTotalTopic[i].topic)
                    }
                    //----------------  end  ------------------
                    this.setData({
                        subject: option.subject,
                        class: option.class,
                        yearMonth: option.yearMonth,
                        objectiveFullMarks,
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
                        firstfirstDataSeriesByCorrectRate,
                        secondDataSeriesByMax,
                        secondDataSeriesByMin,
                        secondDataSeriesByAvg,
                        tabList: topicSet,
                        listTotalTopic,
                        listClassTopic,
                        activeTabName: topicSet[0],
                        correctAnswer
                    })
                    //画图
                    this.initFirstChart();
                    this.initSecondChart();
                    this.setTopicData(0, topicSet[0], listTotalTopic, listClassTopic);
                }
            }
        })
    },
    //初始化第一个图
    initFirstChart: function () {
        this.firstComponent = this.selectComponent('#objectiveFirstChart');
        chart.initChart(this, 'firstComponent', '#objectiveFirstChart', objectiveFirstChart);
    },
    //初始化第二个图
    initSecondChart: function () {
        this.secondComponent = this.selectComponent('#objectiveSecondChart');
        chart.initChart(this, 'secondComponent', '#objectiveSecondChart', objectiveSecondChart);
    },
    //初始化第三个图
    initThirdChart: function () {
        this.thirdComponent = this.selectComponent('#objectiveThirdChart');
        chart.initChart(this, 'thirdComponent', '#objectiveThirdChart', objectiveThirdChart);
    },
    //初始化第四个图
    initFourthChart: function () {
        this.fourthComponent = this.selectComponent('#objectiveFourthChart');
        chart.initChart(this, 'fourthComponent', '#objectiveFourthChart', objectiveFourthChart);
    },
    /*
        客观题分析
        type==0: 正确率
        type==1: 最高分/最低分/平均分
    */
    getHorizontalOption(type) {
        let _this = this;
        var colorData = [], legendData = [], xData = [], yData = [],
            gridSetting = {}, seriesData = [], tooltipSetting = [];
        const { firstDataAxis, firstfirstDataSeriesByCorrectRate, secondDataSeriesByMax,
            secondDataSeriesByMin, secondDataSeriesByAvg } = this.data;

        if (type === 0) {
            colorData = ['#93b7e3'];
            legendData = ['正确率'];
            seriesData = [
                {
                    name: '正确率',
                    type: 'bar',
                    label: {
                        show: true,
                        formatter: (params) => {
                            return params.value + "%";
                        }
                    },
                    barGap: "0",
                    data: firstfirstDataSeriesByCorrectRate,
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
        客观题答题选项分布分析
    */
    getVerticalOption() {
        let _this = this;
        var Title = '', colorData = [], xData = [], gridSetting = {}, seriesData = [],  tooltipSetting = {};
        let { thirdDataAxis, thirdDataSeries, correctAnswer, activeTabName, studentScoreList1 } = this.data;
        let answer = _.pick(correctAnswer, [activeTabName]);
        let answerName = _.values(answer)[0];
        let title = {
            text: "正确答案 ： " + answerName,
            left: 'center',
            textStyle: {
                fontWeight: 'normal',
                color: 'red',
                fontSize: 14
            },
            subtext: "（点击柱状图查看学生名称）",
            subtextStyle: {
                color: "gray"
            }
        };
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
        let seriesLabel = {
            show: true,
            position: 'top',
            formatter: (params) => {
              return params.value + "%";
            }
        }

        return chart.verticalBarChartOption({ title, Title, colorData, xData, gridSetting, seriesData,seriesLabel, tooltipSetting });
    },

    //tootip弹框
    getFormatter: function (studentScoreList1, score) {
        let item = _.find(studentScoreList1, o => o.answer === score);
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
        const { fourthDataAxis, fourthDataLegend, fourthDataSeries } = this.data;
        let title = {
            text: '（点击图标可选中或取消对比项）',
            top: '0%',
            left: 'center',
            color: 'gray',
            textStyle: {
                color: 'gray',
                fontWeight: 200,
            },
            textAlign: 'auto'
        };
        let legendAttributes = {
            top: '4%'
        };
        let colorData = ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3', '#fad680', '#9ee6b7', '#37a2da', '#ff9f7f', '#67e0e3', '#9ee6b7', '#a092f1', '#c1232b', '#27727b'];
        let tooltipSetting = {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        };
        let legendData = fourthDataLegend;
        let gridSetting = {
            top: '15%',
            left: '10%',
            right: '10%',
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
            data: fourthDataAxis,
        };
        let seriesData = fourthDataSeries;
        return chart.barChartOption({
            title, colorData, xData, yData, legendData, legendAttributes,
            gridSetting, seriesData, tooltipSetting, subTitle
        });
    },

    // 切换tab页试题
    swichNav: function (e) {
        let oldActiveTabIndex = this.data.activeTabIndex; 
        let { listTotalTopic, listClassTopic } = this.data;
        let activeTabIndex = _.get(e, "currentTarget.dataset.current");
        let activeTabName = _.get(e, "currentTarget.dataset.name");
        if(oldActiveTabIndex !== activeTabIndex){ //防止重复点击某个tab
            this.setTopicData(activeTabIndex, activeTabName, listTotalTopic, listClassTopic);
        }    
    },

    // 试题分析
    setTopicData: function (activeTabIndex, activeTabName, listTotalTopic, listClassTopic) {
        let thirdDataAxis = [], thirdDataSeries = [];
        let fourthDataAxis = [], fourthDataLegend = [], fourthDataSeries = [];
        let item = _.find(listTotalTopic, o => o.topic === activeTabName);
        let listTopic = item && item.listTopic;
        if (listTopic && _.isArray(listTopic)) {
            for (let i = 0; i < listTopic.length; i++) {
                thirdDataAxis.push(listTopic[i].answer);
                thirdDataSeries.push(_.round(listTopic[i].ratio * 100, 2));
            }
        }
        let itemClass = _.find(listClassTopic, o => o.topic === activeTabName);
        let itemClassList = itemClass && itemClass.list;

        if (itemClassList && !_.isEmpty(itemClassList)) {
            for (let i = 0; i < itemClassList.length; i++) {
                let classList = _.get(itemClassList, `${i}.list`);
                for (let j = 0; j < classList.length; j++) {
                    if (i === 0) {
                        //班级列表取一次足够，取索引 0 的班级列表
                        fourthDataLegend.unshift(classList[j].class_)
                    }
                }
                fourthDataAxis.push(itemClassList[i].answer);
            }
        }

        for (let i = 0; i < fourthDataLegend.length; i++) {
            let obj = {};
            obj.type = "bar";
            obj.label = {
                show: true,
                position: 'right',
                formatter: (params) => {
                    if (params.value == 0) {
                        return ""
                    }
                    return params.value + "%";
                }
            };
            obj.name = fourthDataLegend[i];
            let data = [];
            for (let j = 0; j < itemClassList.length; j++) {
                data[j] = _.round(itemClassList[j].list[i].ratio * 100, 2);
            }
            obj.data = data;
            fourthDataSeries.push(obj);
        }
        this.setData({
            activeTabIndex, activeTabName, thirdDataAxis, thirdDataSeries, studentScoreList1: listTopic,
            fourthDataAxis, fourthDataLegend, fourthDataSeries
        })
        chart.initChart(this, 'thirdComponent', '#objectiveThirdChart', objectiveThirdChart);
        chart.initChart(this, 'fourthComponent', '#objectiveFourthChart', objectiveFourthChart);
        // wx.hideLoading()
        // this.initFourthChart();
    }
})