import dayjs from 'dayjs'
import type { Station, BusLocation, BusRoute } from '@/types/bus'

export const MINUTES_PER_STATION = 4

export const formatTime = (isoString: string): string => {
  return dayjs(isoString).format('HH:mm')
}

export const formatDateTime = (isoString: string): string => {
  return dayjs(isoString).format('MM-DD HH:mm')
}

export const formatDate = (isoString: string): string => {
  return dayjs(isoString).format('YYYY-MM-DD')
}

export const formatDateChinese = (isoString: string): string => {
  return dayjs(isoString).format('M月D日')
}

export const formatRelativeTime = (isoString: string): string => {
  const now = dayjs()
  const target = dayjs(isoString)
  const diffMinutes = now.diff(target, 'minute')

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}小时前`
  return `${Math.floor(diffMinutes / 1440)}天前`
}

export type StationStatus = 'passed' | 'current' | 'future' | 'bound_arrived'

export interface StationStatusInfo {
  status: StationStatus
  badge: string
  meta: string
  isBound: boolean
  isReached: boolean
}

export const getStationStatus = (
  stationOrder: number,
  currentStationIndex: number,
  boundStationIndex: number
): StationStatus => {
  const isBound = stationOrder === boundStationIndex
  const isReached = stationOrder <= currentStationIndex

  if (isBound && isReached) return 'bound_arrived'
  if (stationOrder < currentStationIndex) return 'passed'
  if (stationOrder === currentStationIndex) return 'current'
  return 'future'
}

export const getStationStatusInfo = (
  station: Station,
  currentStationIndex: number,
  boundStationIndex: number,
  busLocation: BusLocation
): StationStatusInfo => {
  const status = getStationStatus(station.order, currentStationIndex, boundStationIndex)
  const isBound = station.id !== undefined && boundStationIndex === station.order
  const remaining = Math.max(0, boundStationIndex - currentStationIndex)

  switch (status) {
    case 'passed':
      return {
        status,
        badge: '已通过',
        meta: '已安全通过 ✓',
        isBound,
        isReached: true
      }
    case 'current':
      return {
        status,
        badge: '当前所在',
        meta: '校车正在此站停靠',
        isBound,
        isReached: true
      }
    case 'bound_arrived':
      return {
        status,
        badge: '已到站',
        meta: '孩子已安全下车',
        isBound: true,
        isReached: true
      }
    case 'future':
    default:
      if (isBound) {
        return {
          status,
          badge: '下车站',
          meta: `下车站·还有 ${remaining} 站`,
          isBound: true,
          isReached: false
        }
      }
      return {
        status,
        badge: '待到达',
        meta: '待到达',
        isBound: false,
        isReached: false
      }
  }
}

export const getNextStationEta = (
  stationOrder: number,
  busLocation: BusLocation
): string | null => {
  const nextIndex = busLocation.currentStationIndex + 1
  if (stationOrder !== nextIndex) return null
  const eta = MINUTES_PER_STATION
  return `下一站预计 ${eta} 分钟到`
}

export const getTotalArrivalMinutes = (
  busLocation: BusLocation,
  boundStationIndex: number
): number => {
  const remaining = Math.max(0, boundStationIndex - busLocation.currentStationIndex)
  return remaining * MINUTES_PER_STATION
}

export const isLastStation = (
  busLocation: BusLocation,
  boundStationIndex: number
): boolean => {
  return busLocation.currentStationIndex >= boundStationIndex
}

export const getRouteStations = (route: BusRoute, boundStationId: string): Station[] => {
  const boundIndex = route.stations.findIndex(s => s.id === boundStationId)
  if (boundIndex < 0) return route.stations
  return route.stations.slice(0, boundIndex + 1)
}

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
