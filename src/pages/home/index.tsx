import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useBusStore } from '@/store/busStore'
import BusRouteComponent from '@/components/BusRoute'
import BusCard from '@/components/BusCard'
import ReminderModal from '@/components/ReminderModal'
import type { Reminder } from '@/types/bus'
import { formatRelativeTime } from '@/utils'

const HomePage: React.FC = () => {
  const {
    isBound,
    childInfo,
    route,
    busInfo,
    busLocation,
    handoverRecord,
    reminders,
    simulateBusProgress
  } = useBusStore()

  const [showReminder, setShowReminder] = useState(false)
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const shownReminderIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (isBound && busLocation) {
      console.log('[HomePage] 开始模拟校车进度')
      const cleanup = simulateBusProgress()
      return cleanup
    }
  }, [isBound, busLocation, simulateBusProgress])

  useEffect(() => {
    if (handoverRecord?.status === 'parent_confirmed') {
      console.log('[HomePage] 交接已完成，跳过未读提醒弹窗')
      return
    }

    const unreadReminder = reminders.find(
      (r) => !r.isRead && !shownReminderIds.current.has(r.id)
    )
    if (unreadReminder && !showReminder) {
      console.log('[HomePage] 显示新提醒', {
        type: unreadReminder.type,
        id: unreadReminder.id
      })
      shownReminderIds.current.add(unreadReminder.id)
      setCurrentReminder(unreadReminder)
      setShowReminder(true)
    }
  }, [reminders, showReminder, handoverRecord])

  const handleCloseReminder = useCallback(() => {
    if (currentReminder) {
      useBusStore.getState().markReminderRead(currentReminder.id)
    }
    setShowReminder(false)
    setCurrentReminder(null)
  }, [currentReminder])

  const handleGoToBinding = useCallback(() => {
    console.log('[HomePage] 跳转到线路绑定页')
    Taro.navigateTo({ url: '/pages/binding/index' })
  }, [])

  const handleGoToHandover = useCallback(() => {
    console.log('[HomePage] 跳转到交接确认页')
    Taro.navigateTo({ url: '/pages/handover/index' })
  }, [])

  const handleRefresh = useCallback(() => {
    console.log('[HomePage] 刷新页面')
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  }, [])

  useEffect(() => {
    if (refreshing) {
      handleRefresh()
    }
  }, [refreshing, handleRefresh])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { emoji: '🌞', text: '早上好！', subText: '今天也是充满活力的一天~' }
    if (hour < 18) return { emoji: '☀️', text: '下午好！', subText: '小火车正在赶来~' }
    return { emoji: '🌙', text: '晚上好！', subText: '辛苦了，回家路上注意安全~' }
  }

  const greeting = getGreeting()

  if (!isBound || !childInfo || !route || !busInfo || !busLocation) {
    return (
      <ScrollView
        className={styles.homePage}
        scrollY
        refresherEnabled
        onRefresherRefresh={handleRefresh}
      >
        <View className={styles.noBindContainer}>
          <Text className={styles.noBindIcon}>🚌</Text>
          <Text className={styles.noBindTitle}>欢迎使用校车小火车</Text>
          <Text className={styles.noBindDesc}>
            绑定孩子的校车线路后，就可以实时查看校车位置，
            接收到站提醒，让接车更省心！
          </Text>
          <Button className={styles.bindButton} onClick={handleGoToBinding}>
            立即绑定线路 🚀
          </Button>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView
      className={styles.homePage}
      scrollY
      refresherEnabled
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.greetingSection}>
        <View className={styles.greetingText}>
          <Text className={styles.emoji}>{greeting.emoji}</Text>
          {greeting.text}
          <Text className={styles.subText}>{greeting.subText}</Text>
        </View>
        <Text style={{ fontSize: '48rpx' }}>😊</Text>
      </View>

      <View className={styles.childCard}>
        <Image className={styles.childAvatar} src={childInfo.avatar} mode="aspectFill" />
        <View className={styles.childInfo}>
          <Text className={styles.childName}>{childInfo.name}</Text>
          <Text className={styles.childClass}>
            {childInfo.grade} {childInfo.className}
          </Text>
          <View className={styles.boundStation}>
            <Text className={styles.icon}>🏠</Text>
            下车站点：{childInfo.boundStationName}
          </View>
        </View>
      </View>

      {handoverRecord && handoverRecord.status === 'teacher_confirmed' && (
        <View className={styles.handoverBanner}>
          <View className={styles.bannerContent}>
            <Text className={styles.bannerIcon}>✅</Text>
            <Text className={styles.bannerTitle}>
              {childInfo.name} 已安全下车！
            </Text>
            <Text className={styles.bannerSubtitle}>
              下车时间：{formatRelativeTime(handoverRecord.teacherConfirmTime)}
            </Text>
            <Button className={styles.confirmButton} onClick={handleGoToHandover}>
              <Text className={styles.icon}>😊</Text>
              确认已接到
            </Button>
          </View>
        </View>
      )}

      {handoverRecord && handoverRecord.status === 'parent_confirmed' && (
        <View className={styles.handoverBanner}>
          <View className={styles.bannerContent}>
            <Text className={styles.bannerIcon}>🎉</Text>
            <Text className={styles.bannerTitle}>交接完成！</Text>
            <Text className={styles.bannerSubtitle}>
              已确认接到 {childInfo.name}，感谢您的配合~
            </Text>
          </View>
        </View>
      )}

      <Text className={styles.sectionTitle}>
        <Text className={styles.icon}>🗺️</Text>
        实时线路
      </Text>

      <BusRouteComponent
        route={route}
        busLocation={busLocation}
        boundStationId={childInfo.boundStationId}
        handoverStatus={handoverRecord?.status || null}
      />

      <Text className={styles.sectionTitle}>
        <Text className={styles.icon}>🚌</Text>
        车辆信息
      </Text>

      <BusCard busInfo={busInfo} />

      <View className={styles.statusTips}>
        <Text className={styles.tipsIcon}>💡</Text>
        <View className={styles.tipsContent}>
          系统将在离您站点
          <strong> 还有2站时 </strong>
          发送轻提醒，
          <strong> 还有1站时 </strong>
          发送正式提醒，请注意查收通知哦~
        </View>
      </View>

      <ReminderModal
        visible={showReminder}
        reminder={currentReminder}
        onClose={handleCloseReminder}
      />
    </ScrollView>
  )
}

export default HomePage
