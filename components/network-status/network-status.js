Component({
    lifetimes: {
        // 在组件实例进入页面节点树时执行
        attached: function() {
            this.getNetworkType();
            this.checkNetworkStatusChange();
        }
    },
    data: {
        showNetwork: false,
        connectSuccess: false,
        networkInfo: ''
    },
    methods: {
        getNetworkType: function(){
            var that = this;
            wx.getNetworkType({
              success (res) {
                const networkType = res.networkType;
                if(networkType == 'none'){
                    var str = '网络连接出了问题，\n请检查您的网络连接';
                    that.ifShowNetwork(str, false, false);
                }
              }
            })
        },
        checkNetworkStatusChange: function(){
            var that = this;
            wx.onNetworkStatusChange(function (res) {
              if (res.networkType == 'none') {
                var str = '网络连接已断开';
                that.ifShowNetwork(str, false, false);
              } else {
                var str = '网络连接成功';
                that.ifShowNetwork(str, true, true);
              }
            })
        },
        ifShowNetwork: function(str,boolen,isclose){
            var timer = null, that = this;
            this.setData({
                networkInfo: str,
                connectSuccess: boolen,
                showNetwork: true
            })
            if(isclose){
                timer = setTimeout(function(){
                    that.setData({ showNetwork: false });
                    timer = null;
                },2000)
            }
        }
    }
})