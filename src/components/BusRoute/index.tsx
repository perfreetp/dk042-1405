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
}

const BusRouteComponent: React.FC<BusRouteProps> = ({ route, busLocation, boundStationId }) => {
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

  return (
    <View className={styles.busRouteContainer}>
      <View className={styles.cloudDecoration + ' ' + styles.cloud1}>☁️</View>
      <View className={styles.cloudDecoration + ' ' + styles.cloud2}>☁️</View>

      <View className={styles.routeHeader}>
        <Text className={styles.routeTitle}>
          <Text className={styles.schoolName}>🏫 {route.schoolName}</Text>
          {route.name}
        </Text>
        <View className={styles.routeBadge}>🚌 运行中</View>
      </View>

      <View className={styles.stationsContainer}>
        <View className={styles.trackLine}></View>
        <View
          className={styles.progressLine}
          style={{ width: `${progressPercent}%` }}
        ></View>

        <View className={styles.busWrapper} style={{ left: busPosition }}>
          <Text className={styles.busSmoke}>💨</Text>
          <Text className={styles.busIcon}>🚌</Text>
        </View>

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
    </View>
  )
}

export default BusRouteComponent
