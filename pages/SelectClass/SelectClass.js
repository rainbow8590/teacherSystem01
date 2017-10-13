var md51 = require('../../utils/md51.js');
var requestGet = require('../../utils/requestGet.js');
var classList = require('../../utils/classList.js');
// var sortClassAsWeek = require('../../utils/sortClassAsWeek.js');
// var sortClassAsQi = require('../../utils/sortClassAsQi.js');
Page({
  data: {
    array: ['秋季', '寒假', '春季','暑假'],
    index1: 1,
    date: '2017',
    classes: [],
    index2: 0,
    array3: ['请选择'],
    index3: 0,
    showModalStatus: false,
    teacherName:'',
    teacherToken:'',
    classInfo:[],
  },
  // 设置课节
  setLesson: function(num){
    var lesson = this.data.classInfo[num].lessonNumber;
    for(var i = 2 ; i <= lesson; i++){
      this.data.array3.push(i);
    }
    this.setData({array3: this.data.array3});
  },
  onLoad: function(){
    wx.setStorageSync('classIndex',this.data.index2)
    wx.setStorageSync('lessonNumber',this.data.index3)
    // 获取缓存
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken')
      // classInfo: wx.getStorageSync('classInfo'),
      // classIndex: wx.getStorageSync('classIndex')
    });
    this.getClassList(this.data.classInfo);
  },
  onShareAppMessage: function(){
     return {
      title: '转发给好友',
      path: '/pages/SelectClass/SelectClass'
    }
  },
  unlogin: function(){
    // wx.removeStorageSync('loginToken');
    // wx.removeStorageSync('teacherName');
    wx.clearStorageSync()
    // wx.redirectTo({ url: '/pages/index/index'})
    wx.reLaunch({ url: '/pages/index/index'})
  },
  bindPickerChange: function (e) {
    this.setData({
      index1: Number(e.detail.value)+1,
      index2: 0,
      index3: 0,
    })
    wx.setStorageSync('classIndex',this.data.index2)
    this.getClassList();
  },

  bindPicker2Change: function (e) {
    this.setData({
      index2: Number(e.detail.value),
      index3: 0,
    })
    
    var lesson = this.data.classInfo[e.detail.value].lessonNumber;
    for(var i = 2 ; i <= lesson; i++){
      this.data.array3.push(i);
    }
    this.setData({array3: this.data.array3});
    wx.setStorageSync('classIndex',this.data.index2)
  },
  
  bindPicker3Change: function (e) {
    this.setData({
      index3: Number(e.detail.value)
    })
    wx.setStorageSync('lessonNumber',this.data.index3+1)
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.getClassList();
  },
  setStorage: function () {
    if(this.data.classes.length == 1 && this.data.classes[0] == '您此学期没有课程') return;
    if(this.data.index3 == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择课节',
        showCancel: false
      })
      return;
    }
    // wx.redirectTo({ url: '/pages/EntryGrade/EntryGrade' })
    wx.navigateTo({ url: '/pages/EntryGrade/EntryGrade' })
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateX(240).step();
    this.setData({
      animationData: animation.export()
    })
    setTimeout(function () {
      animation.translateX(0).step()
      this.setData({
        animationData: animation
      })
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  },
  // 获取班级列表
  getClassList: function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.date;
    // 学期
    var nSemester = this.data.index1;
    // 教师token
    var token = this.data.teacherToken; 
    var query1 = 'appid=web&nClassYear='+ year +'&nSemester='+nSemester+'&PageIndex=1&PageSize=50&timestamp='+stamp+'&token='+token;
    var query2 = 'appid=web&nClassYear='+ year +'&nSemester='+nSemester+'&PageIndex=1&PageSize=50&timestamp='+stamp+'&token='+token+'test';
    var sign = md51.md5(query2.toLowerCase()); 
    var query = query1 + '&sign=' + sign;

    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requestGet.requestGet('api/Class?'+ query,function(res){
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            if(resData.length == 0){
              that.setData({classes:['您此学期没有课程']});
              // return;
            }else{
              classList.classList(that.data.classes,resData,that);
              /* 
                that.data.classes = [];
                var classArr = [];
                // console.log(resData);
                for(var i = 0 ; i < resData.length; i++){
                  var cur = resData[i];
                  // var times = cur.sPrintTime.substr(0,9); //上课时间
                  var dotIndex = cur.sPrintTime.lastIndexOf(',');
                  var lineIndex = cur.sPrintTime.lastIndexOf('-');

                  if(dotIndex == -1){
                    var times = cur.sPrintTime.slice(0,lineIndex); //上课时间
                  }else{
                    var times = cur.sPrintTime.slice(dotIndex+1,lineIndex);//上课时间
                  }
                  
                  var kemu = cur.sDeptName.substr(2,3);  //学科
                  var sClassTypeName = cur.sClassTypeName;  //班级名称
                  var studentNumber = cur.studentNum; //学生数量
                  var lessonNumber = cur.nLesson; //课节数量
                  var grade = times +' '+ cur.sGrade + kemu;
                  var SectBegin = cur.SectBegin; //排序时间

                  // 判断寒暑
                  if(resData[i].sTimeQuanTumCode.indexOf('P') == 0){
                    if(resData[i].sTimeQuanTumCode.charAt(1) == '0'){
                      times = '零期' + times;
                      var grade = times +' '+ cur.sGrade + kemu;
                    }else if(resData[i].sTimeQuanTumCode.charAt(1) == '1'){
                      times = '一期' + times;
                      var grade =  times +' '+ cur.sGrade + kemu;
                    }else if(resData[i].sTimeQuanTumCode.charAt(1) == '2'){
                      times = '二期' + times;
                      var grade =  times +' '+ cur.sGrade + kemu;
                    }else if(resData[i].sTimeQuanTumCode.charAt(1) == '3'){
                      times = '三期' + times;
                      var grade =  times +' '+ cur.sGrade + kemu;
                    }
                  }else{
                    var grade = times +' '+ cur.sGrade + kemu;
                  }

                  classArr.push({
                    SectBegin: SectBegin,
                    grade: grade,
                    classCode: cur.sClassCode,
                    times: times,
                    kemu: kemu,
                    sClassTypeName: sClassTypeName,
                    studentNumber: studentNumber,
                    lessonNumber: lessonNumber
                  })
                }

                // 班级排序
               if(classArr[0].times.indexOf('期') != -1){
                  // 按‘期’排序
                  var newClassArr = sortClassAsQi.sortClassAsQi(classArr);
                  console.log(newClassArr)
                }else{
                  // 按‘星期’排序
                  var newClassArr = sortClassAsWeek.sortClassAsWeek(classArr);
                }
                
                for(var k in newClassArr){
                  that.data.classes.push(newClassArr[k].grade)
                }
                that.setData({classes:that.data.classes, classInfo:newClassArr})
                // wx.setStorageSync('studentSize',classArr.studentNumber)
                wx.setStorageSync('classInfo',newClassArr);
              */
              
              that.data.array3 = ['请选择']
              var lesson = that.data.classInfo[that.data.index2].lessonNumber;
              for(var i = 2 ; i <= lesson; i++){
                that.data.array3.push(i);
              }
              that.setData({array3: that.data.array3});
            }
          }
          setTimeout(function(){
            wx.hideLoading()
          },500)
        })
      }
    })
    

   
  }

})