const app = getApp();
import "./../../utils/fix";
import _ from "lodash";
const util = require('../../utils/util.js');
import { http, chart } from "./../../utils/util";

var managerFirstChart = null , managerSecondChart = null, managerThirdChart = null, managerFourthChart = null, managerFifthChart = null;

Page({
    data: {
        subjectArray: [{name:'总分', id:0},{name:'语文', id:1},{name:'数学', id:2},{name:'英语', id:3},{name:'生物', id:4},{name:'物理', id:5},{name:'地理', id:6},{name:'政治', id:7},{name:'历史', id:8},{name:'化学', id:10},{name:'体育', id:11}],
        subArray: ['总分','语文','数学','英语','生物','物理','地理','地理','政治','历史','化学','体育'],
        subjectIndex: 1,
        classArray: [],
        ecFirst: {lazyLoad: true},
        sqrt: 0,    //标准差
        difficultyFactor: 0,    //难度
        distinction: 0, //区分度
        description: '',    //试卷分析描述
        currentTab1: 0,
        maxScore: 0,
        minScore: 0,
        avgScore: 0,
        //第一张图表
        ecFirst: {
            lazyLoad: true
        },
        firstDataSeriesByMax: [],
        firstDataSeriesByMin: [],
        firstDataSeriesByAvg: [],
        firstDataAxis: [],
        //第二张图表
        ecSecond: {
            lazyLoad: true
        },
        secondDataSeries:[],
        secondDataLegend: [],
        secondDataAxis: [],
        //第三张图表
        ecThird: {
            lazyLoad: true
        },
        thirdDataSeriesByExcellent: [],
        thirdDataSeriesByPassing: [],
        thirdDataAxis: [],
        //第四张图表
        ecFourth: {
            lazyLoad: true
        },
        fourthDataSeries: [],
        fourthDataLegend: [],
        fourthDataAxis: [],
        //第五张图表
        ecFifth: {
            lazyLoad: true
        },
        fifthDataSeries: [],
        fifthDataAxis: [],
        intervalValue: 50
    },
    onLoad: function(){
        this.getGradeAnalysisData();
        this.getScoreStatistics();
        // this.initFirstChart();
        // this.initSecondChart();
        // this.initThirdChart();
        // this.initFourthChart();
        this.initFifthChart();
    },
    onReady: function(){

    },
    pickSubject: function(e) {
        this.setData({
            subjectIndex: e.detail.value
        })
    },
    //获取年级成绩分析数据
    getGradeAnalysisData: function(){
        let cmd = '/auth/gradeDirector/list';
        let data = { weChatUserId: app.globalData.userId, subject: this.data.subjectIndex };
        http.get({
            cmd,
            data,
            success: res =>{
                if(_.get(res,'data.code') === 200 && !_.isEmpty(_.get(res,'data.data'))){
                    let resData = _.get(res,'data.data');
                    let firstDataSeriesByMax = [],firstDataSeriesByMin = [],firstDataSeriesByAvg = [],
                    firstDataAxis = [];
                    let secondDataSeries = [],secondDataAxis = [], secondDataLegend = [];
                    let thirdDataSeriesByExcellent = [], thirdDataSeriesByPassing=[], thirdDataAxis= [];
                    let fourthDataSeries= [], fourthDataAxis= [], fourthDataLegend = [];
                    //数据的清洗和组装
                    let maxScore = _.round(_.get(resData, 'maxScore'));
                    let minScore = _.round(_.get(resData, 'minScore'));
                    let avgScore = _.round(_.get(resData, 'avgScore'));
                    let classListMaxMinAvg = _.get(resData, 'classListMaxMinAvg');
                    let listAvg =  _.get(resData, 'listAvg');
                    let sqrtDouble = _.get(resData, 'sqrtDouble');
                    let difficultyFactor = _.get(resData, 'difficultyFactor');
                    let distinction = _.get(resData, 'distinction');
                    let listExcellentPass = _.get(resData, 'listExcellentPass');
                    let classListExcellentPassRate = _.get(resData, 'classListExcellentPassRate');
                    //平均分对比
                    for(let i=0;i< resData.classListMaxMinAvg.length; i++){
                        firstDataSeriesByMax.push(classListMaxMinAvg[i].maxScore);
                        firstDataSeriesByMin.push(classListMaxMinAvg[i].minScore);
                        firstDataSeriesByAvg.push(classListMaxMinAvg[i].maxScore);
                        firstDataAxis.push(classListMaxMinAvg[i].class_);
                    }
                    //历史走势图
                    for (let i=0;i< listAvg.length; i++){
                        let obj = {};
                        obj.data = [];
                        obj.type ="line";
                        obj.name = listAvg[i].class_;
                        secondDataLegend.push(listAvg[i].class_);
                        let list = _.get(listAvg, `${i}.list`, []);
                        for (let j=0;j< list.length; j++){
                            obj.data[j] = _.round(list[j].avgScore, 2);
                            secondDataAxis.push(list[j].yearMonth);
                            secondDataAxis = _.uniq(secondDataAxis);
                        }
                        secondDataSeries.push(obj);
                    }
                    //优秀率/及格率对比
                    for (let i=0;i< classListExcellentPassRate.length; i++){
                        thirdDataSeriesByExcellent.push(util.returnFloat(classListExcellentPassRate[i].excellentRate *100));
                        thirdDataSeriesByPassing.push(util.returnFloat(classListExcellentPassRate[i].passingRate*100));
                        thirdDataAxis.push(classListExcellentPassRate[i].class_);
                    }
                    //历史走势图（优秀率/及格率）
                    for (let i=0;i< listExcellentPass.length; i++){
                        let obj = {};
                        obj.data = [];
                        obj.type ="line";
                        obj.name = listAvg[i].class_;
                        fourthDataLegend.push(listExcellentPass[i].class_);
                        let list = _.get(listExcellentPass, `${i}.list`, []);
                        for (let j=0;j< list.length; j++){
                            obj.data[j] = _.round(list[j].excellentRate/list[j].passingRate, 2);
                            fourthDataAxis.push(list[j].yearMonth);
                            fourthDataAxis = _.uniq(fourthDataAxis);
                        }
                        fourthDataSeries.push(obj);
                    }
                    //数据赋值
                    this.setData({
                        maxScore,
                        minScore,
                        avgScore,
                        firstDataSeriesByMax,
                        firstDataSeriesByMin,
                        firstDataSeriesByAvg,
                        firstDataAxis,
                        secondDataSeries,
                        secondDataAxis,
                        secondDataLegend,
                        sqrt: sqrtDouble,
                        difficultyFactor,
                        distinction,
                        thirdDataSeriesByExcellent,
                        thirdDataSeriesByPassing,
                        thirdDataAxis,
                        fourthDataSeries,
                        fourthDataAxis,
                        fourthDataLegend,
                    })
                    this.initFirstChart();
                    this.initSecondChart();
                    this.initThirdChart();
                    this.initFourthChart();
                }
            }
        })
    },
    // 分数段统计
    getScoreStatistics:function(){
        let fifthDataSeries = [],fifthDataAxis = [];
        const { intervalValue } = this.data;
        let cmd = '/auth/gradeDirector/scoreStatistics';
        let data = { weChatUserId: app.globalData.userId, subject: this.data.subjectIndex, intervalValue };
        http.get({
            cmd,
            data,
            success: res =>{
                if(_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))){
                    let listScore = _.get(res, 'data.data.listScore');
                    for(let i=0;i<listScore.length;i++){
                        fifthDataAxis.push(listScore[i].class_);
                    }
                }
            }
        })    
    },
    //初始化 平均分对比 图表
    initFirstChart: function () {
        this.firstComponent = this.selectComponent('#managerFirstChart');
        chart.initChart(this, 'firstComponent', '#managerFirstChart', managerFirstChart);
    },
    //初始化 平均分趋势 图表
    initSecondChart: function () {
        this.secondComponent = this.selectComponent('#managerSecondChart');
        chart.initChart(this, 'secondComponent', '#managerSecondChart', managerSecondChart);
    },
    //初始化 优秀率/及格率对比 图表
    initThirdChart: function () {
        this.thirdComponent = this.selectComponent('#managerThirdtChart');
        chart.initChart(this, 'thirdComponent', '#managerThirdChart', managerThirdChart);
    },
    //初始化 优秀率/及格率趋势 图表
    initFourthChart: function () {
        this.fourthComponent = this.selectComponent('#managerFourthChart');
        chart.initChart(this, 'fourthComponent', '#managerFourthChart', managerFourthChart);
    },
    //初始化 分数段统计 图表
    initFifthChart: function () {
        this.fifthComponent = this.selectComponent('#managerFifthChart');
        chart.initChart(this, 'fifthComponent', '#managerFifthChart', managerFifthChart);
    },
    //获取 平均分对比 图表数据
    getAvgCompareData(){
        const {firstDataSeriesByMax, firstDataSeriesByMin,  firstDataSeriesByAvg, firstDataAxis} = this.data;
        var colorData = [], legendData = [], xData = [], yData = [],
        gridSetting = {}, seriesData = [], tooltipSetting = {};
        colorData = ['#99b7df', '#fad680', '#e4b2d8'];
        legendData = ['最高分', '最低分', '平均分'];
        yData = [{
            // data: ['C1801','C1802','C1803','C1804','C1805','C1806','C1807','C1808','C1809','C1810']
            data: firstDataAxis
        }];
        gridSetting = {left: "20%",top: "10%",bottom: "10%",}
        xData = [{type: 'value'}];
        tooltipSetting = {trigger: 'axis',axisPointer: {type: 'shadow'}};
        seriesData = [
            {
                name: '最高分',
                type: 'bar',
                label: {
                show: true
                },
                barGap: "0",
                // data: [117, 110, 121, 116, 116, 107, 111, 117, 130, 130]
                data: firstDataSeriesByMax,
            },
            {
                name: '最低分',
                type: 'bar',
                label: {
                show: true
                },
                barGap: "0",
                // data: [70, 53, 54, 55, 31, 0, 58, 0, 0, 86]
                data: firstDataSeriesByMin,
            },
            {
                name: '平均分',
                type: 'bar',
                label: {
                show: true
                },
                barGap: "0",
                // data: ["96.50", 88.53, 95.04, 89.11, 88.98, 85.58, "87.60", 86.71, 101.79, 104.75]
                data: firstDataSeriesByAvg,
            }
        ]

        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});
    },
    //获取 平均分趋势 图表数据
    getAvgTrendData(){
        const { secondDataSeries, secondDataLegend, secondDataAxis } = this.data;
        var gridSetting = {},xData=[],legendData={},yAxisInverse=false,seriesData=[];
        // legendData = {data: ['C1801','C1802','C1803','C1804','C1805']};
        legendData = {data: secondDataLegend};
        gridSetting = {left: "15%",right: "5%",top: "20%",bottom: "18%",}
        // xData = ['202006','202007','202008','202009','202010'];
        xData = secondDataAxis;
        seriesData = secondDataSeries;
        // seriesData = [
        //     {
        //         name: 'C1801',
        //         type: 'line',
        //         data: [120, 132, 101, 134, 90]
        //     },
        //     {
        //         name: 'C1802',
        //         type: 'line',
        //         data: [220, 182, 191, 234, 290]
        //     },
        //     {
        //         name: 'C1803',
        //         type: 'line',
        //         data: [150, 232, 201, 154, 190]
        //     },
        //     {
        //         name: 'C1804',
        //         type: 'line',
        //         data: [320, 332, 301, 334, 390]
        //     },
        //     {
        //         name: 'C1805',
        //         type: 'line',
        //         data: [820, 932, 901, 934, 1290]
        //     }
        // ];

        return chart.lineChartOption({gridSetting,xData,legendData,yAxisInverse,seriesData});   
    },
    //获取 优秀率/及格率对比 图表数据
    getPassRateData(){
        const { thirdDataSeriesByExcellent,  thirdDataSeriesByPassing,  thirdDataAxis } = this.data;
        var colorData = [], legendData = [], xData = [], yData = [],
        gridSetting = {}, seriesData = [], tooltipSetting = {};
        colorData = ['#edafda', '#93b7e3'];
        legendData = ['优秀率', '及格率'];
        yData = [{
            // data: ['C1801','C1802','C1803','C1804','C1805','C1806','C1807','C1808','C1809','C1810']
            data: thirdDataAxis
        }]
        gridSetting = {left: "20%",top: "10%",bottom: "10%",}
        xData = [{type: 'value'}];
        tooltipSetting = {trigger: 'axis',axisPointer: {type: 'shadow'}};
        seriesData = [
            {
                name: '优秀率',
                type: 'bar',
                label: {
                    show: true,
                    formatter: (params) =>{
                        return params.value + "%";
                    }
                },
                barGap: "0",
                // data: [24,55,36,77,88,41,32,64,85,76],
                data: thirdDataSeriesByExcellent
            },
            {
                name: '及格率',
                type: 'bar',
                label: {
                    show: true,
                    formatter: (params) =>{
                        return params.value + "%";
                    }
                },
                barGap: "0",
                // data: [17,25,42,54,37,75,84,29,30,32]
                data: thirdDataSeriesByPassing
            }
        ]

        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});
    },
    //获取 优秀率/及格率趋势 图表数据
    getPassTrendData(){
        const { fourthDataSeries, fourthDataAxis, fourthDataLegend } = this.data;
        var gridSetting = {},xData=[],legendData={},yAxisInverse=false,seriesData=[];
        console.log(fourthDataSeries,'111111', fourthDataAxis, '2222', fourthDataLegend)
        // legendData = {data: ['C1801','C1802','C1803','C1804','C1805']};
        legendData = {data: fourthDataLegend}
        gridSetting = {left: "15%",right: "5%",top: "20%",bottom: "18%",}
        // xData = ['202006','202007','202008','202009','202010'];
        xData = fourthDataAxis;
        seriesData = fourthDataSeries;
        // seriesData = [
        //     {
        //         name: 'C1801',
        //         type: 'line',
        //         data: [120, 132, 101, 134, 90]
        //     },
        //     {
        //         name: 'C1802',
        //         type: 'line',
        //         data: [220, 182, 191, 234, 290]
        //     },
        //     {
        //         name: 'C1803',
        //         type: 'line',
        //         data: [150, 232, 201, 154, 190]
        //     },
        //     {
        //         name: 'C1804',
        //         type: 'line',
        //         data: [320, 332, 301, 334, 390]
        //     },
        //     {
        //         name: 'C1805',
        //         type: 'line',
        //         data: [820, 932, 901, 934, 1290]
        //     }
        // ];

        return chart.lineChartOption({gridSetting,xData,legendData,yAxisInverse,seriesData}); 
    },
    //获取 分数段统计 图表数据
    getGradeSectionData(){
        var colorData = [], legendData = [], xData = [], yData = [],
        gridSetting = {}, seriesData = [], tooltipSetting = [];
        colorData = ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3', '#fad680', '#9ee6b7', '#37a2da', '#ff9f7f'];
        legendData = ['C1801','C1802','C1803','C1804','C1805','C1806','C1807','C1808','C1809','C1810'];
        yData = [
            {
            data: ['0-50','50-100','100-150']
            }
        ];
        gridSetting = {left: "20%",top: "10%",bottom: "10%",}
        xData = [{type: 'value'}];
        tooltipSetting = {trigger: 'axis',axisPointer: {type: 'shadow'}};
        seriesData = [
            {
                name: 'C1801',
                type: 'bar',
                label: {
                show: true
                },
                barGap: "0",
                data: [6,7,8,9,10,5,6,7,8,9],
            },
            {
                name: 'C1802',
                type: 'bar',
                label: {
                show: true
                },
                barGap: "0",
                data: [0,1,2,3,4,5,3,2,4,5,1],
            },
            {
                name: 'C1803',
                type: 'bar',
                label: {
                show: true
                },
                barGap: "0",
                data: [3,4,5,2,3,7,8,5,6,2],
            }
        ]

        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});
    },
    //切换 分数段
    swichNav(e){
        var that = this, tab = e.currentTarget.dataset.name;
        if (this.data[tab] === e.target.dataset.current) {
          return false;
        } else {
          that.setData({ [tab]: e.target.dataset.current, })
        }
    }
})