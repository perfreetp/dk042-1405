import React, { useState, useCallback } from 'react'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useBusStore } from '@/store/busStore'
import { mockRoutesList, mockBusInfo, mockChildInfo } from '@/data/mockData'
import type { BusRoute, Station } from '@/types/bus'

const BindingPage: React.FC = () => {
  const { setBound, isBound, route: currentRoute, childInfo: currentChild } = useBusStore()

  const [childName, setChildName] = useState(currentChild?.name || '')
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(currentRoute || null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(
    currentChild ? (currentRoute?.stations.find(s => s.id === currentChild.boundStationId) || null) : null
  )
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSelectRoute = useCallback((route: BusRoute) => {
    console.log('[BindingPage] 选择线路', { route: route.name })
    setSelectedRoute(route)
    setSelectedStation(null)
  }, [])

  const handleSelectStation = useCallback((station: Station) => {
    console.log('[BindingPage] 选择站点', { station: station.name })
    setSelectedStation(station)
  }, [])

  const handleSubmit = useCallback(() => {
    if (!childName.trim()) {
      Taro.showToast({
        title: '请输入孩子姓名',
        icon: 'none'
      })
      return
    }
    if (!selectedRoute) {
      Taro.showToast({
        title: '请选择校车线路',
        icon: 'none'
      })
      return
    }
    if (!selectedStation) {
      Taro.showToast({
        title: '请选择下车站点',
        icon: 'none'
      })
      return
    }

    console.log('[BindingPage] 提交绑定', {
      childName,
      route: selectedRoute.name,
      station: selectedStation.name
    })

    const newChildInfo = {
      ...mockChildInfo,
      name: childName,
      routeId: selectedRoute.id,
      boundStationId: selectedStation.id,
      boundStationName: selectedStation.name
    }

    setBound(newChildInfo, selectedRoute, mockBusInfo)

    setShowSuccess(true)
  }, [childName, selectedRoute, selectedStation, setBound])

  const handleSuccessClose = useCallback(() => {
    console.log('[BindingPage] 绑定成功，返回首页')
    setShowSuccess(false)
    Taro.switchTab({ url: '/pages/home/index' })
  }, [])

  const canSubmit = childName.trim() && selectedRoute && selectedStation

  return (
    <ScrollView className={styles.bindingPage} scrollY>
      <View className={styles.headerSection}>
        <Text className={styles.headerIcon}>🔗</Text>
        <Text className={styles.headerTitle}>绑定校车线路</Text>
        <Text className={styles.headerDesc}>
          绑定后即可实时查看校车位置，接收提醒，让接车更省心~
        </Text>
      </View>

      <Text className={styles.sectionTitle}>
        <Text className={styles.icon}>👶</Text>
        孩子信息
      </Text>
      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text className={styles.icon}>📝</Text>
            孩子姓名
          </Text>
          <Input
            className={styles.formInput}
            placeholder="请输入孩子姓名"
            value={childName}
            onInput={(e) => setChildName(e.detail.value)}
            maxlength={20}
          />
        </View>
      </View>

      <Text className={styles.sectionTitle}>
        <Text className={styles.icon}>🚌</Text>
        选择线路
      </Text>
      <View className={styles.routesList}>
        {mockRoutesList.map((route) => (
          <View
            key={route.id}
            className={classnames(
              styles.routeCard,
              selectedRoute?.id === route.id && styles.selected
            )}
            onClick={() => handleSelectRoute(route)}
          >
            <View className={styles.routeHeader}>
              <Text className={styles.routeName}>
                <Text className={styles.icon}>🚍</Text>
                {route.name}
              </Text>
              {selectedRoute?.id === route.id && (
                <View className={styles.selectedBadge}>✓ 已选择</View>
              )}
            </View>
            <Text className={styles.routeSchool}>🏫 {route.schoolName}</Text>
            <View className={styles.routeStations}>
              {route.stations.slice(0, 5).map((station) => (
                <Text key={station.id} className={styles.stationTag}>
                  <Text className={styles.icon}>{station.icon}</Text>
                  {station.name}
                </Text>
              ))}
              {route.stations.length > 5 && (
                <Text className={styles.stationTag}>...</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {selectedRoute && (
        <View className={styles.stationsSection}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>🏠</Text>
            选择下车站点
          </Text>
          <View className={styles.stationSelector}>
            {selectedRoute.stations.map((station, index) => (
              <View
                key={station.id}
                className={classnames(
                  styles.stationOption,
                  selectedStation?.id === station.id && styles.selected
                )}
                onClick={() => handleSelectStation(station)}
              >
                <Text className={styles.icon}>{station.icon}</Text>
                {station.name}
                {index === 0 && <Text className={styles.homeTag}>学校</Text>}
              </View>
            ))}
          </View>
        </View>
      )}

      <Button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {isBound ? '更新绑定' : '立即绑定'} 🚀
      </Button>

      <View className={styles.tipsCard}>
        <View className={styles.tipsHeader}>
          <Text className={styles.tipsIcon}>💡</Text>
          <Text className={styles.tipsTitle}>温馨提示</Text>
        </View>
        <View className={styles.tipsContent}>
          <Text className={styles.tipsItem}>• 请准确选择孩子的下车站点</Text>
          <Text className={styles.tipsItem}>• 系统将在到站前发送提醒通知</Text>
          <Text className={styles.tipsItem}>• 如需更换线路，请联系学校</Text>
          <Text className={styles.tipsItem}>• 请保持通知权限开启，以免错过提醒</Text>
        </View>
      </View>

      {showSuccess && (
        <View className={styles.successModal}>
          <View className={styles.successContent}>
            <Text className={styles.successIcon}>🎉</Text>
            <Text className={styles.successTitle}>绑定成功！</Text>
            <Text className={styles.successDesc}>
              已成功绑定 {selectedRoute?.name}
              {'\n'}
              下车站点：{selectedStation?.name}
            </Text>
            <Button className={styles.successButton} onClick={handleSuccessClose}>
              开始使用 ✨
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default BindingPage
