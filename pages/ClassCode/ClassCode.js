var md51 = require('../../utils/md51.js');
var requestGet = require('../../utils/requestGet.js');

Page({
  data: {
    windowHeight:0,
    windowWidth: 0,
    src:'../images/logo.png',
    hidden: true,
    classInfo: [],
    tapClassId: 0,
    keJieId: 0,
    imageW: 0,
    imageH: 0,
  },

  onLoad: function(){
    var that = this
    // 获取缓存
    this.setData({
      tapClassId: wx.getStorageSync('tapClassId'),
      keJieId: wx.getStorageSync('keJieIndex'),
      classInfo: wx.getStorageSync('classInfo'),
      teacherToken: wx.getStorageSync('teacherToken'),
      // lessonNumber: wx.getStorageSync('lessonN'),
    });
    // console.log(this.data.tapClassId)
    // console.log(typeof this.data.tapClassId)
    console.log(this.data.classInfo[this.data.tapClassId].classCode)
    var title = this.data.classInfo[this.data.tapClassId].classCode
    // console.log(this.data.keJieId)

    wx.setNavigationBarTitle({
      title: title+'.jpg'
    });
    // 转发设置
    wx.showShareMenu({
      withShareTicket: true
    });
    // 获取图片地址
    (function(){
      that.getUrl();
    })()
  },
  // onShow: function(){
  //   var that = this;
  //   (function(){
  //     that.getUrl();
  //   })()
  // },
  onShareAppMessage: function () {
    var that = this
    return {
      title: '转发给好友',
      path: '/pages/ClassCode/ClassCode',
      success: function(res) {
        // that.getUrl()
        console.log(res)
        // var shareTickets = res.shareTickets;
        // if(shareTickets.length == 0) {
        //   return false;
        // }
        // wx.getShareInfo({
        //     shareTicket: shareTickets[0];
        //     success: function(res){
        //         var encryptedData = res.encryptedData;
        //         var iv = res.iv;
        //     }
        // })
      },
      fail: function(res) {
        // 转发失败
        console.log(res)
      }
    }
  },
  onReady: function(){
    var that = this;
    // 手机宽高
    wx.getSystemInfo({
      success: function(res) {
        that.setData({windowHeight: res.windowHeight})
        that.setData({windowWidth: res.windowWidth})
        // console.log(res.windowHeight)
      }
    });

  },
  // 获取图片路径
  getUrl: function(){

    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken
    var classCode = this.data.classInfo[this.data.tapClassId].classCode;
    var keJieId = this.data.keJieId;
    var query1 = 'appid=web&nLesson='+ keJieId +'&sClassCode='+classCode+'&timestamp='+stamp+'&token='+token;
    var query2 = 'appid=web&nlesson='+ keJieId +'&sclasscode='+classCode+'&timestamp='+stamp+'&token='+token+'test';
    var sign = md51.md5(query2);
   
    var query = query1 + '&sign=' + sign;

    wx.showLoading({
      title:'加载中......',
      success: function(){
        requestGet.requestGet('api/CreatePic?'+ query,function(res){
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            that.setData({src: resData})
          }
          setTimeout(function(){
            wx.hideLoading()
          },500)
        })
        
      }
    })

  },
  /*saveImg: function(e){
    this.setData({hidden: false})
  },*/
  loadImg: function(e){
    console.log(e.detail.width+' ---- '+e.detail.height)
    this.setData({imageW: e.detail.width,imageH: e.detail.height})
  },
  seeImg:function(e){
    var that = this;
    wx.previewImage({
      current: that.data.src, // 当前显示图片的http链接
      urls: [that.data.src] // 需要预览的图片http链接列表
    })
  },
  // 保存图片到相册
  editImg:function(e){
    if(wx.saveImageToPhotosAlbum){
      console.log(11111)
      wx.getImageInfo({
        src: this.data.src,
        success: function(res){
          wx.saveImageToPhotosAlbum({
            filePath: res.path,
            success: function(res){
              console.log(res)
              wx.showModal({
                title:'提示',
                content:'保存成功',
                showCancel: false,
                confirmText:'确定'
              })
            },
            fail: function(err){
              console.log(err)
              wx.showModal({
                title:'提示',
                content:'保存失败',
                showCancel: false,
                confirmText:'确定'
              })
            },
            complete: function(res){
              console.log(res)
            }
          })
        }
      })
    }else{
      wx.shoeModal({
        title:'提示',
        content:'您的微信版本过低，请更新',
        showCancel: false,
        confirmText:'确定'
      })
    }
  },
  // 点击灰色区域隐藏
  hideModal: function(e){
    console.log(e)
    if(e.target.dataset.id == 'father' || e.target.dataset.id == 'son'){
      this.setData({hidden: true})
    }
  }
})