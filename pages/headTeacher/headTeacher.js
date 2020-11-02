const app = getApp();
const util = require('../../utils/util.js')
import { chart, http } from "./../../utils/util";
import "./../../utils/fix";
import _ from "./../../utils/lodash";

var HTeacherFirstChart = null, HTeacherSecondChart = null;

Page({
    data: {
        yearMonth: '',
        class_: '',
        schoolId: 0, 
        overallSituation: [],
        allStudentGrade: [],
        subjectArray: [{ name: '总分', id: 9 }, { name: '语文', id: 1 }, { name: '数学', id: 2 }, { name: '英语', id: 3 }, { name: '生物', id: 4 }, { name: '物理', id: 5 }, { name: '地理', id: 6 }, { name: '政治', id: 7 }, { name: '历史', id: 8 }, { name: '化学', id: 10 }, { name: '体育', id: 11 }],
        subArray: ['总分', '语文', '数学', '英语', '生物', '物理', '地理', '政治', '历史', '化学', '体育'],
        subjectIndex: 0,
        subjectId: 9,
        listStudentName: [],
        listStudentSubject: [],
        hasChosen: false,
        studentName: '',
        currentTab: 0,
        ecFirst: {
            lazyLoad: true
        },
        firstDataSeriesByMax: [],
        firstDataSeriesByMin: [],
        firstDataSeriesByAvg: [],
        firstDataAxis: [],
        ecSecond: {
            lazyLoad: true
        },
        secondDataSeries: [],
        secondDataLegend: [],
        secondDataAxis: []
    },
    onLoad:function(option){
        wx.showLoading({ title: '加载中...' })
        this.getGredeAnalysisData(option);
        this.getClassCompareData(option);
        this.getStudentList(option)
    },
    onUnload:function(){
        this.firstComponent = null;
        this.secondComponent = null;
    },
    //选择科目
    pickSubject:function(e){
        let curSubject = e.detail.value;
        let option = {
            schoolId: this.data.schoolId,
            class_: this.data.class_,
            subjectId: curSubject
        }
        this.getClassCompareData(option)
    },
    //选择学生
    chooseStudent: function(e){
        const { currentTab } = this.data;
        let name = e.currentTarget.dataset.item.studentName;
        this.getStudentRankData(name, currentTab)
    },
    //换一个人
    changeAnother: function(){
        this.setData({hasChosen:false})
    },
    //切换 班级/全年级
    swichNav: function(e){
        let tab = e.currentTarget.dataset.name;
        if (this.data[tab] === e.target.dataset.current) {
            return false;
        } else {
            let type = e.target.dataset.current;
            this.getStudentRankData(this.data.studentName,type)
        }
    },
    //获取成绩分析数据
    getGredeAnalysisData: function(option){
        let cmd = "/auth/monthlyExamResults/list";
        let data = _.assign({ 
            weChatUserId: app.globalData.userId,
            schoolId: option.schoolId,
            class_: option.class_,
            userType: option.userType,
            subject: option.subjectId
        });
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    let resData = _.get(res, 'data.data');
                    let className = resData.class_
                    let yearMonth = resData.yearMonth.substr(0, 4) + '-' + resData.yearMonth.substr(4, 5);
                    let overallSituation = resData.overallSituation;
                    let allStudentGrade = resData.list;
                    for(let i = 0; i < overallSituation.length; i++){
                        overallSituation[i].avgClass = util.returnFloat(overallSituation[i].avgClass);
                        overallSituation[i].avgGrade = util.returnFloat(overallSituation[i].avgGrade);
                    }
                    this.setData({
                        className,
                        yearMonth,
                        overallSituation,
                        allStudentGrade
                    })
                }
            }
        })
    },
    //获取各班对比数据
    getClassCompareData: function(option){
        let cmd = "/auth/monthlyExamResults/classTeacherClassCompared";
        let data = _.assign({ 
            schoolId: option.schoolId,
            class_: option.class_,
            subject: option.subjectId
        });
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    let resData = _.get(res, 'data.data');
                    let listAvg = resData.listAvg;
                    let firstDataSeriesByMax = [], firstDataSeriesByMin = [], firstDataSeriesByAvg = [], firstDataAxis = [];
                    for(let i = 0; i < listAvg.length; i++){
                        firstDataSeriesByMax.push(listAvg[i].maxScore)
                        firstDataSeriesByMin.push(listAvg[i].minScore)
                        firstDataSeriesByAvg.push(util.returnFloat(listAvg[i].avgScore))
                        firstDataAxis.push(listAvg[i].class_)
                    }
                    const { subjectArray } = this.data;
                    let subjectIndex = 0;
                    subjectArray.map((item,i)=>{
                        if(item.id == option.subjectId){
                            subjectIndex = i;
                        }
                    })
                    this.setData({
                        firstDataSeriesByMax,
                        firstDataSeriesByMin,
                        firstDataSeriesByAvg,
                        firstDataAxis,
                        schoolId: option.schoolId,
                        class_: option.class_,
                        subjectIndex
                    })
                    this.initFirstChart();
                }
            }
        })
    },
    //获取学生名单数据
    getStudentList: function(option){
        let cmd = "/auth/monthlyExamResults/studenSubjectRangking";
        let data = _.assign({ 
            schoolId: option.schoolId,
            class_: option.class_,
            subject: option.subjectId
        });
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    let resData = _.get(res, 'data.data');
                    let listStudentName = resData.listStudentName;
                    for(let i = 0; i < listStudentName.length; i++){
                        listStudentName[i].check = false;
                    }
                    let listStudentSubject = resData.listStudentSubject;
                    this.setData({
                        listStudentName,
                        listStudentSubject
                    })
                }
            }
        })
    },
    //获取某一学生各科排名成绩
    getStudentRankData: function(name,type){
        let typeTxt = '';
        type === 0 ? typeTxt = 'class' : typeTxt = 'school';
        const { listStudentSubject } = this.data;
        let gradeList = [], secondDataSeries = [], secondDataLegend = [], secondDataAxis = [];
        listStudentSubject.map(item=>{
            if(item.studentName == name){
                gradeList = item.list;
            }
        })
        secondDataLegend = gradeList.map(item=>{ return item.subject });
        secondDataAxis = gradeList[0].list.map(item=>{ return item.yearMonth });
        for (let i = 0; i < gradeList.length; i++) {
            let obj = {};
            obj.data = [];
            obj.type = "line";
            obj.name = gradeList[i].subject;
            let list = _.get(gradeList, `${i}.list`, []);
            for (let j = 0; j < list.length; j++) {
                if(typeTxt == 'class'){
                    obj.data[j] = list[j].classRanking;
                }else{
                    obj.data[j] = list[j].schoolRanking;
                }
                
            }
            secondDataSeries.push(obj);
        }
        this.setData({
            studentName:name,
            hasChosen:true,
            secondDataLegend,
            secondDataAxis,
            secondDataSeries,
            currentTab: type
        })
        this.initSecondChart();
    },
    //初始化 各科各班 最高分/最低分/平均分 对比 图表
    initFirstChart: function () {
        this.firstComponent = this.selectComponent('#HTeacherFirstChart');
        chart.initChart(this, 'firstComponent', '#HTeacherFirstChart', HTeacherFirstChart);
    },
    //初始化 学生单科排名走势 班级/全年级 图表
    initSecondChart: function () {
        this.secondComponent = this.selectComponent('#HTeacherSecondChart');
        chart.initChart(this, 'secondComponent', '#HTeacherSecondChart', HTeacherSecondChart);
    },
    //获取 各科各班 最高分/最低分/平均分 对比图表数据
    getHTeacherFirstData: function(){
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

        return chart.barChartOption({ colorData, legendData, xData, yData, gridSetting, seriesData, tooltipSetting })
    },
    //学生单科排名走势 班级/全年级 图表数据
    getHTeacherSecondData: function(){
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
        // this.pageScrollToBottom();
        return chart.lineChartOption({ gridSetting, xData, legendData, yAxisInverse, seriesData, tooltipSetting });
    }
})