import * as echarts from './../components/ec-canvas/echarts'
import webConfig from "./../configs/config"
import "./fix"
import _ from "lodash";

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const http = {
  get: function (options, cb) {
    const app = getApp();
    const { cmd, method = "GET", data = {}, header = { uid: app && app.globalData.userId },
      success = () => { }, fail = () => { wx.showToast({ title: '操作失败', icon: 'error', duration: 2000 }) },
      complete = () => { wx.hideLoading() } } = options;
    try {
      let url = "";
      if (webConfig.port) {
        url = webConfig.protocol + "://" + webConfig.host + ":" + webConfig.port + `${cmd}`;
      } else {
        url = webConfig.protocol + "://" + webConfig.host + `${cmd}`;
      }
      if (app.globalData.userId) {
        wx.request({ url, method: "GET", header, data, success, fail, complete });
      } else {
        wx.request({ url, method: "GET", data, success, fail, complete });
      }
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none', duration: 2000 })
      console.log(e, '-----------------------');
    }
  },
  post: function (options, cb) {
    const app = getApp();
    const { cmd, method = "POST", header = { uid: app && app.globalData.userId }, data = {}, success = () => { }, fail = () => { wx.showToast({ title: '操作失败', icon: 'error', duration: 2000 }) }, complete = () => { wx.hideLoading() } } = options;
    try {
      let url = "";
      if (webConfig.port) {
        url = webConfig.protocol + "://" + webConfig.host + ":" + webConfig.port + `${cmd}`;
      } else {
        url = webConfig.protocol + "://" + webConfig.host + `${cmd}`;
      }
      if (app.globalData.userId) {
        wx.request({ url, method: "POST", header, data, success, fail, complete });
      } else {
        wx.request({ url, method: "POST", data, success, fail, complete });
      }
    } catch (e) {
      console.log(e, 'eeeeeeeeeeeeeeeeeeeeeeee')
      wx.showToast({ title: '操作失败', icon: 'none', duration: 2000 })
    }
  },
}

const returnFloat = value => {
  var v = Math.round(parseFloat(value) * 100) / 100;
  var x = v.toString().split(".");
  if (x.length == 1) {
    v = v.toString() + ".00";
    return v;
  }
  if (x.length > 1) {
    if (x[1].length < 2) {
      v = v.toString() + "0";
    }
  }
  return v;
}

const chart = {
  //图表初始化
  initChart: function (obj, chartComponent, dom, whichChart) {
    if (!obj[chartComponent]) {
      obj[chartComponent] = obj.selectComponent(dom);
    }
    obj[chartComponent].init((canvas, width, height) => {
      whichChart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: wx.getSystemInfoSync().pixelRatio || app.globalData.pixelRatio  // 像素
      });
      this.setOption(obj, whichChart, dom);
      return whichChart;
    });
  },
  //设置图表option
  setOption: function (obj, whichChart, dom) {
    var option;
    switch (dom) {
      case '#topChart':
        option = obj.getClassCompareData(0);
        break;
      case '#topChartByScore':
        option = obj.getClassCompareData(1);
        break;
      case '#secondBarChart':
        option = obj.getBandScoreBarData(0);
        break;
      case '#secondPieChart':
        option = obj.getBandScorePieData(0);
        break;
      case '#bottomBarChart':
        option = obj.getBandScoreBarData(1);
        break;
      case '#bottomPieChart':
        option = obj.getBandScorePieData(1);
        break;
      case '#trendChart':
        option = obj.getGradeTrendData();
        break;
      case '#supervisorFirstChart':
        option = obj.getHorizontalOption(0);
        break;
      case '#supervisorSecondChart':
        option = obj.getHorizontalOption(1);
        break;
      case '#supervisorThirdChart':
        option = obj.getVerticalOption();
        break;
      case '#supervisorFourthChart':
        option = obj.getTopicHorizontalOption();
        break;
      case '#objectiveFirstChart':
        option = obj.getHorizontalOption(0);
        break;
      case '#objectiveSecondChart':
        option = obj.getHorizontalOption(1);
        break;
      case '#objectiveThirdChart':
        option = obj.getVerticalOption();
        break;
      case '#objectiveFourthChart':
        option = obj.getTopicHorizontalOption();
        break;
      case '#managerFirstChart':
        option = obj.getAvgCompareData();
        break;
      case '#managerSecondChart':
        option = obj.getAvgTrendData();
        break;
      case '#managerThirdChart':
        option = obj.getPassRateData();
        break;
      case '#managerFourthChart':
        option = obj.getPassTrendData();
        break;
      case '#managerFifthChart':
        option = obj.getGradeSectionData();
        break;
      case '#parentTopChart':
        option = obj.getStudentGradeTrendData();
          break;
      case '#parentSecondChart':
        option = obj.getStudentScoreData();
        break;
    }

    whichChart.setOption(option);
    return whichChart;
  },
  //横向柱状图option
  barChartOption: function ({ title,colorData, legendData, legendAttributes,xData, yData, gridSetting, seriesData, tooltipSetting }) {
    var option = {
      title: title,
      color: colorData, //颜色数组
      tooltip: tooltipSetting,  //提示框设置
      legend: {
        data: legendData  //示例数组
      },
      grid: gridSetting,
      xAxis: xData,
      yAxis: yData,
      series: seriesData  //数据
    };
    // TODO 暂时改不了，只能额外添加
    option.legend = Object.assign(option.legend, legendAttributes);
    //end
    return option;
  },
  //饼状图option
  pieChartOption: function ({ title,colorData, pieData, tooltipSetting }) {
    var option = {
      title: {
        left: 'center'
      },
      color: colorData, //颜色数组
      tooltip: tooltipSetting,//提示框设置
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    // TODO 暂时改不了，只能额外添加
    if(title){
      option.title = title;
    }
    //end
    return option;
  },
  //折线图option
  lineChartOption: function ({ gridSetting, legendData, xData, yAxisInverse, seriesData,tooltipSetting }) {
    var option = {
      grid: gridSetting,
      tooltip: tooltipSetting,
      legend: legendData,
      xAxis: {
        type: 'category',
        data: xData,
        nameTextStyle: {
          fontSize: 40
        }
      },
      yAxis: {
        type: 'value',
        nameTextStyle: {
          fontSize: 40
        },
        inverse: yAxisInverse
      },
      series: seriesData
    };

    return option;
  },
  //垂直柱状图option
  verticalBarChartOption: function ({ title, colorData, xData, gridSetting, tooltipSetting, seriesData, subTitle }) {
    var option = {
      title: title,
      tooltip: tooltipSetting,
      color: colorData,
      xAxis: {
        type: 'category',
        data: xData
      },
      yAxis: {
        type: 'value'
      },
      grid: gridSetting,
      series: [{
        data: seriesData,
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.value + "%";
          }
        },
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(220, 220, 220, 0.8)'
        }
      }]
    };
    return option;
  },
  //分数段对比图 提示框数据组装
  getFormatter(params, type, data) {
    var interval;
    if (type == 'pie') {
      interval = params.data.name;
    } else {
      interval = params[0].axisValue;
    }
    var res = '', list = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].score == interval) {
        list = data[i].list.list;
      }
    }
    for (var i = 0; i < list.length; i++) {
      if (i % 2 === 0) {
        if (list[i + 1]) {
          res += this.clearData(list[i].studentName, list[i].score) + '   ' + this.clearData(list[i + 1].studentName, list[i + 1].score) + '\n';
        } else {
          res += this.clearData(list[i].studentName, list[i].score) + '   ' + '\n';
        }
      }
    }
    return res;
  },
  // 图表tooltip 的formatter 函数的数据组装
  clearData: function (name, score) {
    let str = "";
    if (_.size(name) === 2) {
      str = _.first(name) + '   ' + _.last(name) + '：' + score + '分';
    } else if (_.size(name) === 3) {
      str = name + '：' + score + '分';
    } else if (_.size(name) === 4) {
      str = name + '：' + score + '分';
    }
    return str;
  }
}

module.exports = {
  formatTime: formatTime,
  http: http,
  returnFloat: returnFloat,
  chart: chart
}
