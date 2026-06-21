import React, { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import StationDot from '../StationDot'
import type { BusRoute, BusLocation, Station } from '@/types/bus'
import { getStationStatus } from '@/utils'

interface BusRouteProps {
  route: BusRoute
  busLocation: BusLocation
  boundStationId: string
  handoverStatus?: 'pending' | 'teacher_confirmed' | 'parent_confirmed' | null
}

const BusRouteComponent: React.FC<BusRouteProps> = ({ route, busLocation, boundStationId, handoverStatus }) => {
  const boundStationIndex = useMemo(() => {
    return route.stations.findIndex((s) => s.id === boundStationId)
  }, [route.stations, boundStationId])

  const stationsToShow = useMemo(() => {
    return route.stations.slice(0, boundStationIndex + 1)
  }, [route.stations, boundStationIndex])

  const progressPercent = useMemo(() => {
    if (stationsToShow.length <= 1) return 0
    const currentIdx = Math.min(busLocation.currentStationIndex, boundStationIndex)
    return (currentIdx / (stationsToShow.length - 1)) * 100
  }, [busLocation.currentStationIndex, boundStationIndex, stationsToShow.length])

  const busPosition = useMemo(() => {
    if (stationsToShow.length <= 1) return '0%'
    const currentIdx = Math.min(busLocation.currentStationIndex, boundStationIndex)
    if (currentIdx >= stationsToShow.length - 1) {
      return '90%'
    }
    const position = (currentIdx / (stationsToShow.length - 1)) * 85
    return `${position + 5}%`
  }, [busLocation.currentStationIndex, boundStationIndex, stationsToShow.length])

  const isArrived = handoverStatus === 'teacher_confirmed' || handoverStatus === 'parent_confirmed'

  const badgeText = useMemo(() => {
    if (handoverStatus === 'parent_confirmed') return '🏠 已到家'
    if (handoverStatus === 'teacher_confirmed') return '✅ 已到达'
    return '🚌 运行中'
  }, [handoverStatus])

  const showBus = busLocation.currentStationIndex < boundStationIndex

  return (
    <View className={styles.busRouteContainer}>
      <View className={styles.cloudDecoration + ' ' + styles.cloud1}>☁️</View>
      <View className={styles.cloudDecoration + ' ' + styles.cloud2}>☁️</View>

      <View className={styles.routeHeader}>
        <Text className={styles.routeTitle}>
          <Text className={styles.schoolName}>🏫 {route.schoolName}</Text>
          {route.name}
        </Text>
        <View className={classnames(styles.routeBadge, isArrived && styles.arrivedBadge)}>
          {badgeText}
        </View>
      </View>

      <View className={styles.stationsContainer}>
        <View className={styles.trackLine}></View>
        <View
          className={styles.progressLine}
          style={{ width: `${progressPercent}%` }}
        ></View>

        {showBus && (
          <View className={styles.busWrapper} style={{ left: busPosition }}>
            <Text className={styles.busSmoke}>💨</Text>
            <Text className={styles.busIcon}>🚌</Text>
          </View>
        )}

        <View className={styles.stationsRow}>
          {stationsToShow.map((station: Station) => (
            <StationDot
              key={station.id}
              station={station}
              status={getStationStatus(
                station.order,
                busLocation.currentStationIndex,
                boundStationIndex
              )}
              showHomeTag={station.id === boundStationId}
            />
          ))}
        </View>
      </View>

      {!isArrived ? (
        <View className={styles.infoCards}>
          <View className={styles.infoCard}>
            <Text className={styles.infoValue}>
              {busLocation.remainingStations}
              <Text className={styles.infoUnit}>站</Text>
            </Text>
            <Text className={styles.infoLabel}>还剩</Text>
          </View>
          <View className={classnames(styles.infoCard, styles.timeCard)}>
            <Text className={styles.infoValue}>
              {busLocation.estimatedMinutes}
              <Text className={styles.infoUnit}>分钟</Text>
            </Text>
            <Text className={styles.infoLabel}>大约到达</Text>
          </View>
        </View>
      ) : (
        <View className={styles.infoCards}>
          <View className={classnames(styles.infoCard, styles.arrivedCard)}>
            <Text className={styles.infoValue} style={{ fontSize: '32rpx' }}>
              ✅ 已到达
            </Text>
            <Text className={styles.infoLabel}>孩子已安全下车</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default BusRouteComponent
