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
        subjectIndex: 0,
        classArray: [],
        sqrt: 0,    //标准差
        difficultyFactor: 0,    //难度
        distinction: 0, //区分度
        description: '',    //试卷分析描述
        description2:'',
        currentSort: 0,
        currentTab1: 0,
        maxScore: 0,
        minScore: 0,
        avgScore: 0,
        classListExcellentPassRate: [],
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
    },
    onReady: function(){

    },
    changeSubject: function(subject){
        this.getGradeAnalysisData(subject);
        this.getScoreStatistics(subject);
    },
    pickSubject: function(e) {
        this.setData({ subjectIndex: e.detail.value}, () =>{
            this.changeSubject(e.detail.value)
        })
    },
    //获取年级成绩分析数据
    getGradeAnalysisData: function(subject){
        let cmd = '/auth/gradeDirector/list';
        let data = { weChatUserId: app.globalData.userId, subject: subject || this.data.subjectIndex };
        http.get({
            cmd,
            data,
            success: res =>{
                if(_.get(res,'data.code') === 200 && !_.isEmpty(_.get(res,'data.data'))){
                    let resData = _.get(res,'data.data');
                    let firstDataSeriesByMax = [],firstDataSeriesByMin = [],firstDataSeriesByAvg = [],
                    firstDataAxis = [];
                    let secondDataSeries = [],secondDataAxis = [], secondDataLegend = [];
                    let fourthDataSeries= [], fourthDataAxis= [], fourthDataLegend = [];
                    //数据的清洗和组装
                    let maxScore = _.round(_.get(resData, 'maxScore'));
                    let minScore = _.round(_.get(resData, 'minScore'));
                    let avgScore = util.returnFloat(_.get(resData, 'avgScore'));
                    let classListMaxMinAvg = _.get(resData, 'classListMaxMinAvg');
                    let listAvg =  _.get(resData, 'listAvg');
                    let sqrtDouble = _.get(resData, 'sqrtDouble');
                    let difficultyFactor = _.get(resData, 'difficultyFactor');
                    let distinction = _.get(resData, 'distinction');
                    let description = _.toNumber(sqrtDouble) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(sqrtDouble) > 5 ? "此次成绩为正常水平。" : "此次成绩趋于集中，没有拉开差距。";
                    let description2 = _.toNumber(difficultyFactor) >= 0.7 ? " 此次试题容易。" : _.toNumber(sqrtDouble) > 0.4 ? "此次试题难度适中。" : "此次试题偏难。";
                    let listExcellentPass = _.get(resData, 'listExcellentPass');
                    let classListExcellentPassRate = _.get(resData, 'classListExcellentPassRate');
                    //平均分对比
                    for(let i=0;i< resData.classListMaxMinAvg.length; i++){
                        firstDataSeriesByMax.push(classListMaxMinAvg[i].maxScore);
                        firstDataSeriesByMin.push(classListMaxMinAvg[i].minScore);
                        firstDataSeriesByAvg.push(util.returnFloat(classListMaxMinAvg[i].avgScore));
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
                            obj.data[j] = util.returnFloat(list[j].avgScore);
                            secondDataAxis.push(list[j].yearMonth);
                            secondDataAxis = _.uniq(secondDataAxis);
                        }
                        secondDataSeries.push(obj);
                    }
                    //优秀率/及格率对比
                    this.getExcellentPassRate(classListExcellentPassRate,'excellentRate');

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
                        description,
                        description2,
                        fourthDataSeries,
                        fourthDataAxis,
                        fourthDataLegend,
                        classListExcellentPassRate
                    })
                    this.initFirstChart();
                    this.initSecondChart();
                    
                    this.initFourthChart();
                }
            }
        })
    },
    //优秀率/及格率对比
    getExcellentPassRate: function(arr,sort){
        let thirdDataSeriesByExcellent = [], thirdDataSeriesByPassing=[], thirdDataAxis= [];
        arr = _.sortBy(arr, function(o) { return o[sort]; });
        for (let i=0;i< arr.length; i++){
            thirdDataSeriesByExcellent.push(util.returnFloat(arr[i].excellentRate *100));
            thirdDataSeriesByPassing.push(util.returnFloat(arr[i].passingRate*100));
            thirdDataAxis.push(arr[i].class_);
        }
        this.setData({thirdDataSeriesByExcellent,thirdDataSeriesByPassing,thirdDataAxis})
        this.initThirdChart();
    },
    // 分数段统计
    getScoreStatistics:function(subject){
        let fifthDataSeries = [],fifthDataAxis = [];
        const { intervalValue } = this.data;
        let cmd = '/auth/gradeDirector/scoreStatistics';
        let data = { weChatUserId: app.globalData.userId, subject: subject || this.data.subjectIndex, intervalValue, type: 2};
        http.get({
            cmd,
            data,
            success: res =>{
                if(_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))){
                    let listScore = _.get(res, 'data.data.scoreSegmentStatistics');
                    for(let i=0;i<listScore.length;i++){
                        fifthDataAxis.push(listScore[i].score);
                        fifthDataSeries.push(listScore[i].list)
                    }
                    this.setData({fifthDataAxis,fifthDataSeries})
                    this.getGradeSectionData();
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
                data: firstDataSeriesByMax,
            },
            {
                name: '最低分',
                type: 'bar',
                label: {
                show: true
                },
                barGap: "0",
                data: firstDataSeriesByMin,
            },
            {
                name: '平均分',
                type: 'bar',
                label: {
                show: true
                },
                barGap: "0",
                data: firstDataSeriesByAvg,
            }
        ]

        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});
    },
    //获取 平均分趋势 图表数据
    getAvgTrendData(){
        const { secondDataSeries, secondDataLegend, secondDataAxis } = this.data;
        var gridSetting = {},xData=[],legendData={},yAxisInverse=false,seriesData=[];
        legendData = {data: secondDataLegend};
        gridSetting = {left: "15%",right: "5%",top: "20%",bottom: "18%",}
        xData = secondDataAxis;
        seriesData = secondDataSeries;

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
                data: thirdDataSeriesByPassing
            }
        ]

        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});
    },
    //获取 优秀率/及格率趋势 图表数据
    getPassTrendData(){
        const { fourthDataSeries, fourthDataAxis, fourthDataLegend } = this.data;
        var gridSetting = {},xData=[],legendData={},yAxisInverse=false,seriesData=[];
        legendData = {data: fourthDataLegend}
        gridSetting = {left: "15%",right: "5%",top: "20%",bottom: "18%",}
        xData = fourthDataAxis;
        seriesData = fourthDataSeries;

        return chart.lineChartOption({gridSetting,xData,legendData,yAxisInverse,seriesData}); 
    },
    //获取 分数段统计 图表数据
    getGradeSectionData(){
        const { fifthDataSeries, fifthDataAxis } = this.data;
        var colorData = [], legendData = [], xData = [], yData = [],
        gridSetting = {}, seriesData = [], tooltipSetting = [], arr=[];
        colorData = ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3', '#fad680', '#9ee6b7', '#37a2da', '#ff9f7f'];
        yData = {data: fifthDataAxis};
        gridSetting = {left: "20%",top: "10%",bottom: "10%",}
        xData = [{type: 'value'}];
        tooltipSetting = {trigger: 'axis',axisPointer: {type: 'shadow'}};
        console.log(fifthDataSeries,22222222)
        //i: 分数段（y轴 yData.data）； j:班级（示例 legendData）
        for(var i = 0; i < fifthDataSeries.length; i++){//遍历分数段
            seriesData.push({
                name: '',
                type: 'bar',
                label: {
                show: true
                },
                barGap: "0",
                data: []
            })
            for(let j=0;j<fifthDataSeries[i].length;j++){//遍历班级
                // console.log(i,fifthDataSeries[i][j].class_,fifthDataSeries[i][j].list.amount, 8888888)
                // seriesData[i].name = fifthDataSeries[i][j].class_;
                // 
                // seriesData[i].data.push(fifthDataSeries[i][j].list.amount);
                arr.push(fifthDataSeries[i][j].class_);
            }
            legendData = _.union(arr);
            
        }

        for(var i = 0; i < fifthDataSeries.length; i++){
            let item = fifthDataSeries[i];
            item.list = new Array(legendData.length);
            for(let j=0;j<legendData.length;j++){
                if(item.class_ != legendData[j]){
                    item.list[j+1] = item.list[j];
                    item.list[j] = {amount: 0}
                }
            }
            fifthDataSeries[i] = item;
        }
        console.log(fifthDataSeries, 'vvvvvvvvvvvvvvvvvv555555555555555');

        // for(var i = 0; i < fifthDataSeries.length; i++){//遍历分数段
        //     for(let j=0;j<fifthDataSeries[i].length;j++){//遍历班级
        //         // console.log(fifthDataSeries[i][j].class_, legendData[k],'lllllllll')
        //         if(fifthDataSeries[i][j].class_ != legendData[j]){
        //             console.log(i,j,fifthDataSeries[i][j].class_)
        //             fifthDataSeries[i][j].list.amount = 0;
        //         }
        //         // seriesData[i].data.push(fifthDataSeries[i][j].list.amount)
        //     }
        // }
        

        legendData = _.union(arr);
        console.log(seriesData,999999)
        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});
    },
    //切换 分数段
    swichNav(e) {
        var tab = e.currentTarget.dataset.name;
        if (this.data[tab] === e.target.dataset.current) {
            return false;
        } else {
            let intervalValue = _.get(e, 'target.dataset.current') === 0 ? 50 : 100;
            console.log(intervalValue,'intervalValueintervalValueintervalValueintervalValue')
            this.setData({ [tab]: e.target.dataset.current, intervalValue }, () =>{
                this.getScoreStatistics();
            })
        }
    },
    SortBy(e){
        var tab = e.currentTarget.dataset.name, sortName = '', num = 0;
        if (this.data[tab] === 0) {
            num = 1;
            sortName = 'passingRate';
        } else {
            num = 0;
            sortName = 'excellentRate';
        }
        this.setData({ [tab]: num }, () =>{
            this.getExcellentPassRate(this.data.classListExcellentPassRate,sortName);
        })
    }
})