const app = getApp();
const util = require('../../utils/util.js')
import { chart } from "./../../utils/util";
import "./../../utils/fix";
import _ from "lodash";

var managerFirstChart = null , managerSecondChart = null, managerThirdChart = null, managerFourthChart = null, managerFifthChart = null;

Page({
    data: {
        subjectArray: [{name:'总分', id:0},{name:'语文', id:1},{name:'数学', id:2},{name:'英语', id:3},{name:'生物', id:4},{name:'物理', id:5},{name:'地理', id:6},{name:'政治', id:7},{name:'历史', id:8},{name:'化学', id:10},{name:'体育', id:11}],
        subArray: ['总分','语文','数学','英语','生物','物理','地理','地理','政治','历史','化学','体育'],
        gradeIndex: 0,
        classArray: [],
        ecFirst: {lazyLoad: true},
        sqrt: 0,    //标准差
        difficultyFactor: 0,    //难度
        distinction: 0, //区分度
        description: '',    //试卷分析描述
        currentTab1: 0,
        ecFirst: {
            lazyLoad: true
        },
        ecSecond: {
            lazyLoad: true
        },
        ecThird: {
            lazyLoad: true
        },
        ecFourth: {
            lazyLoad: true
        },
        ecFifth: {
            lazyLoad: true
        }
    },
    onLoad: function(){
        this.initFirstChart();
        this.initSecondChart();
        this.initThirdChart();
        this.initFourthChart();
        this.initFifthChart();
    },
    onReady: function(){

    },
    pickSubject: function(e) {
        this.setData({
            gradeIndex: e.detail.value
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
            [
                {
                  name: '最高分',
                  type: 'bar',
                  label: {
                    show: true
                  },
                  barGap: "0",
                  data: [6,7,8,9,10,5,6,7,8,9],
                },
                {
                  name: '最低分',
                  type: 'bar',
                  label: {
                    show: true
                  },
                  barGap: "0",
                  data: [0,1,2,3,4,5,3,2,4,5,1],
                },
                {
                  name: '平均分',
                  type: 'bar',
                  label: {
                    show: true
                  },
                  barGap: "0",
                  data: [3,4,5,2,3,7,8,5,6,2],
                },
              ]
        ]

        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});

    },
    //获取 平均分趋势 图表数据
    getAvgTrendData(){
        var gridSetting = {},xData=[],legendData=[],yAxisInverse=false,seriesData=[];

        gridSetting = {left: "15%",right: "5%",top: "5%",bottom: "18%",}
        xData = ['202006','202007','202008','202009','202010'];
        seriesData = [
            {
                name: 'C1801',
                type: 'line',
                data: [120, 132, 101, 134, 90]
            },
            {
                name: 'C1802',
                type: 'line',
                data: [220, 182, 191, 234, 290]
            },
            {
                name: 'C1803',
                type: 'line',
                data: [150, 232, 201, 154, 190]
            },
            {
                name: 'C1804',
                type: 'line',
                data: [320, 332, 301, 334, 390]
            },
            {
                name: 'C1805',
                type: 'line',
                data: [820, 932, 901, 934, 1290]
            }
        ];

        return chart.lineChartOption({gridSetting,xData,legendData,yAxisInverse,seriesData});   
    },
    //获取 优秀率/及格率对比 图表数据
    getPassRateData(){
        var colorData = [], legendData = [], xData = [], yData = [],
        gridSetting = {}, seriesData = [], tooltipSetting = [];
        colorData = ['#edafda', '#93b7e3'];
        legendData = ['优秀率', '及格率'];
        yData = []
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
                data: [4,5,6,7,8,1,2,4,5,6],
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
                data: [7,5,2,4,7,5,8,9,3,2]
            }]

        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});
    },
    //获取 优秀率/及格率趋势 图表数据
    getPassTrendData(){
        var gridSetting = {},xData=[],legendData=[],yAxisInverse=false,seriesData=[];

        gridSetting = {left: "15%",right: "5%",top: "5%",bottom: "18%",}
        xData = ['202006','202007','202008','202009','202010'];
        seriesData = [
            {
                name: 'C1801',
                type: 'line',
                data: [120, 132, 101, 134, 90]
            },
            {
                name: 'C1802',
                type: 'line',
                data: [220, 182, 191, 234, 290]
            },
            {
                name: 'C1803',
                type: 'line',
                data: [150, 232, 201, 154, 190]
            },
            {
                name: 'C1804',
                type: 'line',
                data: [320, 332, 301, 334, 390]
            },
            {
                name: 'C1805',
                type: 'line',
                data: [820, 932, 901, 934, 1290]
            }
        ];

        return chart.lineChartOption({gridSetting,xData,legendData,yAxisInverse,seriesData}); 
    },
    //获取 分数段统计 图表数据
    getGradeSectionData(){
        var colorData = [], legendData = [], xData = [], yData = [],
        gridSetting = {}, seriesData = [], tooltipSetting = [];
        colorData = ['#99b7df', '#fad680', '#e4b2d8'];
        legendData = ['C1801','C1802','C1803','C1804','C1805','C1806','C1807','C1808','C1809','C1810'];
        yData = [
            {
            data: ['C1801','C1802','C1803','C1804','C1805','C1806','C1807','C1808','C1809','C1810']
            }
        ];
        gridSetting = {left: "20%",top: "10%",bottom: "10%",}
        xData = [{type: 'value'}];
        tooltipSetting = {trigger: 'axis',axisPointer: {type: 'shadow'}};
        seriesData = [
            [
                {
                  name: '最高分',
                  type: 'bar',
                  label: {
                    show: true
                  },
                  barGap: "0",
                  data: [6,7,8,9,10,5,6,7,8,9],
                },
                {
                  name: '最低分',
                  type: 'bar',
                  label: {
                    show: true
                  },
                  barGap: "0",
                  data: [0,1,2,3,4,5,3,2,4,5,1],
                },
                {
                  name: '平均分',
                  type: 'bar',
                  label: {
                    show: true
                  },
                  barGap: "0",
                  data: [3,4,5,2,3,7,8,5,6,2],
                },
              ]
        ]

        return chart.barChartOption({colorData,legendData,xData,yData,gridSetting,seriesData,tooltipSetting});
    }
})