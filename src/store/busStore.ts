import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { AppState, BusLocation, Reminder, HandoverRecord, ChildInfo, BusRoute, BusInfo } from '@/types/bus'
import { generateId } from '@/utils'

const STORAGE_KEY = 'school_bus_app_state_v1'

interface PersistState {
  childInfo: ChildInfo | null
  route: BusRoute | null
  busInfo: BusInfo | null
  busLocation: BusLocation | null
  reminders: Reminder[]
  handoverRecord: HandoverRecord | null
  isBound: boolean
  triggeredReminders: string[]
}

interface BusStore extends AppState {
  triggeredReminders: string[]
  setBound: (child: ChildInfo, route: BusRoute, bus: BusInfo) => void
  updateBusLocation: (location: BusLocation) => void
  addReminder: (reminder: Reminder) => void
  markReminderRead: (id: string) => void
  markAllRemindersRead: () => void
  setHandoverRecord: (record: HandoverRecord) => void
  confirmParentReceive: () => void
  simulateBusProgress: () => () => void
  resetAll: () => void
}

const loadFromStorage = (): Partial<PersistState> => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      console.log('[BusStore] 从本地存储恢复数据', { isBound: parsed.isBound })
      return parsed
    }
  } catch (e) {
    console.error('[BusStore] 读取本地存储失败', e)
  }
  return {}
}

const saveToStorage = (state: BusStore) => {
  try {
    const toSave: PersistState = {
      childInfo: state.childInfo,
      route: state.route,
      busInfo: state.busInfo,
      busLocation: state.busLocation,
      reminders: state.reminders,
      handoverRecord: state.handoverRecord,
      isBound: state.isBound,
      triggeredReminders: state.triggeredReminders
    }
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.error('[BusStore] 写入本地存储失败', e)
  }
}

const persisted = loadFromStorage()

export const useBusStore = create<BusStore>((set, get) => ({
  childInfo: persisted.childInfo ?? null,
  route: persisted.route ?? null,
  busInfo: persisted.busInfo ?? null,
  busLocation: persisted.busLocation ?? null,
  reminders: persisted.reminders ?? [],
  handoverRecord: persisted.handoverRecord ?? null,
  isBound: persisted.isBound ?? false,
  triggeredReminders: persisted.triggeredReminders ?? [],

  setBound: (child, route, bus) => {
    console.log('[BusStore] 绑定线路', { child: child.name, route: route.name })
    const initialLocation: BusLocation = {
      routeId: route.id,
      busId: bus.id,
      currentStationIndex: 0,
      nextStationIndex: 1,
      progressPercent: 0,
      estimatedMinutes: route.stations.findIndex(s => s.id === child.boundStationId) * 4,
      remainingStations: route.stations.findIndex(s => s.id === child.boundStationId),
      lastUpdateTime: new Date().toISOString()
    }

    const newState = {
      childInfo: child,
      route,
      busInfo: bus,
      isBound: true,
      busLocation: initialLocation,
      reminders: [],
      handoverRecord: null,
      triggeredReminders: []
    }
    set(newState)
    saveToStorage({ ...get(), ...newState })
  },

  updateBusLocation: (location) => {
    console.log('[BusStore] 更新校车位置', { remainingStations: location.remainingStations })
    set({ busLocation: location })
    saveToStorage({ ...get(), busLocation: location })
  },

  addReminder: (reminder) => {
    const triggerKey = `${reminder.type}_${reminder.remainingStations}`
    if (get().triggeredReminders.includes(triggerKey)) {
      console.log('[BusStore] 跳过重复提醒', { triggerKey })
      return
    }

    console.log('[BusStore] 添加提醒', { type: reminder.type, title: reminder.title })
    set((state) => ({
      reminders: [reminder, ...state.reminders],
      triggeredReminders: [...state.triggeredReminders, triggerKey]
    }))
    saveToStorage({
      ...get(),
      reminders: [reminder, ...get().reminders],
      triggeredReminders: [...get().triggeredReminders, triggerKey]
    })
  },

  markReminderRead: (id) => {
    console.log('[BusStore] 标记提醒已读', { id })
    const newReminders = get().reminders.map((r) =>
      r.id === id ? { ...r, isRead: true } : r
    )
    set({ reminders: newReminders })
    saveToStorage({ ...get(), reminders: newReminders })
  },

  markAllRemindersRead: () => {
    console.log('[BusStore] 标记所有提醒已读')
    const newReminders = get().reminders.map((r) => ({ ...r, isRead: true }))
    set({ reminders: newReminders })
    saveToStorage({ ...get(), reminders: newReminders })
  },

  setHandoverRecord: (record) => {
    console.log('[BusStore] 设置交接记录', { childName: record.childName, status: record.status })
    set({ handoverRecord: record })
    saveToStorage({ ...get(), handoverRecord: record })
  },

  confirmParentReceive: () => {
    console.log('[BusStore] 家长确认接到孩子')
    const state = get()
    if (!state.handoverRecord) return

    const newHandover: HandoverRecord = {
      ...state.handoverRecord,
      status: 'parent_confirmed',
      parentConfirmTime: new Date().toISOString()
    }

    const newReminders = state.reminders.map(r =>
      r.remainingStations === 0 ? { ...r, isRead: true } : r
    )

    set({
      handoverRecord: newHandover,
      reminders: newReminders
    })
    saveToStorage({
      ...get(),
      handoverRecord: newHandover,
      reminders: newReminders
    })
  },

  resetAll: () => {
    console.log('[BusStore] 重置所有数据')
    set({
      childInfo: null,
      route: null,
      busInfo: null,
      busLocation: null,
      reminders: [],
      handoverRecord: null,
      isBound: false,
      triggeredReminders: []
    })
    try { Taro.removeStorageSync(STORAGE_KEY) } catch (e) {}
  },

  simulateBusProgress: () => {
    const state = get()
    const { childInfo, route, busLocation, handoverRecord } = state

    if (!childInfo || !route) return () => {}

    const boundStationIndex = route.stations.findIndex(
      (s) => s.id === childInfo.boundStationId
    )

    if (boundStationIndex <= 0) return () => {}

    if (handoverRecord && handoverRecord.status !== 'pending') {
      console.log('[BusStore] 交接已完成，跳过模拟')
      return () => {}
    }

    let currentIndex = busLocation?.currentStationIndex ?? 0
    let remaining = boundStationIndex - currentIndex

    if (remaining <= 0) {
      console.log('[BusStore] 已到或超过终点，设置交接记录')
      if (!get().handoverRecord) {
        const record: HandoverRecord = {
          id: `ho_${generateId()}`,
          childId: childInfo.id,
          childName: childInfo.name,
          stationName: childInfo.boundStationName,
          busId: route.id,
          teacherConfirmTime: new Date().toISOString(),
          status: 'teacher_confirmed'
        }
        get().setHandoverRecord(record)

        const triggerKey = 'formal_0'
        if (!get().triggeredReminders.includes(triggerKey)) {
          const arrivalReminder: Reminder = {
            id: `arrival_${generateId()}`,
            type: 'formal',
            title: `${childInfo.name}已安全下车`,
            content: `${childInfo.name}已在${childInfo.boundStationName}站安全下车，由李老师确认交接`,
            stationName: childInfo.boundStationName,
            remainingStations: 0,
            createTime: new Date().toISOString(),
            isRead: false
          }
          set((s) => ({
            reminders: [arrivalReminder, ...s.reminders],
            triggeredReminders: [...s.triggeredReminders, triggerKey]
          }))
          saveToStorage({
            ...get(),
            reminders: [arrivalReminder, ...get().reminders]
          })
        }
      }
      return () => {}
    }

    console.log('[BusStore] 开始模拟校车进度', { currentIndex, remaining })

    const interval = setInterval(() => {
      const currentState = get()
      if (currentState.handoverRecord && currentState.handoverRecord.status !== 'pending') {
        clearInterval(interval)
        return
      }

      if (remaining <= 0) {
        if (!get().handoverRecord) {
          const record: HandoverRecord = {
            id: `ho_${generateId()}`,
            childId: childInfo.id,
            childName: childInfo.name,
            stationName: childInfo.boundStationName,
            busId: route.id,
            teacherConfirmTime: new Date().toISOString(),
            status: 'teacher_confirmed'
          }
          get().setHandoverRecord(record)

          const triggerKey = 'formal_0'
          if (!get().triggeredReminders.includes(triggerKey)) {
            const arrivalReminder: Reminder = {
              id: `arrival_${generateId()}`,
              type: 'formal',
              title: `${childInfo.name}已安全下车`,
              content: `${childInfo.name}已在${childInfo.boundStationName}站安全下车，由李老师确认交接`,
              stationName: childInfo.boundStationName,
              remainingStations: 0,
              createTime: new Date().toISOString(),
              isRead: false
            }
            set((s) => ({
              reminders: [arrivalReminder, ...s.reminders],
              triggeredReminders: [...s.triggeredReminders, triggerKey]
            }))
            saveToStorage({
              ...get(),
              reminders: [arrivalReminder, ...get().reminders]
            })
          }
        }
        clearInterval(interval)
        return
      }

      currentIndex++
      remaining = boundStationIndex - currentIndex

      const newLocation: BusLocation = {
        routeId: route.id,
        busId: currentState.busInfo?.id || 'bus_001',
        currentStationIndex: currentIndex,
        nextStationIndex: currentIndex + 1,
        progressPercent: (currentIndex / boundStationIndex) * 100,
        estimatedMinutes: Math.max(0, remaining * 4),
        remainingStations: Math.max(0, remaining),
        lastUpdateTime: new Date().toISOString()
      }

      get().updateBusLocation(newLocation)

      if (remaining === 2) {
        const lightReminder: Reminder = {
          id: `light_${generateId()}`,
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
          id: `formal_${generateId()}`,
          type: 'formal',
          title: '校车即将到达！',
          content: `校车即将到达${childInfo.boundStationName}站，请做好接车准备`,
          stationName: childInfo.boundStationName,
          remainingStations: 1,
          busInfo: {
            plateNumber: currentState.busInfo?.plateNumber || '粤A·B1234',
            teacherName: currentState.busInfo?.teacherName || '李老师',
            pickupLocation: `${childInfo.boundStationName}东门`
          },
          createTime: new Date().toISOString(),
          isRead: false
        }
        get().addReminder(formalReminder)
      }
    }, 5000)

    return () => clearInterval(interval)
  }
}))
