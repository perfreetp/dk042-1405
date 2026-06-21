import dayjs from 'dayjs'

export const formatTime = (isoString: string): string => {
  return dayjs(isoString).format('HH:mm')
}

export const formatDateTime = (isoString: string): string => {
  return dayjs(isoString).format('MM-DD HH:mm')
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

export const getStationLabel = (
  status: StationStatus,
  station: { name: string },
  currentStationIndex: number,
  boundStationIndex: number,
  estimatedMinutes: number
): string => {
  switch (status) {
    case 'passed':
      return '已通过'
    case 'current':
      return '校车当前所在'
    case 'bound_arrived':
      return '已到达·下车站'
    case 'future':
      if (station.order === boundStationIndex) {
        return `下车站·还有 ${Math.max(0, boundStationIndex - currentStationIndex)} 站`
      }
      return '待到达'
  }
  return ''
}

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
