Page({
    data: {
        currentTab: 0,
        optionTab: 0
    },
    onload: function(){

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
    }
})