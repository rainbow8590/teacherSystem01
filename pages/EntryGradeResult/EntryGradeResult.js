var md51 = require('../../utils/md51.js');
var requestGet = require('../../utils/requestGet.js');

Page({
  data:{
    windowHeight: 0, // 手机高度
    windowWidth: 0, //手机宽度
    heigh: 600,  //表格体的高度
    theadH: 37, // 表头的高度
    headH: 120, // 顶部蓝色块的高度
    contentH: 900, // 表格内容的高度
    contentW: 1500, // 表格分数内容的宽度
    startX: 0, //手指touchstart的X位置
    startY: 0, //手指touchstart的Y位置
    saveOldLeft: 0, 
    saveOldTop:0,
    scrollL:0, //动态设置的left值
    scrollT:0, //动态设置的top值
    tapClassId:0,
    classInfo:[],
    teacherToken:'',
    infos:[],
    changeW: 130,
    lessonNumber:0, //总课节数,
    lessonNumArr: [],  //课节数组
    headList:[],
    currentItem: 0,
    firstT:0,
    firstr: 0,
  },
  onLoad: function(){
    this.setData({
      tapClassId: wx.getStorageSync('tapClassId'),
      classInfo: wx.getStorageSync('classInfo'),
      teacherToken: wx.getStorageSync('teacherToken'),
      lessonNumber: wx.getStorageSync('lessonN'),
      // classIndex: wx.getStorageSync('classIndex'),
    });
    // console.log(this.data.classInfo);
    // console.log(this.data.tapClassId);
    // console.log(1111111111111)

    this.headData();
    this.getStudentsData();
    // console.log(this.data.lessonNumber)
    for(var i = 2; i <= this.data.lessonNumber;i++){
      this.data.lessonNumArr.push(i)
    }
    this.setData({lessonNumArr: this.data.lessonNumArr})

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
  onShareAppMessage: function(){
     return {
      title: '转发给好友',
      path: '/pages/EntryGradeResult/EntryGradeResult'
    }
  },
  // 设置head数据
  headData: function(){
    var info = this.data.classInfo[this.data.tapClassId]
    this.data.headList.push(info.kemu + ' '+ info.classCode);
    this.data.headList.push(info.times);
    // this.data.headList.push('第'+ this.data.lessonNumber +'节课');
    this.data.headList.push(info.sClassTypeName);
    this.setData({headList:this.data.headList});
  },
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh();
  },
  touchstart: function(e){
    var that = this;
    // 表格的高度
    this.setData({
       contentH: 37*this.data.infos.length,
       contentW: 80*(this.data.lessonNumber)+180,
       heigh:this.data.windowHeight - this.data.headH - this.data.theadH - 1
    })
    if(this.data.heigh > this.data.contentH){
      this.setData({
        heigh:this.data.contentH
      })
    }

    var sX = 0,sY = 0;
    sX = e.touches[0].clientX;
    sY = e.touches[0].clientY;
    this.setData({ startX: sX ,startY: sY});
  },
  touchmove: function(e) {
    var mX = 0,mY = 0;
    mX = e.touches[0].clientX;
    mY = e.touches[0].clientY;
    var mXpx = mX - this.data.startX + this.data.saveOldLeft;
    var mYpx = mY - this.data.startY + this.data.saveOldTop;
    /* 判断 水平方向上临界值 */
    if (mXpx > 0) {
      mXpx = 0 // 如果往右边拖动 left 不能大于 0
    }else if(mXpx < this.data.windowWidth-this.data.contentW-165) {
      mXpx = this.data.windowWidth-this.data.contentW-165
    }else{
      mXpx = mX - this.data.startX + this.data.saveOldLeft;
    }
    /* 判断 垂直方向上临界值 */
    if(mYpx > 0){
      mYpx = 0 
    }else if(mYpx < this.data.heigh - this.data.contentH){
      mYpx = this.data.heigh - this.data.contentH
    }else{
      mYpx = mY - this.data.startY + this.data.saveOldTop;
    }
    this.setData({ scrollL: mXpx, scrollT: mYpx});
  },
  touchend: function(e) {
    var scrollL = this.data.scrollL;
    var scrollT = this.data.scrollT;
    this.setData({ saveOldLeft: scrollL, saveOldTop: scrollT})
  },
  // 获取数据
  getStudentsData: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken
    var classCode = this.data.classInfo[this.data.tapClassId].classCode;

    var query1 = 'appid=web&sClassCode='+classCode+'&timestamp='+stamp+'&token='+token;
    var query2 = 'appid=web&sclasscode='+classCode+'&timestamp='+stamp+'&token='+token+'test';
    var sign = md51.md5(query2);
   
    var query = query1 + '&sign=' + sign

    wx.showLoading({
      title:'加载中......',
      success: function(){
        requestGet.requestGet('api/ClassStudentJinMenKao?'+ query,function(res){
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            // console.log(resData)
            var newInfos = [];
            
            for(var i = 0 ; i < resData.length; i++){
              var scoreJson = []
              var scoreArr = []
              var info = resData[i];
              for(var k in info){
                if(k.indexOf('No') == 0){
                  scoreJson.push(info[k])
                }
              }
              scoreArr = scoreJson.slice(0,that.data.lessonNumber-1)
              for(var j = 0 ; j < scoreArr.length; j++){
                if(scoreArr[j] == null){
                  scoreArr[j] = '--';
                }
              }
              newInfos.push({
                id: i,
                sId: info.sStudentCode,
                sName: info.sStudentName,
                sSchool: info.sSchoolName == null|| info.sSchoolName== ""? '--': info.sSchoolName,
                isOthersubject: info.sQiTaXueKe == null? '否':'是',
                sOthersubject: info.sQiTaXueKe,
                sExperimentalType: info.sExperimentalType == null? "--":info.sExperimentalType,
                sScore: scoreArr
              })
            }
            that.setData({infos: newInfos})
          }
          setTimeout(function(){
            wx.hideLoading()
          },500)
        })
        
      }
    })

    /*wx.request({
      url: yuming +'/api/ClassStudentJinMenKao?'+ query, 
      method:'get',
      header: {
        // "Content-Type": "application/json"
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        if(res.data.ResultType == 0){
          var resData = res.data.AppendData;
          console.log(resData)
          var newInfos = [];
          
          for(var i = 0 ; i < resData.length; i++){
            var scoreJson = []
            var scoreArr = []
            var info = resData[i];
            for(var k in info){
              if(k.indexOf('No') == 0){
                scoreJson.push(info[k])
              }
            }
            scoreArr = scoreJson.slice(0,that.data.lessonNumber-1)
            for(var j = 0 ; j < scoreArr.length; j++){
              if(scoreArr[j] == null){
                scoreArr[j] = '000000';
              }
            }
            newInfos.push({
              id: i,
              sId: info.sStudentCode,
              sName: info.sStudentName,
              sSchool: info.sSchoolName == null? '未填写': info.sSchoolName,
              isOthersubject: info.sQiTaXueKe == null? '否':'是',
              sOthersubject: info.sQiTaXueKe,
              sExperimentalType: info.sExperimentalType == null? "空":info.sExperimentalType,
              sScore: scoreArr
            })
          }
          that.setData({infos: newInfos})
        }
      }
    })*/
  },
  showTip: function(e){
    var that = this
    var id = e.currentTarget.dataset.id;
    console.log(id)
    that.setData({currentItem: id})
    setTimeout(function(){
      that.setData({currentItem: id+100})
    },3000)
  }
})