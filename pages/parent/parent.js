const app = getApp();
import "./../../utils/fix";
import _ from "lodash";
const util = require('../../utils/util.js');
import { http, chart } from "./../../utils/util";

var parentTopChart = null, parentSecondChart = null;

Page({
    data: {
        class_: '',
        studentName: '',
        yearMonth: '',
        transcriptList:[],
        listMonth: [],
        subjectArray: [{name:'语文', id:1},{name:'数学', id:2},{name:'英语', id:3},{name:'生物', id:4},{name:'物理', id:5},{name:'地理', id:6},{name:'政治', id:7},{name:'历史', id:8},{name:'化学', id:10},{name:'体育', id:11}],
        subArray: ['语文','数学','英语','生物','物理','地理','政治','历史','化学','体育'],
        subjectIndex: 0,
        activeTabIndex1: 0,
        activeTabIndex2: 0,
        objectiveQuestion: [],//客观题
        subjectiveQuestion: [],//主观题
        listResultObjectiveQuestion: [],//客观题答案列表
        listResultSubjectiveQuestion: [],//主观题答案列表
        objectiveAnswer: {},
        supervisorAnswer: {},
        classArray: [],
        ecTopChart: {
            lazyLoad: true
        },
        ecSecondChart: {
            lazyLoad: true
        }
    },
    onLoad:function(){
        wx.showLoading({title: '加载中...'})
        this.getGradeAnalysis();
        this.getStudentGrade();
    },
    //选择科目
    pickSubject: function(e) {
        this.setData({ 
            subjectIndex: e.detail.value,
            activeTabIndex1: 0,
            activeTabIndex2: 0
        })
        this.getGradeAnalysis((Number(e.detail.value)+1))
    },
    //获取学生成绩表数据
    getStudentGrade: function(){
        let cmd = "/auth/parentStatisticalAnalysis/list";
        let data = { weChatUserId: app.globalData.userId };
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    let responseData = _.get(res, 'data.data');
                    let yearMonth = responseData.yearMonth.substr(0, 4) + '-' + responseData.yearMonth.substr(4, 5)
                    let studentName = responseData.studentName;
                    let class_ = responseData.class_;
                    let transcriptList = responseData.transcriptList;
                    let listMonth = responseData.listMonth;
                    let historicalGradeRanking = responseData.historicalGradeRanking;
                    for(let i = 0; i < transcriptList.length; i++){
                        transcriptList[i].classAvgScore = util.returnFloat(transcriptList[i].classAvgScore)
                    }

                    this.setData({
                        class_,
                        yearMonth,
                        studentName,
                        transcriptList,
                        listMonth,
                        historicalGradeRanking
                    })
                    this.initFirstChart();
                }
            }
        })
    },
    //获取主客观题成绩分析数据
    getGradeAnalysis: function(subject){
        const {subjectIndex,activeTabIndex1,activeTabIndex2} = this.data;
        let cmd = "/auth/parentStatisticalAnalysis/analysisOfEachQuestion";
        let data = { weChatUserId: app.globalData.userId, subject: subject || (subjectIndex+1) };
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, 'data.data'))) {
                    let responseData = _.get(res, 'data.data');
                    console.log(responseData, ',,,,,,,,,,,,,,,,,,,,,,,,,,');
                    let objectiveQuestion = responseData.objectiveQuestion;
                    // let subjectiveQuestion = responseData.subjectiveQuestion;
                    let subjectiveQuestion = [];
                    let listResultObjectiveQuestion = responseData.listResultObjectiveQuestion;
                    for(let i = 0; i < listResultObjectiveQuestion.length; i++){
                        listResultObjectiveQuestion[i].gradeCorrectAnswerRate = util.returnFloat(listResultObjectiveQuestion[i].gradeCorrectAnswerRate*100);
                    }
                    let listResultSubjectiveQuestion = responseData.listResultSubjectiveQuestion;
                    for(let i = 0; i < listResultSubjectiveQuestion.length; i++){
                        subjectiveQuestion.push(listResultSubjectiveQuestion[i].topic);
                        listResultSubjectiveQuestion[i].gradeScoreRate = util.returnFloat(listResultSubjectiveQuestion[i].gradeScoreRate*100);
                    }

                    this.setData({
                        objectiveQuestion,
                        subjectiveQuestion,
                        listResultObjectiveQuestion,
                        listResultSubjectiveQuestion
                    })
                    this.getObjectiveAnswer(listResultObjectiveQuestion,activeTabIndex1);
                    this.getSupervisoreAnswer(listResultSubjectiveQuestion, activeTabIndex2);
                    console.log(listResultSubjectiveQuestion, activeTabIndex2,'hhhhhhhhh',subjectiveQuestion)
                }
            }
        })
    },
    //题目切换
    swichNav: function(e){
        const { listResultObjectiveQuestion, listResultSubjectiveQuestion } = this.data;
        let activeTabType = _.get(e, "currentTarget.dataset.type");

        if(activeTabType == 'objective'){//客观题选项
            let activeTabIndex1 = _.get(e, "currentTarget.dataset.current");
            this.getObjectiveAnswer(listResultObjectiveQuestion, activeTabIndex1);
            this.setData({activeTabIndex1})
        }else {//主观题选项
            let activeTabIndex2 = _.get(e, "currentTarget.dataset.current");
            this.getSupervisoreAnswer(listResultSubjectiveQuestion, activeTabIndex2);
            this.setData({activeTabIndex2})
        }
    },
    //获取该同学客观题答案
    getObjectiveAnswer: function(arr, index){
        let objectiveAnswer = arr[index];
        this.setData({objectiveAnswer});
    },
    //获取该同学主观题答案
    getSupervisoreAnswer: function(arr, index){
        let supervisorAnswer = arr[index];
        this.setData({supervisorAnswer});
        this.initSecondChart();
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
        const { listMonth,subArray,historicalGradeRanking } = this.data;
        let gridSetting = {
            top: '30%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        };
        let legendData = {data: subArray};
        let xData = listMonth.map(item=>{ return item.yearMonth });
        let yAxisInverse = false;
        let seriesArr = []
        for(let i = 0; i < historicalGradeRanking.length; i++){
            let dataArr = [];
            for(let j = 0; j < historicalGradeRanking[i].list.length; j++ ){
                dataArr.push(historicalGradeRanking[i].list[j].ranking);
            }
            seriesArr.push({
                name: historicalGradeRanking[i].subject,
                type: 'line',
                data: dataArr
            })
        }
        let seriesData = seriesArr;
        let tooltipSetting = {trigger: 'axis',position: ['15%', '0%']};

        return chart.lineChartOption({ gridSetting, legendData, xData, yAxisInverse, seriesData,tooltipSetting });
    },
    //获取 主观题得分分布 option
    getStudentScoreData(){
        const { supervisorAnswer } = this.data;
        let scoreList = supervisorAnswer.list;
        let title ={
            text: '得分分布图',
            left: 'center',
            textStyle:{
               fontWeight: 'normal',
               fontSize: 16 
            } 
        }
        let subTitle = '';
        let colorData = ['#566b8e'];
        let xData = scoreList.map(item=>{ return item.score });
        let gridSetting = {left: "20%", top: "20%", bottom: "10%"};
        let tooltipSetting = {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'       // 默认为直线，可选为：'line' | 'shadow'
            },
            position: ['15%', '0%']
        };
        let seriesData = scoreList.map(item=>{ return _.round(item.rate*100) });

        return chart.verticalBarChartOption({ title, colorData, xData, gridSetting, tooltipSetting, seriesData, subTitle })
    }
})