import "./../../utils/fix";
import _ from "lodash";

const app = getApp()

Page({
    data: {
        class: '',
        studentName: '',
        yearMonth: '',
        subjectArray: [{name:'总分', id:0},{name:'语文', id:1},{name:'数学', id:2},{name:'英语', id:3},{name:'生物', id:4},{name:'物理', id:5},{name:'地理', id:6},{name:'政治', id:7},{name:'历史', id:8},{name:'化学', id:10},{name:'体育', id:11}],
        subArray: ['总分','语文','数学','英语','生物','物理','地理','政治','历史','化学','体育'],
        subjectIndex: 0,
        classArray: [],
    },
    //选择科目
    pickSubject: function(e) {
        this.setData({ subjectIndex: e.detail.value})
    },
})