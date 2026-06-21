import React, { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { BusRoute, BusLocation, Reminder } from '@/types/bus'
import {
  getStationStatus,
  getNextStationEta,
  getTotalArrivalMinutes,
  MINUTES_PER_STATION,
  formatTime
} from '@/utils'

interface TripTimelineProps {
  route: BusRoute
  busLocation: BusLocation
  boundStationId: string
  reminders: Reminder[]
  handoverStatus?: 'pending' | 'teacher_confirmed' | 'parent_confirmed' | null
  stationPassedTimes?: Record<number, string>
}

interface ReminderMarker {
  type: 'light' | 'formal' | 'arrival'
  label: string
}

const TripTimeline: React.FC<TripTimelineProps> = ({
  route,
  busLocation,
  boundStationId,
  reminders,
  handoverStatus,
  stationPassedTimes = {}
}) => {
  const boundStationIndex = useMemo(() => {
    return route.stations.findIndex((s) => s.id === boundStationId)
  }, [route.stations, boundStationId])

  const stationsToShow = useMemo(() => {
    if (boundStationIndex < 0) return route.stations
    return route.stations.slice(0, boundStationIndex + 1)
  }, [route.stations, boundStationIndex])

  const reminderMarkers = useMemo(() => {
    const map = new Map<number, ReminderMarker[]>()
    if (boundStationIndex < 0) return map

    const lightIndex = boundStationIndex - 2
    const formalIndex = boundStationIndex - 1

    const hasLight = reminders.some((r) => r.type === 'light')
    const hasFormal = reminders.some((r) => r.type === 'formal')
    const hasArrival = reminders.some((r) => r.type === 'arrival')

    if (lightIndex > 0) {
      map.set(lightIndex, [{
        type: 'light',
        label: hasLight ? '轻提醒已发送 ✓' : '轻提醒：准备外套/接送卡/雨具'
      }])
    }
    if (formalIndex > 0) {
      map.set(formalIndex, [{
        type: 'formal',
        label: hasFormal ? '正式提醒已发送 ✓' : '正式提醒：车牌/老师/接站口'
      }])
    }
    map.set(boundStationIndex, [{
      type: 'arrival',
      label: hasArrival ? '到站确认已发送 ✓' : '到站确认：照管员交接'
    }])
    return map
  }, [boundStationIndex, reminders])

  const isArrived = handoverStatus === 'teacher_confirmed' || handoverStatus === 'parent_confirmed'
  const totalArrivalMinutes = getTotalArrivalMinutes(busLocation, boundStationIndex)
  const remainingStations = Math.max(0, boundStationIndex - busLocation.currentStationIndex)

  const getStationBadge = (status: string): { text: string; cls: string } => {
    switch (status) {
      case 'passed':
        return { text: '已通过', cls: styles.passedBadge }
      case 'current':
        return { text: '当前所在', cls: styles.currentBadge }
      case 'bound_arrived':
        return { text: '已到站', cls: styles.arrivedBadge }
      default:
        return { text: '待到达', cls: styles.futureBadge }
    }
  }

  return (
    <View className={styles.timelineContainer}>
      <View className={styles.timelineHeader}>
        <Text className={styles.timelineTitle}>
          <Text className={styles.icon}>🛤️</Text>
          行程时间轴
        </Text>
        <View className={styles.timelineLegend}>
          <View className={styles.legendItem}>
            <View className={classnames(styles.dot, styles.passed)}></View>
            已过
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.dot, styles.current)}></View>
            当前
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.dot, styles.future)}></View>
            待达
          </View>
        </View>
      </View>

      {!isArrived && remainingStations > 0 && (
        <View className={styles.arrivalSummary}>
          <View className={styles.arrivalSummaryItem}>
            <Text className={styles.arrivalSummaryIcon}>🏠</Text>
            <View className={styles.arrivalSummaryText}>
              <Text className={styles.arrivalSummaryLabel}>整体到家时间</Text>
              <Text className={styles.arrivalSummaryValue}>
                约 {totalArrivalMinutes} 分钟（还剩 {remainingStations} 站）
              </Text>
            </View>
          </View>
          <View className={styles.arrivalSummaryItem}>
            <Text className={styles.arrivalSummaryIcon}>⏭️</Text>
            <View className={styles.arrivalSummaryText}>
              <Text className={styles.arrivalSummaryLabel}>下一站预计</Text>
              <Text className={styles.arrivalSummaryValue}>
                {MINUTES_PER_STATION} 分钟到达
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.timelineList}>
        <View className={styles.timelineLine}></View>

        {stationsToShow.map((station) => {
          const status = getStationStatus(
            station.order,
            busLocation.currentStationIndex,
            boundStationIndex
          )
          const isBound = station.id === boundStationId
          const isCurrent = status === 'current'
          const isPassed = status === 'passed'
          const isArrivedStation = status === 'bound_arrived'
          const badge = getStationBadge(status)
          const markers = reminderMarkers.get(station.order) || []
          const eta = getNextStationEta(station.order, busLocation)
          const passedTime = stationPassedTimes[station.order]

          return (
            <View key={station.id} className={styles.timelineItem}>
              <View className={styles.node}>
                {isCurrent && !isArrived && (
                  <Text className={styles.busIndicator}>🚌</Text>
                )}
                {isBound && <Text className={styles.homeFlag}>🏠</Text>}
                <View
                  className={classnames(
                    styles.nodeDot,
                    isPassed && styles.passed,
                    isCurrent && styles.current,
                    isArrivedStation && styles.boundArrived
                  )}
                >
                  <Text className={styles.nodeIcon}>{station.icon}</Text>
                </View>
              </View>

              <View className={styles.content}>
                <View className={styles.stationRow}>
                  <Text
                    className={classnames(
                      styles.stationName,
                      !isPassed && !isCurrent && !isArrivedStation && styles.muted,
                      isArrivedStation && styles.arrived
                    )}
                  >
                    {station.name}
                  </Text>
                  <View className={classnames(styles.statusBadge, badge.cls)}>
                    {badge.text}
                  </View>
                </View>

                {isCurrent && (
                  <Text className={styles.stationMeta}>
                    校车正在此站停靠
                  </Text>
                )}
                {isPassed && (
                  <Text className={styles.stationMeta}>
                    已安全通过 ✓
                    {passedTime && (
                      <Text className={styles.passedTime}> · 通过时间 {formatTime(passedTime)}</Text>
                    )}
                  </Text>
                )}
                {isArrivedStation && (
                  <Text className={styles.stationMeta}>
                    {childArrivedText(handoverStatus)}
                    {passedTime && (
                      <Text className={styles.passedTime}> · 到站时间 {formatTime(passedTime)}</Text>
                    )}
                  </Text>
                )}
                {!isPassed && !isCurrent && !isArrivedStation && isBound && (
                  <Text className={styles.stationMeta}>
                    下车站·还有 <Text className={styles.etaHighlight}>{remainingStations}</Text> 站
                  </Text>
                )}
                {!isPassed && !isCurrent && !isArrivedStation && !isBound && (
                  <Text className={styles.stationMeta}>待到达</Text>
                )}

                {eta && !isCurrent && (
                  <Text className={styles.stationAddress}>{eta}</Text>
                )}

                {markers.length > 0 && (
                  <View className={styles.reminderTags}>
                    {markers.map((m, idx) => (
                      <View
                        key={idx}
                        className={classnames(
                          styles.reminderTag,
                          m.type === 'light' && styles.lightTag,
                          m.type === 'formal' && styles.formalTag,
                          m.type === 'arrival' && styles.arrivedTag
                        )}
                      >
                        <Text className={styles.tagIcon}>
                          {m.type === 'light' ? '⏰' : m.type === 'formal' ? '🚍' : '✅'}
                        </Text>
                        {m.label}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

function childArrivedText(handoverStatus?: string): string {
  if (handoverStatus === 'parent_confirmed') return '孩子已安全下车，家长已确认接到 ✓'
  if (handoverStatus === 'teacher_confirmed') return '孩子已安全下车，等待家长确认'
  return '孩子已安全下车'
}

export default TripTimeline
