import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Station } from '@/types/bus'

interface StationDotProps {
  station: Station
  status: 'passed' | 'current' | 'future' | 'bound'
  showHomeTag?: boolean
}

const StationDot: React.FC<StationDotProps> = ({ station, status, showHomeTag }) => {
  const isActive = status === 'current' || status === 'passed' || status === 'bound'

  return (
    <View className={styles.stationDot}>
      {showHomeTag && (
        <View className={styles.homeTag}>🏠</View>
      )}
      <View
        className={classnames(
          styles.dot,
          status === 'passed' && styles.passed,
          status === 'current' && styles.current,
          status === 'bound' && styles.bound
        )}
      >
        <Text className={styles.dotIcon}>{station.icon}</Text>
      </View>
      <Text
        className={classnames(
          styles.stationName,
          isActive && styles.active,
          status === 'bound' && styles.bound
        )}
      >
        {station.name}
      </Text>
    </View>
  )
}

export default StationDot
