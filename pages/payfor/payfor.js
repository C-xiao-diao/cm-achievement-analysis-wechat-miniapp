const app = getApp();
import "./../../utils/fix";
import _ from "./../../utils/lodash";
import { http } from "./../../utils/util";

Page({
    data: {
        whetherToBuy:false,//是否支付过
        autoPickUpAddress: '',//自提地址
        productType: 1,//产品类型，1包月，2包学期，3包年
        pickupType: 1,//配送类型,1:自助提货，2:快递配送
        contactPerson: '',//联系人
        phone: '',//手机号码
        address: ''//地址
    },
    onLoad: function(option){
        this.checkIfPaid();
        this.getAutoPickUpAddress(option);
    },
    //切换
    swichNav: function(e){
        let name = e.currentTarget.dataset.name;
        let tab = e.currentTarget.dataset.current;
        if (this.data[name] === tab) {
            return false;
        } else {
            this.setData({ [name]: tab })
        }
    },
    //是否支付过
    checkIfPaid: function(){
        let cmd = "/auth/pay/judgeWhether";
        let data = { userId: app.globalData.userId };
        http.get({
            cmd,
            data,
            success: res=>{
                if(_.get(res,'data.code')===200){
                    let whetherToBuy = _.get(res,'data.data');
                    this.setData({whetherToBuy});
                }
            }
        })
    },
    //获取自提地址
    getAutoPickUpAddress:function(option){
        let cmd = "/auth/paperAddress/getPaperAddress";
        let data = { schoolId: option.schoolId };
        http.get({
            cmd,
            data,
            success: res=>{
                if(_.get(res,'data.code')===200){
                    let autoPickUpAddress = _.get(res,'data.data.address');
                    this.setData({autoPickUpAddress});
                }
            }
        })
    },
    //获取input框value
    getInputValue: function(e){
        let name = e.currentTarget.dataset.name;
        this.setData({ [name]: e.detail.value })
    },
    //支付
    goToPay: function(){
        let cmd = "/auth/pay/initPay";
        const { productType, pickupType, contactPerson, phone, address, autoPickUpAddress } = this.data;

        let data = { userId: app.globalData.userId, productType, pickupType, address: autoPickUpAddress };

        if(pickupType===2){//快递配送
            if(contactPerson == '' || phone == '' || address ==''){
                wx.showToast({ title: '请填写完整的信息', icon: 'none', duration: 2000 });
                return;
            }
            if(phone.length != 11){
                wx.showToast({ title: '请输入有效的电话号码', icon: 'none', duration: 2000 });
                return;
            }
            data.contactPerson = contactPerson;
            data.phone = phone;
            data.address = address;
        }
        http.post({
            cmd,
            data,
            success: res=>{
                if(_.get(res,'data.code')===200 && !_.isEmpty(_.get(res, "data.data"))){
                    let resData = _.get(res,'data.data');
                    wx.requestPayment({
                        timeStamp: resData.timeStamp,
                        nonceStr: resData.nonceStr,
                        package: resData.packageStr,
                        signType: resData.signType,
                        paySign: resData.paySign,
                        success (res) { 
                            wx.showToast({ 
                                title: '支付成功', 
                                icon: 'success', 
                                duration: 2000,
                                success: function(){
                                    wx.navigateBack({ delta: 0, });
                                }
                             });
                        },
                        fail(res2){
                            wx.showToast({ title: '支付失败', icon: 'fail', duration: 2000 });
                        }
                      })
                }
            }
        })
    }
})