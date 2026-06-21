import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { formatTime } from '@/utils'

interface SafetyBadgeProps {
  childName: string
  stationName: string
  confirmTime: string
}

const SafetyBadge: React.FC<SafetyBadgeProps> = ({ childName, stationName, confirmTime }) => {
  return (
    <View className={styles.badgeContainer}>
      <View className={styles.badgeCircle}>
        <Text className={styles.badgeIcon}>✅</Text>
      </View>
      <Text className={styles.badgeTitle}>已安全下车</Text>
      <Text className={styles.badgeSubtitle}>
        {childName} 已在 {stationName} 站下车
      </Text>
      <Text className={styles.badgeTime}>
        确认时间：{formatTime(confirmTime)}
      </Text>
      <View className={styles.starsContainer}>
        <Text className={styles.star}>⭐</Text>
        <Text className={styles.star}>⭐</Text>
        <Text className={styles.star}>⭐</Text>
        <Text className={styles.star}>⭐</Text>
        <Text className={styles.star}>⭐</Text>
      </View>
    </View>
  )
}

export default SafetyBadge
