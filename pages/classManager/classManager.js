const app = getApp();
import "./../../utils/fix";
import _ from "lodash";
const util = require('../../utils/util.js');
import { http, chart } from "./../../utils/util";

var managerFirstChart = null , managerSecondChart = null, managerThirdChart = null, managerFourthChart = null, managerFifthChart = null;

Page({
    data: {
        yearMonth: '',
        subjectArray: [{name:'总分', id:0},{name:'语文', id:1},{name:'数学', id:2},{name:'英语', id:3},{name:'生物', id:4},{name:'物理', id:5},{name:'地理', id:6},{name:'政治', id:7},{name:'历史', id:8},{name:'化学', id:10},{name:'体育', id:11}],
        subArray: ['总分','语文','数学','英语','生物','物理','地理','政治','历史','化学','体育'],
        subjectIndex: 0,
        classArray: [],
        sqrt: 0,    //标准差
        difficultyFactor: 0,    //难度
        distinction: 0, //区分度
        description: '',    //试卷分析描述
        description2:'',
        currentSort: 0,
        currentTab1: 0,
        currentTab2: 2, //1,各班，2全年级,3各科
        currentTab3: 0,
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
        rateType: 0,
        listAvg: [],
        listExcellentPass: [],
        //第五张图表
        ecFifth: {
            lazyLoad: true
        },
        fifthDataAxis:[],
        fifthDataSeries: [],
        fifthDataYAxis: [],
        intervalValue: 50
    },
    onLoad: function(){
        wx.showLoading({title: '加载中...'})
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
                        firstDataSeriesByMax.unshift(classListMaxMinAvg[i].maxScore);
                        firstDataSeriesByMin.unshift(classListMaxMinAvg[i].minScore);
                        firstDataSeriesByAvg.unshift(util.returnFloat(classListMaxMinAvg[i].avgScore));
                        firstDataAxis.unshift(classListMaxMinAvg[i].class_);
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
                    this.getExcellentPassRate(classListExcellentPassRate,'passingRate');

                    //历史走势图（优秀率/及格率）
                    this.changeExcellentOrPass(listAvg,listExcellentPass,'passingRate')
                    
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
                        listAvg,
                        listExcellentPass,
                        classListExcellentPassRate
                    })
                    this.initFirstChart();
                    this.initSecondChart();
                    
                    
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
    //切换优秀率/及格率
    changeExcellentOrPass: function(listAvg,listExcellentPass,type){
        let fourthDataSeries= [], fourthDataAxis= [], fourthDataLegend = [];
        for (let i=0;i< listExcellentPass.length; i++){
            let obj = {};
            obj.data = [];
            obj.type ="line";
            obj.name = listAvg[i].class_;
            fourthDataLegend.push(listExcellentPass[i].class_);
            let list = _.get(listExcellentPass, `${i}.list`, []);
            for (let j=0;j< list.length; j++){
                obj.data[j] = util.returnFloat((list[j][type]*100), 2);
                fourthDataAxis.push(list[j].yearMonth);
                fourthDataAxis = _.uniq(fourthDataAxis);
            }
            fourthDataSeries.push(obj);
        }
        this.setData({fourthDataSeries,fourthDataAxis,fourthDataLegend});
        this.initFourthChart();
    },
    // 分数段统计
    getScoreStatistics:function(subject){
        let fifthDataAxis = [], fifthDataSeries = [], fifthDataYAxis = [];
        const { intervalValue ,currentTab2 } = this.data;
        let cmd = '/auth/gradeDirector/scoreStatistics';
        let data = { weChatUserId: app.globalData.userId, subject: subject || this.data.subjectIndex, intervalValue, type: currentTab2};
        http.get({
            cmd,
            data,
            success: res =>{
                if(_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))){
                    //currentTab2: 1,各班，2全年级，3各科
                    if(currentTab2 == 1){//各班
                        let listScore = _.get(res, 'data.data.scoreSegmentStatistics');
                        fifthDataSeries = this.setGradeSectionData(listScore, 'class_');
                        fifthDataYAxis =  _.get(res, 'data.data.classSet');
                        for(let i=0;i<listScore.length;i++){
                            fifthDataAxis.push(listScore[i].score);
                        }
                        this.setData({fifthDataAxis, fifthDataSeries, fifthDataYAxis })
                    }else if(currentTab2 == 2) {//全年级
                        let listScore = _.get(res, 'data.data.scoreSegmentStatistics');
                        for(let i=0;i<listScore.length;i++){
                            fifthDataAxis.push(listScore[i].score);
                            fifthDataSeries.push(listScore[i].list.amount);
                        }
                        this.setData({fifthDataAxis, fifthDataSeries })
                    }else if(currentTab2 == 3){//各科
                        let listScore = _.get(res, 'data.data.list');
                        fifthDataSeries = this.setGradeSectionData(listScore, 'subject');
                        fifthDataYAxis =  ['语文','数学','英语','生物','化学','地理','历史','物理','政治','体育'];
                        for(let i=0;i<listScore.length;i++){
                            fifthDataAxis.push(listScore[i].score);
                        }
                        this.setData({fifthDataAxis, fifthDataSeries, fifthDataYAxis })
                    }
                    this.initFifthChart();
                }
            }
        })    
    },
    //组装分数段统计数据
    setGradeSectionData(listScore, legendData){
        let fourthDataAxis = [], fourthDataLegend = [],fourthDataSeries = [];
        if (listScore && !_.isEmpty(listScore)) {
            for (let i = 0; i < listScore.length; i++) {
                let classList = _.get(listScore, `${i}.list`);
                for (let j = 0; j < classList.length; j++) {
                    if (i === 0) {
                        //班级列表取一次足够，取索引 0 的班级列表
                        fourthDataLegend.push(classList[j][legendData])
                    }
                }
                fourthDataAxis.push(listScore[i].score);
            }
        }

        for (let i = 0; i < fourthDataLegend.length; i++) {
            let obj = {};
            obj.type = "bar";
            obj.label = {
                show: true,
                position: 'right',
                formatter: (params) => {
                    if(params.value == 0){
                        return ""
                    }
                    return params.value;
                }
            };
            obj.name = fourthDataLegend[i];
            let data = [];
            for (let j = 0; j < listScore.length; j++) {
                data[j] = listScore[j].list[i].list.amount;
            }
            obj.data = data;
            fourthDataSeries.push(obj);
        }
        return fourthDataSeries;
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
        var gridSetting = {},xData=[],legendData={},yAxisInverse=false,seriesData=[],tooltipSetting={};

        legendData = {data: secondDataLegend};
        gridSetting = {left: "15%",right: "5%",top: "28%",bottom: "18%",}
        xData = secondDataAxis;
        seriesData = secondDataSeries;
        tooltipSetting = {
            trigger: 'axis',
            position: ['15%', '0']
        }

        return chart.lineChartOption({gridSetting,xData,legendData,yAxisInverse,seriesData,tooltipSetting});   
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
        var gridSetting = {},xData=[],legendData={},yAxisInverse=false,seriesData=[],tooltipSetting={};
        legendData = {data: fourthDataLegend}
        gridSetting = {left: "15%",right: "5%",top: "28%",bottom: "18%",}
        xData = fourthDataAxis;
        seriesData = fourthDataSeries;
        tooltipSetting = {
            trigger: 'axis',
            position: ['15%', '0'],
            formatter: (params) => {
                var arr = '';
                for(var i = 0; i < params.length; i++){
                    arr += params[i].seriesName +'：'+params[i].value+'%' + '\n';
                }
              return arr;
            }
        }

        return chart.lineChartOption({gridSetting,xData,legendData,yAxisInverse,seriesData,tooltipSetting}); 
    },
    //获取 分数段统计 图表数据
    getGradeSectionData(){
        var colorData = [], legendData = [], xData = [], yData = [],
        gridSetting = {}, seriesData = [], tooltipSetting = [];
        const {fifthDataAxis, fifthDataSeries, fifthDataYAxis, currentTab2 } = this.data;

        colorData = ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3', '#fad680', '#9ee6b7', '#37a2da', '#ff9f7f'];
        yData = {data: fifthDataAxis};
        
        xData = [{type: 'value',name:'人数'}];
        tooltipSetting = {trigger: 'axis',axisPointer: {type: 'shadow'}};
        //全年级：2； 各科：3；各班：1；
        if(currentTab2 == 1 || currentTab2 == 3){//各班
            legendData = fifthDataYAxis;
            seriesData = fifthDataSeries;
            gridSetting = {left: "20%",right:'15%',top: "10%",bottom: "10%",}
        }else if(currentTab2 == 2){//全年级
            legendData = [];
            seriesData = [{
                type: 'bar',
                data: fifthDataSeries
            }];
            gridSetting = {left: "20%",right:'15%',top: "0",bottom: "10%",}
        }

        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});
    },
    //切换 分数段
    swichNav(e) {
        var tab = e.currentTarget.dataset.name;
        if (this.data[tab] === e.target.dataset.current) {
            return false;
        } else {
            if(tab == 'currentTab1'){
                let intervalValue = _.get(e, 'target.dataset.current') === 0 ? 50 : 100;
                this.setData({ [tab]: e.target.dataset.current, intervalValue }, () =>{
                    this.getScoreStatistics();
                })
            }else if(tab == 'currentTab2'){
                let classType = _.get(e, 'target.dataset.current');
                this.setData({ [tab]: classType }, () =>{
                    this.getScoreStatistics();
                })
            }else if(tab == 'currentTab3'){
                let num = _.get(e, 'target.dataset.current'),rateType = '';
                num == 0 ? rateType = 'passingRate' : rateType = 'excellentRate'
                this.setData({ [tab]: e.target.dataset.current, rateType }, () =>{
                    this.changeExcellentOrPass(this.data.listAvg, this.data.listExcellentPass,rateType);
                })
            }
        }
    },
    //按优秀率/及格率排序
    SortBy(e){
        var tab = e.currentTarget.dataset.name, sortName = '', num = 0;
        if (this.data[tab] === 0) {
            num = 1;
            sortName = 'excellentRate';
        } else {
            num = 0;
            sortName = 'passingRate';
        }
        this.setData({ [tab]: num }, () =>{
            this.getExcellentPassRate(this.data.classListExcellentPassRate,sortName);
        })
    }
})