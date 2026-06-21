import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Station } from '@/types/bus'

interface StationDotProps {
  station: Station
  status: 'passed' | 'current' | 'future' | 'bound' | 'bound_passed' | 'bound_current'
  showHomeTag?: boolean
}

const StationDot: React.FC<StationDotProps> = ({ station, status, showHomeTag }) => {
  const isPassed = status === 'passed' || status === 'bound_passed'
  const isCurrent = status === 'current' || status === 'bound_current'
  const isBound = status === 'bound' || status === 'bound_passed' || status === 'bound_current'
  const isActive = isPassed || isCurrent || isBound

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
          isBound && styles.bound
        )}
      >
        <Text className={styles.dotIcon}>{station.icon}</Text>
      </View>
      <Text
        className={classnames(
          styles.stationName,
          isActive && styles.active,
          isBound && styles.bound
        )}
      >
        {station.name}
      </Text>
    </View>
  )
}

export default StationDot
