// var md5 = require('../../utils/md5.js');//不含中文的字符串加密
var md51 = require('../../utils/md51.js'); //含中文的字符串加密
var requestGet = require('../../utils/requestGet.js'); //get请求
var requestPost = require('../../utils/requestPost.js'); //get请求
Page({
  data: {
    schoollist: [],
    setSchoolList:[],
    AllSchool:[],
    selectSchoolList:[],
    headList: [],
    array1:['是','否','不清楚','无分班',' '],
    itemid: 0,
    showModalStatus: false,
    name: "大好季节",
    hidden: true,
    hiddentext: false,
    curid: 0,
    selectPerson: true,
    othername:'其它',
    writeSchool:'输入所在学校名称',
    teacherName: '',
    teacherToken:'',
    studentSize: 0,
    nXueBu: 1,
    sName: null,
    classInfo: [], //班级信息
    classIndex: 0, //选择的班级的索引号
    isShow: false, //控制实验班是否显示
    value1: ''
  },
  onLoad: function(){
    // 获取并设置老师名称和token值
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      // studentSize: wx.getStorageSync('studentSize'),
      classInfo: wx.getStorageSync('classInfo'),
      classIndex: wx.getStorageSync('classIndex')
    })
    this.headData();
    this.getAllSchool();
    this.getAllStudent();
  },
  onShareAppMessage: function(){
     return {
      title: '转发给好友',
      path: '/pages/CollectSchool/CollectSchool'
    }
  },
  // 设置head数据
  headData: function(){
    var info = this.data.classInfo[this.data.classIndex]
    this.data.headList.push(info.kemu + ' '+ info.classCode);
    this.data.headList.push(info.times);
    this.data.headList.push(info.sClassTypeName);
    this.setData({headList:this.data.headList});

  },
  schoolbtn:function(e){
    this.setData({
      schoolbtn: e.detail.value
    })
  },
  openSchool: function() {
    var that = this;
    that.setData({
      showView: true,
    })
  },
  schoolChange: function (e) {
    // console.log(e)
    // this.data.curid = e.target.dataset.curid;
    // this.getAllSchool();
  },  
  bindPickerChange: function (e) {
    var curindex = Number(e.target.dataset.current);
    this.data.schoollist[curindex].index1 = Number(e.detail.value);
    this.data.schoollist[curindex].sExperimentalType = this.data.array1[Number(e.detail.value)];
    this.setData({
      schoollist: this.data.schoollist
    })

  },
  bindPicker2Change: function (e) {
    var curindex = e.target.dataset.current;
    this.data.schoollist[curindex].index2 = e.detail.value;
    this.setData({
      schoollist: this.data.schoollist
    })
  },
  modelpop: function (e) {
    // console.log("弹出框", e.currentTarget.dataset)
    var that = this;
    // console.log(e.target.dataset)
    that.setData({
      hidden: false,
      modelNumber: e.currentTarget.dataset.number,
      itemid: e.currentTarget.dataset.id,
      curid:e.target.dataset.curid
    })
  },
  cancel: function (e) {
    console.log(e.target.dataset)
    // console.log(e)
    //console.log("弹出框", this.data.itemid);
    this.setData({
      showView: false
    })
    var itemid = this.data.itemid;
    var schoollist = this.data.schoollist;
    // console.log(this.data.curid)
    schoollist[this.data.curid]['sSchoolName'] = '['+e.target.dataset.schooldistrict+ '] ' + e.target.dataset.schoolname;
    schoollist[this.data.curid]['schoolDistrict'] = e.target.dataset.schooldistrict;
    schoollist[this.data.curid]['schoolId'] = e.target.dataset.schoolid;
       console.log(schoollist[this.data.curid])
    // schoollist.forEach(function (value, index, array) {
    //   if (index == itemid){
    //     array[index]['value'] = '['+e.target.dataset.schooldistrict+ '] ' + e.target.dataset.schoolname;
    //     array[index]['schoolDistrict'] = e.target.dataset.schooldistrict;
    //     array[index]['schoolId'] = e.target.dataset.schoolid;
    //   }
    // });
    this.setData({
      schoollist: schoollist
    })
    this.setData({ hidden: true })
    console.log(this.data.schoollist)
  },
  otherschool: function(e){
    this.setData({value: e.detail.value});
    
  },
  othercancel: function(e){
    this.setData({
      showView: false,
      hidden: true
    })
     var that = this;
     var itemid = this.data.itemid;
     var schoollist = this.data.schoollist;
     schoollist[this.data.curid]['sSchoolName'] = that.data.value;
     schoollist[this.data.curid]['schoolDistrict'] = '北京';
     schoollist[this.data.curid]['schoolId'] = 0;

    //  schoollist.forEach(function (value, index, array) {
    //   if (index == itemid){
    //     array[index]['value'] = that.data.value;
    //   }
    // });
     this.setData({
      schoollist: schoollist
    });
     this.setData({value: ''})
    
  },
  // 获取学生列表
  getAllStudent: function(){
    // 设置schoollist的值
    var that = this;
    var token = this.data.teacherToken; // token值
    var nxuebu = this.data.nXueBu;   //学部信息
    var stamp = new Date().getTime();  //时间戳
    var studentSize = this.data.classInfo[this.data.classIndex].studentNumber;
    var ClassCode = this.data.classInfo[this.data.classIndex].classCode;
    var query1 = 'appid=web&PageIndex=1&PageSize='+studentSize+'&sClassCode='+ClassCode+'&timestamp='+stamp+'&token='+token;
    var query2 = 'appid=web&pageindex=1&pagesize='+studentSize+'&sclasscode='+ClassCode+'&timestamp='+stamp+'&token='+token+'test';
    var sign = md51.md5(query2); 
    var query = query1 + '&sign=' + sign;

    wx.showLoading({
      title:'努力加载中',
      success: function(){
        requestGet.requestGet('api/Record?'+ query,function(res){
          // console.log(res.data)
          var resData = res.data;
          if(resData.ResultType == 0){
            var studentInfos = resData.AppendData;
            if(studentInfos[0].nXueBu == 1){
               that.setData({isShow:false})
              for(var i = 0 ; i < studentInfos.length; i++){
                var student = studentInfos[i]
                that.data.schoollist.push({
                  index1:that.data.array1.indexOf(student.sExperimentalType==null? ' ':student.sExperimentalType),
                  sName: student.sStudentName, 
                  sStudentCode: student.sStudentCode, 
                  nXueBu: student.nXueBu, 
                  sExperimentalType: student.sExperimentalType,
                  sSchoolName: student.sSchoolName==null?'':'['+student.sDistrict+']'+student.sSchoolName,
                  schoolDistrict:student.sDistrict,
                  schoolId:student.nSchoolID
                })
              }
              that.setData({schoollist:that.data.schoollist})
            }else if(studentInfos[0].nXueBu == 2 || studentInfos[0].nXueBu == 3){
              that.setData({isShow:true})
              for(var i = 0 ; i < studentInfos.length; i++){
                var student = studentInfos[i]
                that.data.schoollist.push({
                  index1:that.data.array1.indexOf(student.sExperimentalType==null? ' ':student.sExperimentalType),
                  sName: student.sStudentName, 
                  sStudentCode: student.sStudentCode, 
                  nXueBu: student.nXueBu, 
                  sExperimentalType: student.sExperimentalType,
                  sSchoolName: student.sSchoolName==null?'':'['+student.sDistrict+']'+student.sSchoolName,
                  schoolDistrict:student.sDistrict,
                  schoolId:student.nSchoolID
                })
              }
              that.setData({schoollist:that.data.schoollist})
              // console.log(that.data.schoollist)
            }
          }
          setTimeout(function(){
            wx.hideLoading()
          },500)
        })
        
      }
    })

    

    
  },
  // 获取全部学校列表
  getAllSchool: function(){
    // 设置setSchoolList的值
    var that = this;
    var token = this.data.teacherToken; // token值
    var nxuebu = this.data.nXueBu;   //学部信息
    var stamp = new Date().getTime();  //时间戳
    var sName = this.data.sName;

    var query1 = 'appid=web&nXueBu='+nxuebu+'&timestamp='+ stamp +'&token='+token;
    var query2 = 'appid=web&nXueBu='+nxuebu+'&timestamp='+ stamp +'&token='+token+'test';

    var sign = md51.md5(query2.toLowerCase()); 
    var query = query1 + '&sign='+sign;

    requestGet.requestGet('api/School?'+ query,function(res){
      var resData = res.data;
      that.data.AllSchool=[];
      // console.log(resData)
      if(resData.ResultType == 0){
        var schoolInfos = resData.AppendData;
        
        for(var i = 0 ; i < schoolInfos.length; i++){
          var school = schoolInfos[i]
          that.data.setSchoolList.push({
            schoolDistrict:school.sDistrict,
            schoolName:school.sName,
            schoolId:school.ID
          })
        }
        that.setData({
          setSchoolList: that.data.setSchoolList,
          AllSchool: that.data.setSchoolList
        })
        // console.log(that.data.AllSchool)
      }
    })

  },
  // 储存学生信息
  saveStudent: function(e){
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
    console.log(arr)
    for(var i = 0 ; i < arr.length; i+=6){
      arr1.push({
        "sStudentCode": arr[i].substr(arr[i].indexOf('=')+1),
        "sDistrict": arr[i+1].substr(arr[i+1].indexOf('=')+1),
        "sExperimentalType": arr[i+2].substr(arr[i+2].indexOf('=')+1) == "" ? null : arr[i+2].substr(arr[i+2].indexOf('=')+1),
        "nSchoolID": Number(arr[i+3].substr(arr[i+3].indexOf('=')+1)),
        "nXueBu": Number(arr[i+4].substr(arr[i+4].indexOf('=')+1)),
        "sSchoolName": arr[i+5].substr(arr[i+5].indexOf('=')+1),
      })
    }

    console.log(arr1)
    // console.log('保存成功')

    var strDatas = JSON.stringify(arr1);
    var query1 = 'appid=web&timestamp='+stamp+'&token='+token;
    var query2 = query1+'&'+strDatas+'test';
    var sign = md51.md5(query2);
    var query = query1 + '&sign=' + sign;

    wx.showLoading({
      title:'保存中',
      success: function(){
        requestPost.requestPost('api/Record?'+ query,arr1,function(res){
          var resData = res.data;
          var resD = JSON.parse(res.data)
          console.log(resD)
          if(resD.ResultType == 0){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
            setTimeout(function(){
              // wx.redirectTo({ url: '/pages/SchoolCollection/SchoolCollection'})
              wx.navigateBack({ delta: 1 })
            },1000)
          }
          setTimeout(function(){
            wx.hideLoading()
          },500)

        })
      }
    })
    

  },
  selectName: function(e){
    var allSchool = this.data.AllSchool;
    var len = allSchool.length;
    var values = e.detail.value;
    this.setData({
      value1: e.detail.value
    })
    this.data.selectSchoolList = [];

    if(values.length != 0){
      for(var i = 0 ; i <len; i++){
        var school = allSchool[i];
        if(school.schoolName.indexOf(values) != -1){
          this.data.selectSchoolList.push(school)
        }
      }
      this.setData({setSchoolList:this.data.selectSchoolList})
    }else{
      this.setData({setSchoolList:this.data.AllSchool})
    }
  },
  // 点击灰色区域隐藏modal
  hideModel: function(e){
    console.log(e)
    if(e.target.id == e.currentTarget.id ){
      this.setData({
        hidden: true,
        value1:'',
        setSchoolList:this.data.AllSchool
      })
    }else if(e.target.id =="hideS" && e.currentTarget.id == "hideM"){
      this.setData({
        hidden: true,
        value1:'',
        setSchoolList:this.data.AllSchool
      })
    }else if(e.target.id =="searchotherbtn" && e.currentTarget.id == "hideM"){
      this.setData({
        hidden: true,
        value1: '',
        setSchoolList:this.data.AllSchool
      })
    }else{
      this.setData({
        hidden: false
      })
    }
  }

})