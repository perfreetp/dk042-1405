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

export const getStationStatus = (
  stationOrder: number,
  currentStationIndex: number,
  boundStationIndex: number
): 'passed' | 'current' | 'future' | 'bound' | 'bound_passed' | 'bound_current' => {
  if (stationOrder === boundStationIndex) {
    if (stationOrder < currentStationIndex) return 'bound_passed'
    if (stationOrder === currentStationIndex) return 'bound_current'
    return 'bound'
  }
  if (stationOrder < currentStationIndex) return 'passed'
  if (stationOrder === currentStationIndex) return 'current'
  return 'future'
}

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
