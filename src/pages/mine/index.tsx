import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useBusStore } from '@/store/busStore'

interface MenuItem {
  id: string
  icon: string
  title: string
  desc?: string
  badge?: string
  hasSwitch?: boolean
  switchActive?: boolean
  onClick?: () => void
}

const MinePage: React.FC = () => {
  const { childInfo, route, isBound, reminders, handoverHistory, handoverRecord } = useBusStore()
  const [notificationsOn, setNotificationsOn] = useState(true)
  const [soundOn, setSoundOn] = useState(true)

  const unreadCount = reminders.filter((r) => !r.isRead).length

  const historyCount = useMemo(() => {
    const historyIds = new Set(handoverHistory.map(h => h.id))
    let count = handoverHistory.length
    if (handoverRecord && !historyIds.has(handoverRecord.id)) {
      count++
    }
    return count
  }, [handoverHistory, handoverRecord])

  const handleGoToBinding = useCallback(() => {
    console.log('[MinePage] 跳转到线路绑定')
    Taro.navigateTo({ url: '/pages/binding/index' })
  }, [])

  const handleGoToHistory = useCallback(() => {
    console.log('[MinePage] 跳转到接站历史')
    Taro.navigateTo({ url: '/pages/history/index' })
  }, [])

  const toggleNotification = useCallback(() => {
    console.log('[MinePage] 切换通知设置', { value: !notificationsOn })
    setNotificationsOn(!notificationsOn)
  }, [notificationsOn])

  const toggleSound = useCallback(() => {
    console.log('[MinePage] 切换声音设置', { value: !soundOn })
    setSoundOn(!soundOn)
  }, [soundOn])

  const menuItems: MenuItem[] = [
    {
      id: 'binding',
      icon: '🔗',
      title: '线路管理',
      desc: isBound ? `已绑定：${route?.name || ''}` : '点击绑定孩子线路',
      onClick: handleGoToBinding
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: '到站提醒',
      desc: '接收校车到站通知',
      hasSwitch: true,
      switchActive: notificationsOn,
      onClick: toggleNotification
    },
    {
      id: 'sound',
      icon: '🔊',
      title: '提醒音效',
      desc: '开启提醒声音',
      hasSwitch: true,
      switchActive: soundOn,
      onClick: toggleSound
    },
    {
      id: 'history',
      icon: '📋',
      title: '接站历史',
      desc: historyCount > 0
        ? `已留存 ${historyCount} 条交接记录`
        : '查看历史交接记录',
      onClick: handleGoToHistory
    },
    {
      id: 'contact',
      icon: '📞',
      title: '联系学校',
      desc: '有问题请联系学校'
    },
    {
      id: 'about',
      icon: 'ℹ️',
      title: '关于我们',
      desc: '版本 v1.0.0'
    }
  ]

  const handleMenuClick = useCallback((item: MenuItem) => {
    if (item.hasSwitch) {
      item.onClick?.()
    } else {
      console.log('[MinePage] 点击菜单', { id: item.id })
      if (item.onClick) {
        item.onClick()
      } else {
        Taro.showToast({
          title: '功能开发中...',
          icon: 'none'
        })
      }
    }
  }, [])

  return (
    <ScrollView className={styles.minePage} scrollY>
      <View className={styles.headerSection}>
        <View className={styles.userCard}>
          <Image
            className={styles.userAvatar}
            src="https://picsum.photos/id/338/200/200"
            mode="aspectFill"
          />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>家长您好</Text>
            <View className={styles.userRole}>👨‍👩‍👧 学生家长</View>
          </View>
        </View>
      </View>

      {isBound && childInfo && (
        <View className={styles.childCards}>
          <View className={styles.childCard} onClick={handleGoToBinding}>
            <Image
              className={styles.childAvatar}
              src={childInfo.avatar}
              mode="aspectFill"
            />
            <View className={styles.childInfo}>
              <Text className={styles.childName}>{childInfo.name}</Text>
              <Text className={styles.childClass}>
                {childInfo.grade} {childInfo.className}
              </Text>
              <View className={styles.childRoute}>
                <Text className={styles.icon}>🚌</Text>
                {route?.name} · {childInfo.boundStationName}
              </View>
            </View>
            <Text className={styles.arrowIcon}>›</Text>
          </View>
        </View>
      )}

      <Text className={styles.sectionTitle}>
        <Text className={styles.icon}>⚙️</Text>
        设置
      </Text>

      <View className={styles.menuList}>
        {menuItems.map((item) => (
          <View
            key={item.id}
            className={styles.menuItem}
            onClick={() => handleMenuClick(item)}
          >
            <View className={styles.menuIcon}>{item.icon}</View>
            <View className={styles.menuContent}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                {item.badge && <View className={styles.badge}>{item.badge}</View>}
                {unreadCount > 0 && item.id === 'notifications' && (
                  <View className={styles.badge}>{unreadCount}</View>
                )}
                <Text className={styles.menuTitle}>{item.title}</Text>
              </View>
              {item.desc && (
                <Text className={styles.menuDesc}>{item.desc}</Text>
              )}
            </View>
            {item.hasSwitch ? (
              <View
                className={classnames(
                  styles.switchBtn,
                  item.switchActive && styles.active
                )}
              ></View>
            ) : (
              <Text className={styles.menuArrow}>›</Text>
            )}
          </View>
        ))}
      </View>

      <View className={styles.appInfo}>
        <Text className={styles.appLogo}>🚌</Text>
        <Text className={styles.appName}>校车小火车</Text>
        <Text className={styles.appVersion}>让接车更有温度</Text>
      </View>
    </ScrollView>
  )
}

export default MinePage
