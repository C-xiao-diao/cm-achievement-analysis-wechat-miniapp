const app = getApp();
import "./../../utils/fix";
import _ from "./../../utils/lodash";
const util = require('../../utils/util.js');
import { http, chart } from "./../../utils/util";

var managerFirstChart = null, managerSecondChart = null, managerThirdChart = null, managerFourthChart = null, managerFifthChart = null;
var intervalValue = 20;//分数段
var excellentLine = 85;//优秀线
var classType = 2; //总分：2； 各科：3；各班：1
var curSubject = 0;//当前科目
var rateType = 0;//0: passingRate; 1: excellentRate;
var sortType = 0;//0: passingRate; 1: excellentRate;

Page({
    data: {
        grade: '',
        schoolId: '',
        yearMonth: '',
        subjectArray: [{ name: '总分', id: 0 }, { name: '语文', id: 1 }, { name: '数学', id: 2 }, { name: '英语', id: 3 }, { name: '生物', id: 4 }, { name: '物理', id: 5 }, { name: '地理', id: 6 }, { name: '政治', id: 7 }, { name: '历史', id: 8 }, { name: '化学', id: 10 }, { name: '体育', id: 11 }],
        subArray: ['总分', '语文', '数学', '英语', '生物', '物理', '地理', '政治', '历史', '化学', '体育'],
        subjectIndex: 0,
        classArray: [],
        sqrt: 0,    //标准差
        difficultyFactor: 0,    //难度
        distinction: 0, //区分度
        description: '',    //试卷分析描述
        description2: '',
        currentSort: 0,
        currentTab1: 0,
        currentTab2: 2, //1,各班，2全年级,3各科
        currentTab3: 0,
        maxScore: 0,
        minScore: 0,
        avgScore: 0,
        classSet: [],
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
        secondDataSeries: [],
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
        listAvg: [],
        listExcellentPass: [],
        //第五张图表
        ecFifth: {
            lazyLoad: true
        },
        fifthDataAxis: [],
        fifthDataSeries: [],
        fifthDataYAxis: [],
        excellentLine: 85,
        intervalValue: 20
    },
    onLoad: function (option) {
        if (!_.isEmpty(option)) {
            this.setData({ grade: option.grade,schoolId: option.schoolId })
        }
        //获取缓存内的数据，初始化数据
        let exLine = null;
        let value = null;
        try {
            exLine = wx.getStorageSync('excellentLine');
            value = wx.getStorageSync('intervalValue');
        } catch (e) {

        }
        excellentLine = exLine || 85;
        intervalValue = value || 20;
        wx.showLoading({ title: '加载中...' })
        this.getGradeAnalysisData(curSubject, excellentLine, option);
        this.getScoreStatistics(curSubject, intervalValue, classType, option);
    },
    onUnload: function () {
        this.firstComponent = null;
        this.secondComponent = null;
        this.thirdComponent = null;
        this.fourthComponent = null;
        this.fifthComponent = null;
    },
    pickSubject: function (e) {
        const { grade, schoolId } = this.data;
        curSubject = e.detail.value;
        let option = {};
        option.grade = grade;
        option.schoolId = schoolId;
        this.getGradeAnalysisData(curSubject, excellentLine, option);
        this.getScoreStatistics(curSubject, intervalValue, classType, option);
    },
    //获取年级成绩分析数据
    getGradeAnalysisData: function (subject, exLine, option) {
        let cmd = '/auth/gradeDirector/list';
        let data = _.assign({ weChatUserId: app.globalData.userId, subject, excellentRate: exLine },option);
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    let resData = _.get(res, 'data.data');
                    let firstDataSeriesByMax = [], firstDataSeriesByMin = [], firstDataSeriesByAvg = [],
                        firstDataAxis = [];
                    let secondDataSeries = [], secondDataAxis = [], secondDataLegend = [];

                    //数据的清洗和组装
                    let yearMonth = resData.yearMonth.substr(0, 4) + '-' + resData.yearMonth.substr(4, 5);
                    let maxScore = _.round(_.get(resData, 'maxScore'));
                    let minScore = _.round(_.get(resData, 'minScore'));
                    let avgScore = util.returnFloat(_.get(resData, 'avgScore'));
                    let classSet = _.get(resData, 'classSet');
                    let classListMaxMinAvg = _.get(resData, 'classListMaxMinAvg');
                    let listAvg = _.get(resData, 'listAvgRangking');
                    let sqrtDouble = _.get(resData, 'sqrtDouble');
                    let difficultyFactor = _.get(resData, 'difficultyFactor');
                    let distinction = _.get(resData, 'distinction');
                    let description = _.toNumber(sqrtDouble) > 10 ? "此次成绩过于离散，成绩差距过大。" : _.toNumber(sqrtDouble) > 5 ? "此次成绩为正常水平。" : "此次成绩趋于集中，没有拉开差距。";
                    let description2 = _.toNumber(difficultyFactor) >= 0.7 ? " 此次试题容易。" : _.toNumber(sqrtDouble) > 0.4 ? "此次试题难度适中。" : "此次试题偏难。";
                    let listExcellentPass = _.get(resData, 'listExcellentPass');
                    let classListExcellentPassRate = _.get(resData, 'classListExcellentPassRate');
                    //平均分对比
                    for (let i = 0; i < resData.classListMaxMinAvg.length; i++) {
                        firstDataSeriesByMax.unshift(classListMaxMinAvg[i].maxScore);
                        firstDataSeriesByMin.unshift(classListMaxMinAvg[i].minScore);
                        firstDataSeriesByAvg.unshift(util.returnFloat(classListMaxMinAvg[i].avgScore));
                        firstDataAxis.unshift(classListMaxMinAvg[i].class_);
                    }
                    //历史走势图
                    secondDataLegend = classSet;
                    for (let i = 0; i < listAvg.length; i++) {
                        let obj = {};
                        obj.data = [];
                        obj.type = "line";
                        obj.name = listAvg[i].class_;
                        // secondDataLegend.push(listAvg[i].class_);
                        let list = _.get(listAvg, `${i}.list`, []);
                        for (let j = 0; j < list.length; j++) {
                            obj.data[j] = list[j].rangking;
                            secondDataAxis.push(list[j].yearMonth);
                            secondDataAxis = _.uniq(secondDataAxis);
                        }
                        secondDataSeries.push(obj);
                    }
                    //优秀率/及格率对比
                    this.getExcellentPassRate(classListExcellentPassRate);

                    //历史走势图（优秀率/及格率）
                    this.changeExcellentOrPass(listAvg, listExcellentPass, classSet, rateType)

                    //数据赋值
                    this.setData({
                        excellentLine: exLine,
                        subjectIndex: subject,
                        yearMonth,
                        maxScore,
                        minScore,
                        avgScore,
                        classSet,
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
    getExcellentPassRate: function (arr) {
        let sort = '';
        sortType === 0 ? sort = 'passingRate' : sort = 'excellentRate';
        let thirdDataSeriesByExcellent = [], thirdDataSeriesByPassing = [], thirdDataAxis = [];
        arr = _.sortBy(arr, function (o) { return o[sort]; });
        for (let i = 0; i < arr.length; i++) {
            thirdDataSeriesByExcellent.push(util.returnFloat(arr[i].excellentRate * 100));
            thirdDataSeriesByPassing.push(util.returnFloat(arr[i].passingRate * 100));
            thirdDataAxis.push(arr[i].class_);
        }
        this.setData({ thirdDataSeriesByExcellent, thirdDataSeriesByPassing, thirdDataAxis, currentSort: sortType })
        this.initThirdChart();
    },
    //切换优秀率/及格率
    changeExcellentOrPass: function (listAvg, listExcellentPass, classSet, rateType) {
        let type = '';
        rateType == 0 ? type = 'passingRate' : type = 'excellentRate';
        let fourthDataSeries = [], fourthDataAxis = [], fourthDataLegend = [];
        for (let i = 0; i < listExcellentPass.length; i++) {
            let obj = {};
            obj.data = [];
            obj.type = "line";
            obj.name = listAvg[i].class_;
            fourthDataLegend = classSet;
            let list = _.get(listExcellentPass, `${i}.list`, []);
            for (let j = 0; j < list.length; j++) {
                obj.data[j] = util.returnFloat((list[j][type] * 100));
                fourthDataAxis.push(list[j].yearMonth);
                fourthDataAxis = _.uniq(fourthDataAxis);
            }
            fourthDataSeries.push(obj);
        }
        this.setData({ fourthDataSeries, fourthDataAxis, fourthDataLegend, currentTab3: rateType });
        this.initFourthChart();
    },
    //分数段统计
    getScoreStatistics: function (subject, value, type, option) {
        let fifthDataAxis = [], fifthDataSeries = [], fifthDataYAxis = [];
        let intervalValue = value;
        let cmd = '/auth/gradeDirector/scoreStatistics';
        let data = _.assign({ weChatUserId: app.globalData.userId, subject, intervalValue, type}, option);
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    wx.hideLoading()
                    //type: 1,各班，2总分，3各科
                    if (type == 1) {//各班
                        let listScore = _.get(res, 'data.data.scoreSegmentStatistics');
                        fifthDataSeries = this.setGradeSectionData(listScore, 'class_');
                        fifthDataYAxis = _.get(res, 'data.data.classSet');
                        for (let i = 0; i < listScore.length; i++) {
                            fifthDataAxis.push(listScore[i].score);
                        }
                    } else if (type == 2) {//总分
                        let listScore = _.get(res, 'data.data.scoreSegmentStatistics');
                        for (let i = 0; i < listScore.length; i++) {
                            fifthDataAxis.push(listScore[i].score);
                            fifthDataSeries.push(listScore[i].list.amount);
                        }
                    } else if (type == 3) {//各科
                        let listScore = _.get(res, 'data.data.list');
                        fifthDataSeries = this.setGradeSectionData(listScore, 'subject');
                        fifthDataYAxis = ['语文', '数学', '英语', '生物', '化学', '地理', '历史', '物理', '政治', '体育'];
                        for (let i = 0; i < listScore.length; i++) {
                            fifthDataAxis.push(listScore[i].score);
                        }
                    }

                    this.setData({
                        intervalValue,
                        subjectIndex: subject,
                        currentTab2: type,
                        fifthDataAxis,
                        fifthDataSeries,
                        fifthDataYAxis
                    })
                    this.initFifthChart();
                } else if (_.get(res, 'data.code') === 107) {
                    wx.showModal({
                        title: '提示',
                        content: _.get(res, 'data.msg', '暂无数据'),
                        success(res) {
                            if (res.confirm) {
                                wx.navigateBack({ delta: 0, })
                            } else if (res.cancel) {
                                wx.navigateBack({ delta: 0, })
                            }
                        }
                    })
                }
            }
        })
    },
    //组装分数段统计数据
    setGradeSectionData(listScore, legendData) {
        let fourthDataAxis = [], fourthDataLegend = [], fourthDataSeries = [];
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
                    if (params.value == 0) {
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
    //获取用户输入的分数段数值
    getScoreInterval: function (e) {
        var reg = /(^[1-9]\d*$)/;
        var oldVal = wx.getStorageSync('intervalValue');

        intervalValue = e.detail.value;
        if (oldVal == intervalValue) {
            return;
        }
        if (!reg.test(intervalValue)) {
            wx.showToast({ title: '请输入正整数', icon: 'none', duration: 1500 });
            return;
        }
        if (intervalValue < 20) {
            wx.showToast({ title: '不能小于20', icon: 'none', duration: 1500 });
            return;
        }
        //存入本地缓存
        try {
            wx.setStorageSync('intervalValue', intervalValue)
        } catch (e) {

        }
        //end
        let option = {
            grade: this.data.grade,
            schoolId: this.data.schoolId
        }
        this.getScoreStatistics(curSubject, intervalValue, classType, option);
    },
    //获取优秀线
    getExcellentRate: function (e) {
        var regInterger = /(^[1-9]\d*$)/;
        let value = e.detail.value;
        if (!regInterger.test(value)) {
            wx.showToast({ title: '请输入正整数', icon: 'none', duration: 1500 });
            return;
        }
        if (value < 10 || value > 100) {
            wx.showToast({ title: '请输入两位数', icon: 'none', duration: 1500 });
            return;
        }
        //存入本地缓存
        try {
            wx.setStorageSync('excellentLine', value)
        } catch (e) {

        }
        //end
        excellentLine = value;
        let option = {};
        option.grade = this.data.grade;
        option.schoolId = this.data.schoolId;
        this.getGradeAnalysisData(curSubject, excellentLine, option);
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
        chart.initChart(this, 'fifthComponent', '#managerFifthChart', managerFifthChart, true);
    },
    //获取 平均分对比 图表数据
    getAvgCompareData() {
        const { firstDataSeriesByMax, firstDataSeriesByMin, firstDataSeriesByAvg, firstDataAxis } = this.data;
        var colorData = [], legendData = [], xData = [], yData = [],
            gridSetting = {}, seriesData = [], tooltipSetting = {};
        colorData = ['#99b7df', '#fad680', '#e4b2d8'];
        legendData = ['最高分', '最低分', '平均分'];
        yData = [{
            data: firstDataAxis
        }];
        gridSetting = { left: "20%", top: "10%", bottom: "10%", }
        xData = [{ type: 'value' }];
        tooltipSetting = { trigger: 'axis', axisPointer: { type: 'shadow' } };
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

        return chart.barChartOption({ colorData, legendData, xData, yData, gridSetting, seriesData, tooltipSetting });
    },
    //获取 平均分趋势 图表数据
    getAvgTrendData() {
        const { secondDataSeries, secondDataLegend, secondDataAxis } = this.data;
        var gridSetting = {}, xData = [], legendData = {}, yAxisInverse = true, seriesData = [], tooltipSetting = {};

        legendData = { data: secondDataLegend };
        gridSetting = { left: "15%", right: "5%", top: "28%", bottom: "18%", }
        xData = secondDataAxis;
        seriesData = secondDataSeries;
        tooltipSetting = {
            trigger: 'axis',
            position: ['15%', '0'],
            formatter: function (params) {
                params = _.sortBy(params, function (o) { return o.value });
                let str = '';
                for (var i = 0; i < params.length; i++) {
                    str += params[i].seriesName + '：' + params[i].value + '\n';
                }
                return str;
            }
        }

        return chart.lineChartOption({ gridSetting, xData, legendData, yAxisInverse, seriesData, tooltipSetting });
    },
    //获取 优秀率/及格率对比 图表数据
    getPassRateData() {
        const { thirdDataSeriesByExcellent, thirdDataSeriesByPassing, thirdDataAxis } = this.data;
        var colorData = [], legendData = [], xData = [], yData = [],
            gridSetting = {}, seriesData = [], tooltipSetting = {};
        colorData = ['#edafda', '#93b7e3'];
        legendData = ['优秀率', '及格率'];
        yData = [{
            data: thirdDataAxis
        }]
        gridSetting = { left: "20%", right: '16%', top: "10%", bottom: "10%", }
        xData = [{ type: 'value' }];
        tooltipSetting = { trigger: 'axis', axisPointer: { type: 'shadow' } };
        seriesData = [
            {
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
                data: thirdDataSeriesByExcellent
            },
            {
                name: '及格率',
                type: 'bar',
                label: {
                    show: true,
                    position: 'right',
                    formatter: (params) => {
                        return params.value + "%";
                    }
                },
                barGap: "0",
                data: thirdDataSeriesByPassing
            }
        ]

        return chart.barChartOption({ colorData, legendData, xData, yData, gridSetting, seriesData, tooltipSetting });
    },
    //获取 优秀率/及格率趋势 图表数据
    getPassTrendData() {
        const { fourthDataSeries, fourthDataAxis, fourthDataLegend } = this.data;
        var gridSetting = {}, xData = [], legendData = {}, yAxisInverse = false, seriesData = [], tooltipSetting = {};
        legendData = { data: fourthDataLegend }
        gridSetting = { left: "15%", right: "5%", top: "28%", bottom: "18%", }
        xData = fourthDataAxis;
        seriesData = fourthDataSeries;
        tooltipSetting = {
            trigger: 'axis',
            position: ['15%', '0'],
            formatter: function (params) {
                params = _.orderBy(params, [function (o) { return Number(o.value) }], ['desc']);
                let str = '';
                for (var i = 0; i < params.length; i++) {
                    str += params[i].seriesName + '：' + params[i].value + '%' + '\n';
                }
                return str;
            }
        }

        return chart.lineChartOption({ gridSetting, xData, legendData, yAxisInverse, seriesData, tooltipSetting });
    },
    //获取 分数段统计 图表数据
    getGradeSectionData() {
        var colorData = [], legendData = [], xData = [], yData = [],
            gridSetting = {}, seriesData = [], tooltipSetting = [];
        const { fifthDataAxis, fifthDataSeries, fifthDataYAxis, currentTab2 } = this.data;

        colorData = ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3', '#fad680', '#9ee6b7', '#37a2da', '#ff9f7f'];
        yData = { data: fifthDataAxis };

        xData = [{ type: 'value', name: '人数' }];
        //总分：2； 各科：3；各班：1；
        if (currentTab2 == 1 || currentTab2 == 3) {//各班
            legendData = fifthDataYAxis;
            seriesData = fifthDataSeries;
            gridSetting = { left: "20%", right: '15%', top: "10%", bottom: "10%", }
            tooltipSetting = {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                position: function (pos, params, dom, rect, size) {
                    // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                    var topPos = pos[1] > 600 ? 588 : pos[1];
                    var obj = { top: topPos };
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                    return obj;
                },
                formatter: (params) => {
                    if (currentTab2 == 1) {
                        params = _.orderBy(params, [function (o) { return Number(o.value) }], ['desc']);
                    }
                    let str = '';
                    for (var i = 0; i < params.length; i++) {
                        str += params[i].seriesName + ' 考' + params[i].axisValue + '分 共有' + params[i].value + '人' + '\n';
                    }
                    return str;
                }
            };
        } else if (currentTab2 == 2) {//总分
            legendData = [];
            seriesData = {
                type: 'bar',
                data: fifthDataSeries,
                label: {
                    show: true,
                    position: 'right',
                    formatter: (params) => {
                        if (params.value == 0) {
                            return ""
                        }
                        return params.value;
                    }
                }
            };
            tooltipSetting = {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                position: ['35%', '0'],
                formatter: (params) => {
                    let str = params[0].name + '分数段' + '共有' + params[0].value + '人';
                    return str;
                }
            };
            gridSetting = { left: "20%", right: '15%', top: "10%", bottom: "10%", }
        }

        return chart.barChartOption({ colorData, legendData, xData, yData, gridSetting, seriesData, tooltipSetting });
    },
    //切换
    swichNav(e) {
        const { grade,schoolId } = this.data;
        let option = { grade,schoolId }
        var tab = e.currentTarget.dataset.name;
        if (this.data[tab] === e.target.dataset.current) {
            return false;
        } else {
            if (tab == 'currentTab2') {
                wx.showLoading({
                    title: '请稍候',
                })
                classType = _.get(e, 'target.dataset.current');
                this.getScoreStatistics(curSubject, intervalValue, classType, option);
            } else if (tab == 'currentTab3') {
                let rateType = _.get(e, 'target.dataset.current');
                const { listAvg, listExcellentPass, classSet } = this.data;
                this.changeExcellentOrPass(listAvg, listExcellentPass, classSet, rateType);
            }
        }
    },
    //按优秀率/及格率排序
    SortBy(e) {
        var tab = e.currentTarget.dataset.name;
        this.data[tab] === 0 ? sortType = 1 : sortType = 0;
        this.getExcellentPassRate(this.data.classListExcellentPassRate);
    }
})