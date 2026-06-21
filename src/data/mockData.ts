import type { BusRoute, BusInfo, BusLocation, Reminder, HandoverRecord, ChildInfo } from '@/types/bus'

export const mockRoute: BusRoute = {
  id: 'route_001',
  name: '阳光专线1号线',
  schoolName: '阳光实验小学',
  stations: [
    { id: 's0', name: '阳光小学', order: 0, icon: '🏫', address: '阳光路1号' },
    { id: 's1', name: '幸福花园', order: 1, icon: '🌸', address: '幸福路88号' },
    { id: 's2', name: '翠湖小区', order: 2, icon: '🌳', address: '翠湖路12号' },
    { id: 's3', name: '彩虹家园', order: 3, icon: '🌈', address: '彩虹路56号' },
    { id: 's4', name: '梦想小镇', order: 4, icon: '⭐', address: '梦想路99号' },
    { id: 's5', name: '快乐驿站', order: 5, icon: '🎈', address: '快乐路23号' },
    { id: 's6', name: '温馨港湾', order: 6, icon: '🏠', address: '温馨路45号' }
  ]
}

export const mockBusInfo: BusInfo = {
  id: 'bus_001',
  plateNumber: '粤A·B1234',
  driverName: '张师傅',
  teacherName: '李老师',
  teacherPhone: '138****1234',
  capacity: 45,
  currentPassengers: 38
}

export const mockBusLocation: BusLocation = {
  routeId: 'route_001',
  busId: 'bus_001',
  currentStationIndex: 1,
  nextStationIndex: 2,
  progressPercent: 35,
  estimatedMinutes: 12,
  remainingStations: 3,
  lastUpdateTime: new Date().toISOString()
}

export const mockChildInfo: ChildInfo = {
  id: 'child_001',
  name: '小明',
  avatar: 'https://picsum.photos/id/64/200/200',
  grade: '一年级',
  className: '一班',
  routeId: 'route_001',
  boundStationId: 's4',
  boundStationName: '梦想小镇'
}

export const mockReminders: Reminder[] = [
  {
    id: 'r001',
    type: 'formal',
    title: '校车即将到达！',
    content: '校车即将到达梦想小镇站，请做好接车准备',
    stationName: '梦想小镇',
    remainingStations: 1,
    busInfo: {
      plateNumber: '粤A·B1234',
      teacherName: '李老师',
      pickupLocation: '梦想小镇东门'
    },
    createTime: new Date(Date.now() - 60000).toISOString(),
    isRead: false
  },
  {
    id: 'r002',
    type: 'light',
    title: '还有2站就到啦！',
    content: '校车正在驶向梦想小镇，还有大约8分钟到达',
    stationName: '梦想小镇',
    remainingStations: 2,
    tips: ['记得带外套🧥', '准备接送卡💳', '带上雨具☔'],
    createTime: new Date(Date.now() - 300000).toISOString(),
    isRead: true
  },
  {
    id: 'r003',
    type: 'formal',
    title: '小明已安全下车',
    content: '小明已在梦想小镇站安全下车，由李老师确认交接',
    stationName: '梦想小镇',
    remainingStations: 0,
    createTime: new Date(Date.now() - 3600000).toISOString(),
    isRead: true
  }
]

export const mockHandoverRecord: HandoverRecord = {
  id: 'h001',
  childId: 'child_001',
  childName: '小明',
  stationName: '梦想小镇',
  busId: 'bus_001',
  teacherConfirmTime: new Date(Date.now() - 120000).toISOString(),
  status: 'teacher_confirmed'
}

export const mockRoutesList: BusRoute[] = [
  mockRoute,
  {
    id: 'route_002',
    name: '阳光专线2号线',
    schoolName: '阳光实验小学',
    stations: [
      { id: 's0', name: '阳光小学', order: 0, icon: '🏫', address: '阳光路1号' },
      { id: 's1', name: '金色年华', order: 1, icon: '🌻', address: '金色路66号' },
      { id: 's2', name: '明月湾', order: 2, icon: '🌙', address: '明月路33号' },
      { id: 's3', name: '星河湾', order: 3, icon: '✨', address: '星河路77号' }
    ]
  }
]
