const app = getApp();
import "./../../utils/fix";
import _ from "lodash";
const util = require('../../utils/util.js');
import { http, chart } from "./../../utils/util";

var parentTopChart = null, parentSecondChart = null;

Page({
    data: {
        class: '',
        studentName: '',
        yearMonth: '',
        subjectArray: [{name:'总分', id:0},{name:'语文', id:1},{name:'数学', id:2},{name:'英语', id:3},{name:'生物', id:4},{name:'物理', id:5},{name:'地理', id:6},{name:'政治', id:7},{name:'历史', id:8},{name:'化学', id:10},{name:'体育', id:11}],
        subArray: ['总分','语文','数学','英语','生物','物理','地理','政治','历史','化学','体育'],
        subjectIndex: 0,
        classArray: [],
        ecTopChart: {
            lazyLoad: true
        },
        ecSecondChart: {
            lazyLoad: true
        }
    },
    onLoad:function(){
        this.initFirstChart();
        this.initSecondChart();
        // wx.showLoading({title: '加载中...'})
    },
    //选择科目
    pickSubject: function(e) {
        this.setData({ subjectIndex: e.detail.value})
    },
     //初始化 历史年级排名走势 图表
    initFirstChart: function () {
        this.firstComponent = this.selectComponent('#parentTopChart');
        chart.initChart(this, 'parentTopChart', '#parentTopChart', parentTopChart);
    },
    //初始化 主观题得分分布 图表
    initSecondChart: function () {
        this.secondComponent = this.selectComponent('#parentSecondChart');
        chart.initChart(this, 'parentSecondChart', '#parentSecondChart', parentSecondChart);
    },
    //获取 历史年级排名走势 option
    getStudentGradeTrendData(){
        let gridSetting = {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        };
        let legendData = {data: ['语文', '数学', '英语', '地理', '历史']};
        let xData = ['202008','202009','202010'];
        let yAxisInverse = false;
        let seriesData = [
            {
                name: '语文',
                type: 'line',
                data: [86, 78, 90]
            },
            {
                name: '数学',
                type: 'line',
                data: [56,60,80]
            },
            {
                name: '英语',
                type: 'line',
                data: [98,102,110]
            },
            {
                name: '地理',
                type: 'line',
                data: [67,78,90]
            },
            {
                name: '历史',
                type: 'line',
                data: [98,78,56]
            }
        ];
        let tooltipSetting = {trigger: 'axis'};

        return chart.lineChartOption({ gridSetting, legendData, xData, yAxisInverse, seriesData,tooltipSetting });
    },
    //获取 主观题得分分布 option
    getStudentScoreData(){
        let Title = '得分分布图';
        let subTitle = '';
        let colorData = ['#566b8e'];
        let xData = [0,1,2,3,4];
        let gridSetting = {left: "20%", top: "20%", bottom: "10%"};
        let tooltipSetting = {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'       // 默认为直线，可选为：'line' | 'shadow'
            },
            position: ['15%', '0%']
        };
        let seriesData = [56, 23, 11, 89, 45]

        return chart.verticalBarChartOption({ Title, colorData, xData, gridSetting, tooltipSetting, seriesData, subTitle })
    }
})