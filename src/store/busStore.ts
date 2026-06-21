import { create } from 'zustand'
import type { AppState, BusLocation, Reminder, HandoverRecord, ChildInfo, BusRoute, BusInfo } from '@/types/bus'
import { mockChildInfo, mockRoute, mockBusInfo, mockBusLocation, mockReminders, mockHandoverRecord } from '@/data/mockData'

interface BusStore extends AppState {
  setBound: (child: ChildInfo, route: BusRoute, bus: BusInfo) => void
  updateBusLocation: (location: BusLocation) => void
  addReminder: (reminder: Reminder) => void
  markReminderRead: (id: string) => void
  markAllRemindersRead: () => void
  setHandoverRecord: (record: HandoverRecord) => void
  confirmParentReceive: () => void
  simulateBusProgress: () => () => void
}

export const useBusStore = create<BusStore>((set, get) => ({
  childInfo: null,
  route: null,
  busInfo: null,
  busLocation: null,
  reminders: [],
  handoverRecord: null,
  isBound: false,

  setBound: (child, route, bus) => {
    console.log('[BusStore] 绑定线路', { child: child.name, route: route.name })
    set({
      childInfo: child,
      route,
      busInfo: bus,
      isBound: true,
      busLocation: mockBusLocation,
      reminders: mockReminders
    })
  },

  updateBusLocation: (location) => {
    console.log('[BusStore] 更新校车位置', { remainingStations: location.remainingStations })
    set({ busLocation: location })
  },

  addReminder: (reminder) => {
    console.log('[BusStore] 添加提醒', { type: reminder.type, title: reminder.title })
    set((state) => ({
      reminders: [reminder, ...state.reminders]
    }))
  },

  markReminderRead: (id) => {
    console.log('[BusStore] 标记提醒已读', { id })
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, isRead: true } : r
      )
    }))
  },

  markAllRemindersRead: () => {
    console.log('[BusStore] 标记所有提醒已读')
    set((state) => ({
      reminders: state.reminders.map((r) => ({ ...r, isRead: true }))
    }))
  },

  setHandoverRecord: (record) => {
    console.log('[BusStore] 设置交接记录', { childName: record.childName, status: record.status })
    set({ handoverRecord: record })
  },

  confirmParentReceive: () => {
    console.log('[BusStore] 家长确认接到孩子')
    set((state) => {
      if (!state.handoverRecord) return state
      return {
        handoverRecord: {
          ...state.handoverRecord,
          status: 'parent_confirmed',
          parentConfirmTime: new Date().toISOString()
        }
      }
    })
  },

  simulateBusProgress: () => {
    const { childInfo, route } = get()
    if (!childInfo || !route) return () => {}

    const boundStationIndex = route.stations.findIndex(
      (s) => s.id === childInfo.boundStationId
    )

    let currentIndex = 0
    let remaining = boundStationIndex

    const interval = setInterval(() => {
      if (remaining <= 0) {
        const { handoverRecord } = get()
        if (!handoverRecord) {
          set({ handoverRecord: mockHandoverRecord })
        }
        return
      }

      currentIndex++
      remaining = boundStationIndex - currentIndex

      const newLocation: BusLocation = {
        routeId: route.id,
        busId: 'bus_001',
        currentStationIndex: currentIndex,
        nextStationIndex: currentIndex + 1,
        progressPercent: ((currentIndex / boundStationIndex) * 100),
        estimatedMinutes: remaining * 4,
        remainingStations: remaining,
        lastUpdateTime: new Date().toISOString()
      }

      set({ busLocation: newLocation })

      if (remaining === 2) {
        const lightReminder: Reminder = {
          id: `light_${Date.now()}`,
          type: 'light',
          title: '还有2站就到啦！',
          content: `校车正在驶向${childInfo.boundStationName}，还有大约${remaining * 4}分钟到达`,
          stationName: childInfo.boundStationName,
          remainingStations: 2,
          tips: ['记得带外套🧥', '准备接送卡💳', '带上雨具☔'],
          createTime: new Date().toISOString(),
          isRead: false
        }
        get().addReminder(lightReminder)
      }

      if (remaining === 1) {
        const formalReminder: Reminder = {
          id: `formal_${Date.now()}`,
          type: 'formal',
          title: '校车即将到达！',
          content: `校车即将到达${childInfo.boundStationName}站，请做好接车准备`,
          stationName: childInfo.boundStationName,
          remainingStations: 1,
          busInfo: {
            plateNumber: '粤A·B1234',
            teacherName: '李老师',
            pickupLocation: `${childInfo.boundStationName}东门`
          },
          createTime: new Date().toISOString(),
          isRead: false
        }
        get().addReminder(formalReminder)
      }

      if (remaining === 0) {
        set({ handoverRecord: mockHandoverRecord })
        const arrivalReminder: Reminder = {
          id: `arrival_${Date.now()}`,
          type: 'formal',
          title: `${childInfo.name}已安全下车`,
          content: `${childInfo.name}已在${childInfo.boundStationName}站安全下车，由李老师确认交接`,
          stationName: childInfo.boundStationName,
          remainingStations: 0,
          createTime: new Date().toISOString(),
          isRead: false
        }
        get().addReminder(arrivalReminder)
      }
    }, 8000)

    return () => clearInterval(interval)
  }
}))
