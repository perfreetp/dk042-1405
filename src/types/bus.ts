export interface Station {
  id: string
  name: string
  order: number
  icon: string
  address: string
}

export interface BusRoute {
  id: string
  name: string
  schoolName: string
  stations: Station[]
}

export interface BusInfo {
  id: string
  plateNumber: string
  driverName: string
  teacherName: string
  teacherPhone: string
  capacity: number
  currentPassengers: number
}

export interface BusLocation {
  routeId: string
  busId: string
  currentStationIndex: number
  nextStationIndex: number
  progressPercent: number
  estimatedMinutes: number
  remainingStations: number
  lastUpdateTime: string
}

export interface Reminder {
  id: string
  type: 'light' | 'formal'
  title: string
  content: string
  stationName: string
  remainingStations: number
  busInfo?: {
    plateNumber: string
    teacherName: string
    pickupLocation: string
  }
  tips?: string[]
  createTime: string
  isRead: boolean
}

export interface HandoverRecord {
  id: string
  childId: string
  childName: string
  stationName: string
  busId: string
  teacherConfirmTime: string
  parentConfirmTime?: string
  status: 'pending' | 'teacher_confirmed' | 'parent_confirmed'
}

export interface ChildInfo {
  id: string
  name: string
  avatar: string
  grade: string
  className: string
  routeId: string
  boundStationId: string
  boundStationName: string
}

export interface AppState {
  childInfo: ChildInfo | null
  route: BusRoute | null
  busInfo: BusInfo | null
  busLocation: BusLocation | null
  reminders: Reminder[]
  handoverRecord: HandoverRecord | null
  isBound: boolean
}
