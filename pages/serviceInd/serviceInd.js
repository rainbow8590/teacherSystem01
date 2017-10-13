// pages/serviceInd/serviceInd.js
Page({
  data: {
    src: '../images/nav-logo.png', 
  },
  onShareAppMessage: function(){
     return {
      title: '转发给好友',
      path: '/pages/serviceInd/serviceInd'
    }
  },
})