import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import type { BusInfo } from '@/types/bus'

interface BusCardProps {
  busInfo: BusInfo
}

const BusCard: React.FC<BusCardProps> = ({ busInfo }) => {
  const seatPercent = Math.round((busInfo.currentPassengers / busInfo.capacity) * 100)

  return (
    <View className={styles.busCard}>
      <View className={styles.cardHeader}>
        <View className={styles.busIcon}>🚌</View>
        <View className={styles.busBasicInfo}>
          <Text className={styles.plateNumber}>{busInfo.plateNumber}</Text>
          <Text className={styles.driverInfo}>
            👨‍✈️ {busInfo.driverName} · 👩‍🏫 {busInfo.teacherName}
          </Text>
        </View>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoItemIcon}>👩‍🏫</Text>
          <Text className={styles.infoItemLabel}>随车老师</Text>
          <Text className={styles.infoItemValue}>{busInfo.teacherName}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoItemIcon}>📱</Text>
          <Text className={styles.infoItemLabel}>联系电话</Text>
          <Text className={styles.infoItemValue}>{busInfo.teacherPhone}</Text>
        </View>
      </View>

      <View className={styles.seatBar}>
        <View className={styles.seatLabel}>
          <Text>🪑 座位情况</Text>
          <Text>{busInfo.currentPassengers}/{busInfo.capacity} 人</Text>
        </View>
        <View className={styles.seatTrack}>
          <View
            className={styles.seatProgress}
            style={{ width: `${seatPercent}%` }}
          ></View>
        </View>
      </View>
    </View>
  )
}

export default BusCard
