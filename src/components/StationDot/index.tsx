import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Station } from '@/types/bus'
import type { StationStatus } from '@/utils'

interface StationDotProps {
  station: Station
  status: StationStatus
  showHomeTag?: boolean
}

const StationDot: React.FC<StationDotProps> = ({ station, status, showHomeTag }) => {
  const isPassed = status === 'passed'
  const isCurrent = status === 'current'
  const isBoundArrived = status === 'bound_arrived'
  const isActive = isPassed || isCurrent || isBoundArrived

  return (
    <View className={styles.stationDot}>
      {showHomeTag && (
        <View className={styles.homeTag}>🏠</View>
      )}
      <View
        className={classnames(
          styles.dot,
          isPassed && styles.passed,
          isCurrent && styles.current,
          isBoundArrived && styles.boundArrived
        )}
      >
        <Text className={styles.dotIcon}>{station.icon}</Text>
      </View>
      <Text
        className={classnames(
          styles.stationName,
          isActive && styles.active,
          isBoundArrived && styles.boundArrivedText
        )}
      >
        {station.name}
      </Text>
    </View>
  )
}

export default StationDot
