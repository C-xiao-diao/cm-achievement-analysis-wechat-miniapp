const app = getApp();
// import { isArguments } from "lodash";
import "./../../utils/fix";
import _ from "./../../utils/lodash";
import { http } from "./../../utils/util";
import log from "./../../utils/log";

Page({
    data: {
        whetherToBuy: false,//是否支付过
        autoPickUpAddress: '',//自提地址
        productType: 2,//产品类型，1包月，2包学期，3包年
        pickupType: 1,//配送类型,1:自助提货，2:快递配送
        authorizePhone: '',//授权所得手机号
        contactPerson: '',//联系人
        phone: '',//手机号码
        address: '',//地址
        isShowAddrModal: false,  //地址弹框是否显示
        featureContent: [
            '根据所考试卷量身定制错题卷\n' +
            '专属错题训练完美掌握知识点\n' +
            '青云卷 ----- 错过的分不再丢~',

            '没有人会在同一个地方摔倒两次\n' +
            "" +
            '青云卷也不会让你在同一个知识点错两次\n',

            '巧用青云卷 查漏补缺学习更高效\n' +
            '精准攻克难点 举一反三轻松拿高分',

            '考试反复出错 ，感叹题海无边？\n' +
            '专属错题训练 ，助你得分上岸~',

            '错题丢分不可怕\n' +
            '可怕的是你已经把丢分形成了习惯',

            '错题不会只错一次，但考试还有下一次\n' +
            '定制你的专属试卷，轻松GET高分段',

            '有时候你以为你放弃的是一道错题\n' +
            '不曾想永不及格的分数是无数错题组成的\n' +
            '为什么不点击付款，让青云卷助你对一次？',

            '定制专属错题卷，涨分不止一点点\n' +
            '做对你的错题卷，得分可以很容易'
        ]
    },
    onLoad: function (option) {
        this.checkIfPaid();
        this.getAutoPickUpAddress(option);
        this.randomFeatureContent();
        this.checkHasAuthorizePhone();
    },
    onHide: function(){
        this.printLogs();
    },
    onShow: function(){
        this.printLogs();
    },
    //打印log
    printLogs: function(){
        log.info('info') 
        log.warn('warn')
        log.error('error')
        log.setFilterMsg('filterkeyword')
        log.setFilterMsg('addfilterkeyword')
    },
    randomFeatureContent: function () {
        let featureContent = this.data.featureContent;

    },
    //随机打乱轮播滚动文字
    bindanimationfinish: function () {
        let featureContent = this.data.featureContent;
        featureContent.sort(function () {
            return (0.5 - Math.random());
        });
        this.setData({ featureContent })
        // console.log(featureContent);
        // console.log("动画已执行完毕..................");
    },
    //是否授权过手机号码
    checkHasAuthorizePhone: function(){
        let cmd = "/auth/wechat/getUserPhone";
        let data = { userId: app.globalData.userId };
        http.post({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200) {
                    var deliveryPhone = '';
                    if(_.get(res, 'data.data.payPhone') && !_.isEmpty(_.get(res, 'data.data.payPhone'))){
                        var phone = _.get(res, 'data.data.payPhone');
                    }
                    if(_.get(res, 'data.data.userPhone') && !_.isEmpty(_.get(res, 'data.data.userPhone'))){
                        var authorizePhone = _.get(res, 'data.data.userPhone');
                    }
                    if(phone){
                        deliveryPhone = phone;
                    }else{
                        deliveryPhone = authorizePhone;
                    }
                    this.setData({phone:deliveryPhone, authorizePhone});
                }
            }
        })
    },
    //获取用户授权的手机号码
    getPhoneNumber:function(e){
        var that = this;
        wx.login({
            success (res) {
              if (res.code) {
                let cmd = "/api/weChat/appletsGetOpenid";
                http.get({
                  cmd,
                  data:{code: res.code},
                  success: res => {
                    if (_.get(res, 'data.code') === 200) {
                        that.getDecodePhone(e.detail.errMsg,e.detail.encryptedData,e.detail.iv)
                    }
                  }
                })
              }
            }
        })
    },
    //获取解码后的手机号
    getDecodePhone:function(errMsg,encryptedData,iv){
        if (errMsg == "getPhoneNumber:ok") {
            let cmd = "/auth/wechat/getUserPhone";
            let data = { 
                encryptedData: encryptedData,
                iv: iv,
                userId: app.globalData.userId 
            };
            http.post({
                cmd,
                data,
                success: res => {
                    if (_.get(res, 'data.code') === 200) {
                        var deliveryPhone = '';
                        if(_.get(res, 'data.data.payPhone') && !_.isEmpty(_.get(res, 'data.data.payPhone'))){
                            deliveryPhone = _.get(res, 'data.data.payPhone')
                        }else {
                            deliveryPhone = _.get(res, 'data.data.userPhone')
                        }
                        this.setData({
                            phone: deliveryPhone,
                            authorizePhone: _.get(res, 'data.data.userPhone')
                        })
                    }else{
                        wx.showModal({
                            title: '提示',
                            content: _.get(res, 'data.msg') || '授权失败，请联系管理员',
                            success(res) {}
                        })
                    }
                }
            })
        }else{
            wx.showModal({
                title: '提示',
                content: '您已拒绝授权手机号码',
                success(res) {}
            })
        }
    },
    //切换
    swichNav: function (e) {
        let name = e.currentTarget.dataset.name;
        let tab = e.currentTarget.dataset.current;
        if (this.data[name] === tab) {
            return false;
        } else {
            this.setData({ [name]: tab })
        }
    },
    //切换
    swichNav2: function(e){
        let name = e.currentTarget.dataset.name;
        let tab = e.currentTarget.dataset.current;
        if(tab == 1){
            this.setData({ pickupType: tab })
        } else {
            this.setData({ pickupType: tab, isShowAddrModal: true })
        }
    },
    //取消弹框
    cancelModal: function () {
        this.setData({
            isShowAddrModal: false
        })
    },
    //是否支付过
    checkIfPaid: function () {
        let cmd = "/auth/pay/judgeWhether";
        let data = { userId: app.globalData.userId };
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200) {
                    let whetherToBuy = _.get(res, 'data.data.whetherToBuy');
                    if (_.get(res, 'data.data.address')) {
                        var address = _.get(res, 'data.data.address');
                    }
                    if (_.get(res, 'data.data.contactPerson')) {
                        var contactPerson = _.get(res, 'data.data.contactPerson');
                    }
                    // if (_.get(res, 'data.data.phone')) {
                    //     var phone = _.get(res, 'data.data.phone');
                    // }

                    this.setData({ whetherToBuy, contactPerson, address });
                }
            }
        })
    },
    //获取自提地址
    getAutoPickUpAddress: function (option) {
        let cmd = "/auth/paperAddress/getPaperAddress";
        let data = { schoolId: option.schoolId };
        http.get({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200) {
                    let autoPickUpAddress = _.get(res, 'data.data.address');
                    this.setData({ autoPickUpAddress });
                }
            }
        })
    },
    //获取input框value
    getInputValue: function (e) {
        let name = e.currentTarget.dataset.name;
        this.setData({ [name]: e.detail.value })
    },
    // 提交地址
    addAddress: function () {
        const {  contactPerson, phone, address } = this.data;
        // console.log(contactPerson, phone, address, '[[[[[[[[[')
        if (_.isEmpty(contactPerson) || _.isEmpty(phone)|| _.isEmpty(address)) {
            wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
            return;
        }
        if (phone.length != 11) {
            wx.showToast({ title: '请输入有效的电话号码', icon: 'none', duration: 2000 });
            return;
        }
        this.setData({
            isShowAddrModal: false,
            ['autoPickUpAddress']: this.data.address
        })
    },
    //支付
    goToPay: function () {
        let cmd = "/auth/pay/initPay";
        const { productType, pickupType, contactPerson, phone, authorizePhone, address, autoPickUpAddress } = this.data;

        let data = { userId: app.globalData.userId, productType, pickupType, address: autoPickUpAddress };
        // console.log(pickupType, 'pickupTypepickupTypepickupTypepickupType',contactPerson,phone,address);

        if (pickupType === 2) {//快递配送
            if (_.isEmpty(contactPerson) || _.isEmpty(phone)|| _.isEmpty(address)) {
                wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
                return;
            }
            if (phone.length != 11) {
                wx.showToast({ title: '请输入有效的电话号码', icon: 'none', duration: 2000 });
                return;
            }
            data.contactPerson = contactPerson;
            data.phone = phone;
            data.address = address;
        }else {//自助提货
            if(authorizePhone){
                data.phone = authorizePhone;
            }else if(phone){
                data.phone = phone;
            }
        }
        http.post({
            cmd,
            data,
            success: res => {
                if (_.get(res, 'data.code') === 200 && !_.isEmpty(_.get(res, "data.data"))) {
                    let resData = _.get(res, 'data.data');
                    wx.requestPayment({
                        timeStamp: resData.timeStamp,
                        nonceStr: resData.nonceStr,
                        package: resData.packageStr,
                        signType: resData.signType,
                        paySign: resData.paySign,
                        success(res) {
                            wx.showToast({
                                title: '支付成功',
                                icon: 'success',
                                duration: 2000,
                                success: function () {
                                    wx.navigateBack({ delta: 0, });
                                }
                            });
                        },
                        fail(res2) {
                            wx.showToast({ title: '支付失败', icon: 'fail', duration: 2000 });
                        }
                    })
                } else if (_.get(res, 'data.code') === 103) {
                    wx.showModal({
                        title: '提示',
                        content: _.get(res, 'data.msg') || '购买异常，请联系官方',
                        success(res) { }
                    })
                }
            }
        })
    }
})