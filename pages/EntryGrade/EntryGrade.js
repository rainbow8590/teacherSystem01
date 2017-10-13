// var md5 = require('../../utils/md5.js');
var md51 = require('../../utils/md51.js');
var requestGet = require('../../utils/requestGet.js');
var requestPost = require('../../utils/requestPost.js');
Page({
  data: {
    studentsList:[],
    headList:[],
    teacherName: '',
    teacherToken:'',
    classInfo: [], //班级信息
    classIndex: 0, //选择的班级
    lessonIndex: 0, //选择的班级的索引号
    lessonNumber: 0, //课节
    tipText: '满分100', //表单框提示语
  },
  onLoad: function(){
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      classInfo: wx.getStorageSync('classInfo'),
      lessonIndex: Number(wx.getStorageSync('lessonNumber')),
      classIndex: wx.getStorageSync('classIndex'),
      lessonNumber: wx.getStorageSync('lessonNumber')
    })
    this.getScore();
    this.headData();
  },
  onShareAppMessage: function(){
     return {
      title: '转发给好友',
      path: '/pages/EntryGrade/EntryGrade'
    }
  },
  setStorage: function (e) {
    this.setData({
      setStorage: e.detail.value
    })
  },
  // 设置head数据
  headData: function(){
    var info = this.data.classInfo[this.data.classIndex]
    this.data.headList.push(info.kemu + ' '+ info.classCode);
    this.data.headList.push(info.times);
    this.data.headList.push('第'+ this.data.lessonNumber +'节课');
    this.data.headList.push(info.sClassTypeName);
    this.setData({headList:this.data.headList});
  },
  // 验证分数
  checkScore: function(e){
    var score = Number(e.detail.value);
    if(score >=100){
      wx.showModal({
        title: '提示',
        content: '分数必须小于等于100',
        showCancel: false
      })
      return;
    }
  },
  // 获取学生姓名分数
  getScore: function(){
    
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var ClassCode = this.data.classInfo[this.data.classIndex].classCode;
    var studentNum = this.data.classInfo[this.data.classIndex].studentNumber;
    var lessonNum = this.data.lessonIndex;

    var query1 = 'appid=web&nLessonNo='+lessonNum+'&sClassCode='+ ClassCode +'&PageSize='+ studentNum +'&PageIndex=1&timestamp='+ stamp +'&token='+token;
    var query2 = 'appid=web&nlessonno='+lessonNum+'&pageindex=1&pagesize='+ studentNum +'&sclasscode='+ ClassCode +'&timestamp='+ stamp +'&token='+token+'test';
    var sign = md51.md5(query2); 
    var query = query1 + '&sign='+sign;
    wx.showLoading({
      title:'加载中......',
      success: function(){
          requestGet.requestGet('api/JinMenKao?'+ query,function(res){
            var resData = res.data;
            // console.log(resData)
            if(resData.ResultType == 0){
              var studentInfos = resData.AppendData;
              for(var i = 0 ; i < studentInfos.length; i++){
                var student = studentInfos[i]
                that.data.studentsList.push({
                  sStudentCode: student.sStudentCode,
                  sClassCode: student.sClassCode,
                  sName: student.sStudentName,
                  sCardCode: student.sCardCode,
                  nLessonNum: student.nLessonNo,
                  ScoreType: student.ScoreType,
                  Score: student.Score,
                  changeLessonState:student.changeLessonState
                })
              }
              for(var i = 0 ; i < that.data.studentsList.length; i++){
                var curS = that.data.studentsList[i];
                (function(i){
                  if(curS.changeLessonState == '正常' || curS.changeLessonState == '调入' || curS.changeLessonState == '转入' ){
                    that.setData({tipText: "满分100分"})
                  }else if(curS.changeLessonState == '调出'){
                    that.setData({tipText: "调出不可录"})
                  }
                })(i);
              }
              that.setData({studentsList:that.data.studentsList})
              // console.log(that.data.studentsList)
            }
            setTimeout(function(){
              wx.hideLoading()
            },500)
          });
          
      }
    })
    
  },
  // 储存学生分数
  saveScore: function(e){
    var that = this;
    var token = this.data.teacherToken; // token值
    var nxuebu = this.data.nXueBu;   //学部信息
    var stamp = new Date().getTime();  //时间戳
    var studentSize = this.data.classInfo[this.data.classIndex].studentNumber;
    var ClassCode = this.data.classInfo[this.data.classIndex].classCode;
    var datas = e.detail.value;
   
    var arr = [];
    var arr1 = [];
    for(var k in datas){
     var str = k + '=' + datas[ k ]
      arr.push(str);
    }
    for(var i = 0 ; i < arr.length; i+=6){
      arr1.push({
        "sClassCode": arr[i].substr(arr[i].indexOf('=')+1),
        "nLessonNo": Number(arr[i+1].substr(arr[i+1].indexOf('=')+1)),
        "sCardCode": arr[i+2].substr(arr[i+2].indexOf('=')+1) == "" ? null : arr[i+2].substr(arr[i+2].indexOf('=')+1),
        "sStudentCode": arr[i+3].substr(arr[i+3].indexOf('=')+1),
        "ScoreType": Number(arr[i+4].substr(arr[i+4].indexOf('=')+1)),
        "Score": arr[i+5].substr(arr[i+5].indexOf('=')+1),
      })
    }
    var strDatas = JSON.stringify(arr1);
    var query1 = 'appid=web&timestamp='+stamp+'&token='+token;
    var query2 = query1+'&'+strDatas+'test';
    var sign = md51.md5(query2);
    var query = query1 + '&sign=' + sign;

    console.log(arr1)
    requestPost.requestPost('api/JinMenKao?'+ query,arr1,function(res){
      console.log(res)
      var resData = res.data;
      var resD = JSON.parse(res.data)
      if(resD.ResultType == 0){
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
        setTimeout(function(){
          // wx.redirectTo({ url: '/pages/SelectClass/SelectClass'})
          wx.navigateBack({ delta: 1 })
        },1000)
      }
    })


    /*wx.request({  
      url: 'https://47.94.40.214:8085/api/Record?'+ query, 
      method:'post',
      data:arr1,
      dataType: JSON,
      success: function(res) {
        var resData = res.data;
        var resD = JSON.parse(res.data)
        if(resD.ResultType == 0){
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function(){
            // wx.redirectTo({ url: '/pages/SelectClass/SelectClass'})
            wx.navigateBack({ delta: 1 })
          },2000)
        }
      },
      fail: function(err){
        wx.showToast({
          title: '数据储存失败',
          icon: 'loading',
          duration: 2000
        })
      }
    })*/
  }

})