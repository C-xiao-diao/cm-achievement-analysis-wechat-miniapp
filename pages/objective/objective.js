const app = getApp();
import * as echarts from './../../components/ec-canvas/echarts'
import "./../../utils/fix";
import _ from "lodash";

var firstChart = null,secondChart=null,thirdChart=null;

Page({
    data:{
        ecFirstChart: {
            lazyLoad: true
        },
        ecSecondChart: {
            lazyLoad: true
        },
        ecThirdChart: {
            lazyLoad: true
        },
        //题目tab
        tabList: ["第一题", '第二题','第三题','第四题','第五题','第六题','第七题','第八题','第九题','第十题'],
        activeTabIndex: 0,
    },
    onReady(){
        this.initFirstChart();
        this.initSecondChart();
        this.initThirdChart();
    },
    //初始化第一个图
    initFirstChart: function(){
        this.firstComponent = this.selectComponent('#firstChart');  
        this.initChart('firstComponent', '#firstChart', firstChart);
    },
    //初始化第二个图
    initSecondChart: function(){
        this.secondComponent = this.selectComponent('#secondChart');  
        this.initChart('secondComponent', '#secondChart', secondChart);
    },
    //初始化第三个图
    initThirdChart: function(){
        this.thirdComponent = this.selectComponent('#thirdChart');
        this.initChart('thirdComponent', '#thirdChart', thirdChart);  
    },
    //图表初始化方法
    initChart(chartComponent, dom, whichChart){
        if(!this[chartComponent]){
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
    setOption:function(whichChart,dom){
        var option;
        switch(dom){
            case '#firstChart':
                option = this.getHorizontalOption(); 
                break;
            case '#secondChart':
                option = this.getHorizontalOption(); 
                break;
            case  '#thirdChart':
                option = this.getVerticalOption(); 
                break;
        }
        whichChart.setOption(option);
        return whichChart;
    },
    getHorizontalOption(){
        var option = {
            color: ['#edafda', '#93b7e3'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['优秀率 ', '及格率']
            },
            grid:{
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
                    data: ['C1801', 'C1802', 'C1803', 'C1804', 'C1805','C1806', 'C1807', 'C1808', 'C1809', 'C1810'],
                    inverse: true
                }
            ],
            series: [
                {
                    name: '优秀率 ',
                    type: 'bar',
                    label: {
                        show:true
                    },
                    barGap: "0",
                    data: [0.3, 0.2, 0.4, 0.5, 0.3,0.3, 0.2, 0.4, 0.5, 0.3],
                },
                {
                    name: '及格率',
                    type: 'bar',
                    label: {
                        show:true
                    },
                    barGap: "0",
                    data: [0.3, 0.2, 0.4, 0.5, 0.3,0.3, 0.2, 0.4, 0.5, 0.3],
                }
            ]
          };
          return option;
    },
    getVerticalOption(){
        var option = {
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            grid:{
                left: "20%",
                top: "10%",
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
    },
    // 切换tab页试题
    swichNav: function(e){
        let activeTabIndex = _.get(e, "currentTarget.dataset.current");
        this.setData({activeTabIndex})
    }
})