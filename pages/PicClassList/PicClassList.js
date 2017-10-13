var md51 = require('../../utils/md51.js');
var requestGet = require('../../utils/requestGet.js');
var classList = require('../../utils/classList.js');
var sortClassAsWeek = require('../../utils/sortClassAsWeek.js');
var sortClassAsQi = require('../../utils/sortClassAsQi.js');
Page({
  data: {
    showModalStatus: false,
    yearname: '2017',
    sjname: '秋季',
    teacherName: '',
    hidden: true,
    hidden2: true,
    hidden3: true,
    index1: 1,      //选择秋寒春暑
    keJieIndex: 7,  //课节序号
    classInfo:[],  //班级信息
    classes: [],  //班级名称列表
    kind: '0', //教师或助教
    items: [
      { value: 2017, yearname: '2017', checked: 'true' },
      { value: 2016, yearname: '2016' }
    ],
    items2: [
      { value: 1, sjname: '秋季' , checked: 'true' },
      { value: 2, sjname: '寒假' },
      { value: 3, sjname: '春季' },
      { value: 4, sjname: ' 暑假'}
    ],
    items3: [
      { value: 7, name: '至第7讲'},
      { value: 10, name: '至第10讲' },
      { value: 12, name: '至第12讲' },
      { value: 15, name: '至第15讲' }
    ],
    kindShow: false
  },
  onLoad: function(){
    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      kind: wx.getStorageSync('kind'),
      // classInfo: wx.getStorageSync('classInfo'),
      // lessonIndex: Number(wx.getStorageSync('lessonNumber'))+1,
      // classIndex: wx.getStorageSync('classIndex')
    });
    console.log(this.data.teacherToken)
    console.log( this.data.teacherName)
    if(this.data.kind == '1'){
      this.setData({kindShow:false});
      return;
    }else{
      this.setData({kindShow:true});
    };
    (function(){
      that.getClass();
    })()
  },
  // onShow: function(){
  //   var that = this;
  //   (function(){
  //     that.getClass();
  //   })()
  // },
  // onShareAppMessage: function () {
  //   var that = this
  //   return {
  //     title: '转发给好友',
  //     path: '/pages/ClassCode/ClassCode?id=123',
  //     success: function(res) {
  //       // that.getUrl()
  //       console.log(res)
  //       // var shareTickets = res.shareTickets;
  //       // if(shareTickets.length == 0) {
  //       //   return false;
  //       // }
  //       // wx.getShareInfo({
  //       //     shareTicket: shareTickets[0];
  //       //     success: function(res){
  //       //         var encryptedData = res.encryptedData;
  //       //         var iv = res.iv;
  //       //     }
  //       // })
  //     },
  //     fail: function(res) {
  //       // 转发失败
  //       console.log(res)
  //     }
  //   }
  // },
  onShareAppMessage: function(){
     return {
      title: '转发给好友',
      path: '/pages/PicClassList/PicClassList'
    }
  },
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    var items = this.data.items;
    for (var i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value == e.detail.value
    }
    this.setData({
      items: items,
      yearname: e.detail.value
    });
    this.getClass();
  },
  radioChange2: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    var items2 = this.data.items2;
    for (var i = 0, len = items2.length; i < len; ++i) {
      items2[i].checked = items2[i].value == Number(e.detail.value)
    }
    this.setData({
      items2: items2,
      sjname: items2[e.detail.value-1].sjname,
      index1: Number(e.detail.value)
    });
    this.getClass();
  },
  radioChange3: function(e){
    //获取选取的课节的value值并缓存
    this.setData({
      keJieIndex: Number(e.detail.value)
    });
    wx.setStorageSync('keJieIndex',this.data.keJieIndex);
    // 跳转页面
    wx.navigateTo({url: '/pages/ClassCode/ClassCode'})
  },
  //季节 开
  modelpop: function (e) {
    this.setData({
      hidden: false
    })
  },
  //季节 关
  cancel: function (e) {
    this.setData({ hidden: true })
  },
  modelpop2: function (e) {
    this.setData({hidden2: false})
  },
  cancel2: function (e) {
    this.setData({ hidden2: true })
  },
  select: function (e) {
    console.log(e)
    // 获取点击的是第几个班级 并缓存 
    var idN = Number(e.target.dataset.id)
    wx.setStorageSync('tapClassId',idN);
    var items3 = [
      { value: 7, name: '至第7讲'},
      { value: 10, name: '至第10讲' },
      { value: 12, name: '至第12讲' },
      { value: 15, name: '至第15讲' }
    ];

    this.setData({ hidden3: false, items3: items3 })
  },
  cancel3: function (e) {
    this.setData({ hidden3: true })
  },
  // 获取老师的班级信息
  getClass: function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.yearname;
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
          console.log(res)
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            if(resData.length == 0){
              that.setData({classes:['您此学期没有课程']});
              // return;
            }else{
              // classList.classList(that.data.classes,resData,that);
              // console.log(that.data.classInfo)
              that.data.classes = [];
                var classArr = [];
                for(var i = 0 ; i < resData.length; i++){
                  var cur = resData[i];
                  // var times = cur.sPrintTime.substr(0,9); //上课时间

                  var dotIndex = cur.sPrintTime.lastIndexOf(',');
                  var lineIndex = cur.sPrintTime.lastIndexOf('-');

                  if(dotIndex == -1){
                    var times = cur.sPrintTime.slice(0,lineIndex); //上课时间
                  }else{
                    var times = cur.sPrintTime.slice(dotIndex+1,lineIndex);
                  }

                  var kemu = cur.sDeptName.substr(2,3);  //学科
                  var sClassTypeName = cur.sClassTypeName;  //班级名称
                  var studentNumber = cur.studentNum; //学生数量
                  var lessonNumber = cur.nLesson; //课节数量
                  var grade = times +' '+ cur.sGrade + kemu;
                  var SectBegin = cur.SectBegin; //排序时间
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
                // 给班级排序           
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
                wx.setStorageSync('studentSize',newClassArr.studentNumber)
                wx.setStorageSync('classInfo',newClassArr);
            }
          }
          setTimeout(function(){
            wx.hideLoading()
          },500)
        })
      }
    })
  },

})