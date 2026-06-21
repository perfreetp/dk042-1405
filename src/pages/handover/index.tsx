import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useBusStore } from '@/store/busStore'
import SafetyBadge from '@/components/SafetyBadge'
import { formatTime } from '@/utils'

const HandoverPage: React.FC = () => {
  const { handoverRecord, childInfo, busInfo, confirmParentReceive } = useBusStore()
  const [showConfetti, setShowConfetti] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    if (handoverRecord?.status === 'parent_confirmed') {
      setIsConfirmed(true)
    }
  }, [handoverRecord])

  const handleConfirmReceive = useCallback(() => {
    console.log('[HandoverPage] 家长确认接到孩子')
    setShowConfetti(true)
    confirmParentReceive()

    setTimeout(() => {
      setShowConfetti(false)
      setIsConfirmed(true)
    }, 1500)

    Taro.showToast({
      title: '确认成功！',
      icon: 'success',
      duration: 2000
    })
  }, [confirmParentReceive])

  const handleBack = useCallback(() => {
    console.log('[HandoverPage] 返回首页')
    Taro.switchTab({ url: '/pages/home/index' })
  }, [])

  if (!handoverRecord || !childInfo || !busInfo) {
    return (
      <ScrollView className={styles.handoverPage} scrollY>
        <View style={{ textAlign: 'center', padding: '80rpx 40rpx' }}>
          <Text style={{ fontSize: '80rpx' }}>📭</Text>
          <Text style={{ fontSize: '32rpx', color: '#333', marginTop: '24rpx' }}>暂无交接记录</Text>
          <Text style={{ fontSize: '26rpx', color: '#999', marginTop: '12rpx' }}>
            孩子下车后，这里会显示交接信息~
          </Text>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView className={styles.handoverPage} scrollY>
      {showConfetti && (
        <>
          <Text className={classnames(styles.confetti, styles.confetti1)}>🎉</Text>
          <Text className={classnames(styles.confetti, styles.confetti2)}>⭐</Text>
          <Text className={classnames(styles.confetti, styles.confetti3)}>✨</Text>
          <Text className={classnames(styles.confetti, styles.confetti4)}>🎊</Text>
          <Text className={classnames(styles.confetti, styles.confetti5)}>🌟</Text>
        </>
      )}

      <View className={styles.successContainer}>
        <View className={styles.badgeSection}>
          <SafetyBadge
            childName={childInfo.name}
            stationName={handoverRecord.stationName}
            confirmTime={handoverRecord.teacherConfirmTime}
          />
        </View>

        <View className={styles.teacherConfirmInfo}>
          <Text className={styles.infoTitle}>
            <Text className={styles.icon}>👩‍🏫</Text>
            随车老师已确认
          </Text>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoItemIcon}>📍</Text>
              <Text className={styles.infoItemLabel}>下车站点</Text>
              <Text className={styles.infoItemValue}>{handoverRecord.stationName}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoItemIcon}>🕐</Text>
              <Text className={styles.infoItemLabel}>下车时间</Text>
              <Text className={styles.infoItemValue}>{formatTime(handoverRecord.teacherConfirmTime)}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoItemIcon}>🚌</Text>
              <Text className={styles.infoItemLabel}>车辆牌照</Text>
              <Text className={styles.infoItemValue}>{busInfo.plateNumber}</Text>
            </View>
          </View>
        </View>

        {!isConfirmed && handoverRecord.status === 'teacher_confirmed' ? (
          <View className={styles.actionSection}>
            <Text className={styles.actionTitle}>确认接到孩子</Text>
            <Text className={styles.actionDesc}>
              请您确认已经安全接到 {childInfo.name}，点击下方笑脸按钮完成交接确认。
            </Text>
            <Button
              className={styles.smileButton}
              onClick={handleConfirmReceive}
            >
              <Text className={styles.smileIcon}>😊</Text>
              <Text className={styles.smileText}>已接到，放心吧！</Text>
              <Text className={styles.smileSubText}>点击确认交接</Text>
            </Button>
          </View>
        ) : (
          <View className={classnames(styles.actionSection, styles.completedState)}>
            <Text className={styles.completedIcon}>🤝</Text>
            <Text className={styles.completedTitle}>交接完成！</Text>
            <Text className={styles.completedSubtitle}>
              感谢您的配合，{childInfo.name}已安全到家~
            </Text>
            <Button className={styles.backButton} onClick={handleBack}>
              <Text className={styles.handshakeIcon}>🏠</Text>
              返回首页
            </Button>
          </View>
        )}

        <View className={styles.tipsSection}>
          <View className={styles.tipsHeader}>
            <Text className={styles.tipsIcon}>💡</Text>
            <Text className={styles.tipsTitle}>温馨提示</Text>
          </View>
          <Text className={styles.tipsContent}>
            请务必在接到孩子后及时点击确认，让学校和老师放心。
            如遇任何问题，请及时联系随车老师 {busInfo.teacherName}（{busInfo.teacherPhone}）。
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default HandoverPage
