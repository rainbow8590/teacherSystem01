Page({
  data: {
    src: '../images/logo.png',
    mode: "scaleToFill",
    moblie: '',
    password: '',
    kind: 2  //教师 2  助教 1
  },
  onLoad: function(){
    // console.log(wx.getStorageSync('loginToken'))
    if(wx.getStorageSync('teacherName')){
      wx.redirectTo({ url: '/pages/serviceInd/serviceInd'})
      return;
    }
  },
  onShareAppMessage: function(){
     return {
      title: '转发给好友',
      path: '/pages/index/index'
    }
  },
  // 获取输入账号  
  moblieChange: function (e) {
    this.setData({
      moblie: e.detail.value
    })
  },  
  // 获取输入密码  
  passwordChange: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  // 获取教师或助教的value
  getKind: function(e){
    console.log(e)
    this.setData({
      kind: e.detail.value
    })
  },
  // 登录
  setStorage: function () {
    var that = this;
    // 校验表单
    if (this.data.password.length == 0 || this.data.moblie.length == 0) {
      // wx.showToast({
      //   title: '账号密码不能为空',
      //   icon: 'loading',
      //   duration: 2000
      // })
      wx.showModal({
        title: '提示',
        content: '账号密码不能为空',
        showCancel: false
      })
      return;
    }else {
      //已登录就不再次登陆
      if(wx.getStorageSync('teacherName')){
        console.log('已登录');
        wx.redirectTo({ url: '/pages/serviceInd/serviceInd'})
        return;
      }
      // 校验表单成功
      wx.login({
        success: function(response){
          if(response.code){
            wx.request({
              url: 'https://teacherapi.gaosiedu.com/api/Login', 
              method:'post',
              data: {
                "loginName": that.data.moblie,
                "password": that.data.password,
                "kind": that.data.kind,
                "appId": "web"
              },
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              // dataType: JSON,
              success: function(res) {
                console.log(res)
                var resData = res.data;
                if(resData.ResultType == 0){
                  wx.setStorageSync('teacherToken',resData.Message)
                  wx.setStorageSync('teacherName',resData.AppendData.sName)
                  wx.setStorageSync('kind',resData.AppendData.nkind)
                  // wx.setStorageSync('kind',that.data.kind)
                  wx.redirectTo({ url: '/pages/serviceInd/serviceInd'})
                  console.log(wx.getStorageSync('teacherToken'))
                }else{
                  // wx.showToast({
                  //   title: '用户名或密码错误',
                  //   icon: 'loading',
                  //   duration: 2000
                  // })
                  wx.showModal({
                    title: '提示',
                    content: '您的账号信息或选择的教师类型不正确',
                    showCancel: false
                  })
                }
                 console.log('登陆')
              },
              fail: function(err){
                console.log(err)
              }
            })
          }
        }
      })
    }
  }
  

})