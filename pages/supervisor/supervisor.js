import * as echarts from './../../components/ec-canvas/echarts'
import "./../../utils/fix";
import _ from "lodash";
import { http } from "./../../utils/util";

var firstChart = null, secondChart = null, thirdChart = null;

const app = getApp();

Page({
    data: {
        //客观题班级统计数据
        classStatistics: {},
        //客观题年级统计数据(PS 这里服务端年级数据没有用对象包起来)
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
        firstDataSeriesByExcellent: [],
        firstDataSeriesByPassing: [],
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
        //说明1
        firstDescriptionSqrt: "",
        firstDescriptionDifficulty: "",
        //说明2
        secondDescriptionSqrt: "",
        secondDescriptionDifficulty: "",
    },
    onReady() {
        this.initFirstChart();
        this.initSecondChart();
        this.initThirdChart();
    },
    onLoad: function () {
        let cmd = "/auth/subjectiveQuestionAnalysis/subjectiveQuestionAnalysis";
        let data = { weChatUserId: app.globalData.userId };
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    let responseData = _.get(res, 'data.data'), firstDataAxis = [], firstDataSeriesByExcellent = [];
                    let firstDataSeriesByPassing = [];
                    let secondDataSeriesByMax = [], secondDataSeriesByMin = [], secondDataSeriesByAvg = [];
                    let {
                        classStatistics,
                        listClassRatio,
                        listGroupClassStatistics,
                        maxScore,
                        minScore,
                        avgScore,
                        scoringRrate,
                        sqrtDouble,
                        difficultyFactor,
                        distinction,
                    } = responseData;
                    //数据组装和清洗
                    for (let key in classStatistics) {
                        if (key === "maxScore" || key === "minScore" || key === "avgScore") {
                            classStatistics[key] = _.round(classStatistics[key]);
                        } else if (key === "scoringRrate") {
                            classStatistics[key] = _.round(classStatistics[key] * 100);
                        }
                    }
                    maxScore = _.round(maxScore);
                    minScore = _.round(minScore);
                    avgScore = _.round(avgScore);
                    scoringRrate = _.round(scoringRrate * 100)
                    for (let i = 0; i < listClassRatio.length; i++) {
                        //班级得游戏率和及格率
                        firstDataAxis.push(listClassRatio[i].class_);
                        firstDataSeriesByExcellent.push(_.round(listClassRatio[i].excellentRate, 1))
                        firstDataSeriesByPassing.push(_.round(listClassRatio[i].passingRate, 1))
                        //班级的 最高分，最低分，平均分（班级总数是一样的，可以一个遍历搞定）
                        secondDataSeriesByMax.push(_.round(listGroupClassStatistics[i].maxScore, 1))
                        secondDataSeriesByMin.push(_.round(listGroupClassStatistics[i].minScore, 1))
                        secondDataSeriesByAvg.push(_.round(listGroupClassStatistics[i].avgScore, 1))
                    }
                    let firstDescriptionSqrt = _.toNumber(classStatistics.sqrtDouble) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(classStatistics.sqrtDouble) > 5 ? "此次成绩为正常水平。" : "此次成绩趋于集中，没有拉开差距。";
                    let firstDescriptionDifficulty = _.toNumber(classStatistics.difficultyFactor) >= 0.7 ? " 此次试题容易。" : _.toNumber(classStatistics.difficultyFactor) > 0.4 ? "此次试题难度适中。" : "此次试题偏难。";
                    let secondDescriptionSqrt = _.toNumber(sqrtDouble) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(sqrtDouble) > 5 ? "此次成绩为正常水平。" : "此次成绩趋于集中，没有拉开差距。";
                    let secondDescriptionDifficulty = _.toNumber(difficultyFactor) >= 0.7 ? " 此次试题容易。" : _.toNumber(difficultyFactor) > 0.4 ? "此次试题难度适中。" : "此次试题偏难。";
                    //----------------  end  ------------------
                    this.setData({
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
                        firstDataSeriesByExcellent,
                        firstDataSeriesByPassing,
                        secondDataSeriesByMax,
                        secondDataSeriesByMin,
                        secondDataSeriesByAvg,
                    })
                    //画图
                    this.initFirstChart();
                    this.initSecondChart();
                }
            }
        })
    },
    //初始化第一个图
    initFirstChart: function () {
        this.firstComponent = this.selectComponent('#firstChart');
        this.initChart('firstComponent', '#firstChart', firstChart);
    },
    //初始化第二个图
    initSecondChart: function () {
        this.secondComponent = this.selectComponent('#secondChart');
        this.initChart('secondComponent', '#secondChart', secondChart);
    },
    //初始化第三个图
    initThirdChart: function () {
        this.thirdComponent = this.selectComponent('#thirdChart');
        this.initChart('thirdComponent', '#thirdChart', thirdChart);
    },
    //图表初始化方法
    initChart(chartComponent, dom, whichChart) {
        if (!this[chartComponent]) {
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
    //图表设置
    setOption: function (whichChart, dom) {
        var option;
        switch (dom) {
            case '#firstChart':
                option = this.getHorizontalOption(0);
                break;
            case '#secondChart':
                option = this.getHorizontalOption(1);
                break;
            case '#thirdChart':
                option = this.getVerticalOption();
                break;
        }
        whichChart.setOption(option);
        return whichChart;
    },
    getHorizontalOption(type) {
        const { firstDataAxis, firstDataSeriesByExcellent, firstDataSeriesByPassing, secondDataSeriesByMax,
            secondDataSeriesByMin, secondDataSeriesByAvg } = this.data;

        var option = {
            color: type === 0 ? ['#edafda', '#93b7e3'] : ['#99b7df', '#fad680', '#e4b2d8'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: type === 0 ? ['优秀率', '及格率'] : ['最高分', '最低分', '平均分']
            },
            grid: {
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
                    // data: ['C1801', 'C1802', 'C1803', 'C1804', 'C1805', 'C1806', 'C1807', 'C1808', 'C1809', 'C1810'],
                    data: firstDataAxis,
                    inverse: true
                }
            ],
        };
        let series = [];
        if (type === 0) {  //优秀率及格率柱图
            series = [
                {
                    name: '优秀率',
                    type: 'bar',
                    label: {
                        show: true
                    },
                    barGap: "0",
                    data: firstDataSeriesByExcellent,
                },
                {
                    name: '及格率',
                    type: 'bar',
                    label: {
                        show: true
                    },
                    barGap: "0",
                    data: firstDataSeriesByPassing,
                },
            ]
        } else { //分值柱图
            series = [
                {
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
                },
            ]
        }
        option.series = series;
        return option;
    },
    getVerticalOption() {
        var option = {
            title: {
                text: '选项答题分布',
                left: 'center',
                textStyle: {
                    fontWeight: 'normal'
                }
            },
            color: ['#566b8e'],
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            grid: {
                left: "20%",
                top: "20%",
                bottom: "10%",
            },
            series: [{
                data: [120, 200, 150, 80, 70, 110, 130],
                type: 'bar',
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(220, 220, 220, 0.8)'
                }
            }]
        };
        return option;
    }
})