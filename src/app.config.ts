export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/messages/index',
    'pages/mine/index',
    'pages/handover/index',
    'pages/binding/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFD43B',
    navigationBarTitleText: '校车小火车',
    navigationBarTextStyle: 'black',
    backgroundColor: '#E3F2FD'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#FFD43B',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '小火车'
      },
      {
        pagePath: 'pages/messages/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
