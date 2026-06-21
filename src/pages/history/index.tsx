import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useBusStore } from '@/store/busStore'
import { formatDate, formatDateChinese, formatTime, normalizeHandoverRecord } from '@/utils'
import type { HandoverRecord } from '@/types/bus'

const HistoryPage: React.FC = () => {
  const { handoverHistory, handoverRecord } = useBusStore()

  const allRecords = useMemo(() => {
    const historyIds = new Set(handoverHistory.map(h => h.id))
    const list = [...handoverHistory]

    if (handoverRecord && !historyIds.has(handoverRecord.id)) {
      list.unshift(handoverRecord)
    }

    const uniqueMap = new Map<string, HandoverRecord>()
    list.forEach((r) => {
      const normalized = normalizeHandoverRecord(r)
      if (!uniqueMap.has(normalized.id)) {
        uniqueMap.set(normalized.id, normalized)
      }
    })

    return Array.from(uniqueMap.values()).sort((a, b) =>
      new Date(b.teacherConfirmTime).getTime() - new Date(a.teacherConfirmTime).getTime()
    )
  }, [handoverHistory, handoverRecord])

  const completedCount = allRecords.filter(r => r.status === 'parent_confirmed').length
  const totalCount = allRecords.length

  const getStatusInfo = (record: HandoverRecord) => {
    if (record.status === 'parent_confirmed') {
      return { text: '已完成', cls: styles.completed }
    }
    return { text: '待家长确认', cls: styles.waiting }
  }

  if (allRecords.length === 0) {
    return (
      <ScrollView className={styles.historyPage} scrollY>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyTitle}>暂无接站记录</Text>
          <Text className={styles.emptyDesc}>
            孩子完成下车交接后，历史记录会按日期保留在这里，方便您随时回看~
          </Text>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView className={styles.historyPage} scrollY>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>接站历史</Text>
        <Text className={styles.pageDesc}>
          按日期留存每次交接记录，含老师确认、家长确认、车辆和接站口信息
        </Text>
      </View>

      <View className={styles.statsBar}>
        <View className={classnames(styles.statItem, styles.highlight)}>
          <Text className={styles.statValue}>{completedCount}</Text>
          <Text className={styles.statLabel}>已完成交接</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{totalCount}</Text>
          <Text className={styles.statLabel}>总记录数</Text>
        </View>
      </View>

      <View className={styles.historyList}>
        {allRecords.map((record) => {
          const statusInfo = getStatusInfo(record)
          const isCompleted = record.status === 'parent_confirmed'
          return (
            <View
              key={record.id}
              className={classnames(
                styles.historyCard,
                !isCompleted && record.status === 'teacher_confirmed' && styles.teacherOnly,
                !isCompleted && record.status === 'pending' && styles.pending
              )}
            >
              <View className={styles.cardHeader}>
                <View className={styles.dateBlock}>
                  <Text className={styles.dateIcon}>📅</Text>
                  <View>
                    <Text className={styles.dateText}>
                      {formatDateChinese(record.teacherConfirmTime)}
                    </Text>
                    <Text className={styles.dateSub}>
                      {formatDate(record.teacherConfirmTime)}
                    </Text>
                  </View>
                </View>
                <View className={classnames(styles.statusBadge, statusInfo.cls)}>
                  {statusInfo.text}
                </View>
              </View>

              <View className={styles.infoSection}>
                <Text className={styles.sectionLabel}>
                  <Text className={styles.icon}>🚌</Text>
                  车辆与接站信息
                </Text>
                <View className={styles.infoGrid}>
                  <View className={styles.infoCell}>
                    <Text className={styles.infoCellIcon}>🚍</Text>
                    <View className={styles.infoCellText}>
                      <Text className={styles.infoCellLabel}>车牌号码</Text>
                      <Text className={styles.infoCellValue}>
                        {record.plateNumber || '—'}
                      </Text>
                    </View>
                  </View>
                  <View className={styles.infoCell}>
                    <Text className={styles.infoCellIcon}>📍</Text>
                    <View className={styles.infoCellText}>
                      <Text className={styles.infoCellLabel}>下车站点</Text>
                      <Text className={styles.infoCellValue}>{record.stationName}</Text>
                    </View>
                  </View>
                  <View className={styles.infoCell}>
                    <Text className={styles.infoCellIcon}>🚪</Text>
                    <View className={styles.infoCellText}>
                      <Text className={styles.infoCellLabel}>接站口</Text>
                      <Text className={styles.infoCellValue}>
                        {record.pickupLocation || '—'}
                      </Text>
                    </View>
                  </View>
                  <View className={styles.infoCell}>
                    <Text className={styles.infoCellIcon}>👩‍🏫</Text>
                    <View className={styles.infoCellText}>
                      <Text className={styles.infoCellLabel}>随车老师</Text>
                      <Text className={styles.infoCellValue}>
                        {record.teacherName || '—'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className={styles.infoSection}>
                <Text className={styles.sectionLabel}>
                  <Text className={styles.icon}>🔄</Text>
                  交接流程
                </Text>
                <View className={styles.processRow}>
                  <View className={classnames(styles.processCell, styles.done)}>
                    <Text className={styles.processIcon}>👩‍🏫</Text>
                    <Text className={styles.processLabel}>老师确认</Text>
                    <Text className={styles.processTime}>
                      {formatTime(record.teacherConfirmTime)}
                    </Text>
                  </View>
                  <View
                    className={classnames(
                      styles.processCell,
                      isCompleted ? styles.done : styles.pending
                    )}
                  >
                    <Text className={styles.processIcon}>
                      {isCompleted ? '✅' : '⏳'}
                    </Text>
                    <Text className={styles.processLabel}>家长确认</Text>
                    {record.parentConfirmTime ? (
                      <Text className={styles.processTime}>
                        {formatTime(record.parentConfirmTime)}
                      </Text>
                    ) : (
                      <Text className={styles.processPendingText}>待确认</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

export default HistoryPage
