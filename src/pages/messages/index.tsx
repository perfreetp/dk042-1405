import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useBusStore } from '@/store/busStore'
import { formatRelativeTime, formatDateTime } from '@/utils'
import type { Reminder } from '@/types/bus'

type FilterType = 'all' | 'light' | 'formal' | 'arrival'

type MessageCategory = 'light' | 'formal' | 'arrival'

const getCategory = (r: Reminder): MessageCategory => {
  if (r.type === 'light') return 'light'
  if (r.remainingStations === 0) return 'arrival'
  return 'formal'
}

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'light', label: '轻提醒', icon: '⏰' },
  { key: 'formal', label: '正式提醒', icon: '🚍' },
  { key: 'arrival', label: '下车确认', icon: '✅' }
]

const MessagesPage: React.FC = () => {
  const { reminders, markAllRemindersRead, markReminderRead } = useBusStore()
  const [filter, setFilter] = useState<FilterType>('all')
  const [detailReminder, setDetailReminder] = useState<Reminder | null>(null)

  const unreadCount = reminders.filter((r) => !r.isRead).length
  const hasUnread = unreadCount > 0

  const categoryCounts = useMemo(() => {
    const counts = { light: 0, formal: 0, arrival: 0 }
    reminders.forEach((r) => {
      counts[getCategory(r)]++
    })
    return counts
  }, [reminders])

  const filteredReminders = useMemo(() => {
    if (filter === 'all') return reminders
    return reminders.filter((r) => getCategory(r) === filter)
  }, [reminders, filter])

  const handleMarkAll = useCallback(() => {
    console.log('[MessagesPage] 标记所有为已读')
    markAllRemindersRead()
  }, [markAllRemindersRead])

  const handleMessageClick = useCallback((reminder: Reminder) => {
    console.log('[MessagesPage] 打开消息详情', { id: reminder.id })
    if (!reminder.isRead) {
      markReminderRead(reminder.id)
    }
    setDetailReminder(reminder)
  }, [markReminderRead])

  const handleCloseDetail = useCallback(() => {
    setDetailReminder(null)
  }, [])

  const getCategoryMeta = (r: Reminder) => {
    const cat = getCategory(r)
    switch (cat) {
      case 'light':
        return { label: '轻提醒', icon: '⏰', color: '#E65100' }
      case 'formal':
        return { label: '正式提醒', icon: '🚍', color: '#2E7D32' }
      case 'arrival':
        return { label: '下车确认', icon: '✅', color: '#1565C0' }
    }
  }

  const getFilterCount = (key: FilterType): number => {
    if (key === 'all') return reminders.length
    return categoryCounts[key]
  }

  if (reminders.length === 0) {
    return (
      <ScrollView className={styles.messagesPage} scrollY>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyTitle}>暂无消息</Text>
          <Text className={styles.emptyDesc}>
            有新的校车提醒时，会第一时间在这里通知您~
          </Text>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView className={styles.messagesPage} scrollY>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>消息中心</Text>
        <Button
          className={styles.markAllBtn}
          onClick={handleMarkAll}
          disabled={!hasUnread}
        >
          全部已读 ✓
        </Button>
      </View>

      <View className={styles.statsBar}>
        <View className={classnames(styles.statItem, styles.unread)}>
          <Text className={styles.statValue}>{unreadCount}</Text>
          <Text className={styles.statLabel}>未读消息</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{reminders.length}</Text>
          <Text className={styles.statLabel}>全部消息</Text>
        </View>
      </View>

      <ScrollView className={styles.filterBar} scrollX>
        {FILTERS.map((f) => (
          <View
            key={f.key}
            className={classnames(
              styles.filterTab,
              filter === f.key && styles.filterTabActive
            )}
            onClick={() => setFilter(f.key)}
          >
            <Text className={styles.filterIcon}>{f.icon}</Text>
            <Text className={styles.filterLabel}>{f.label}</Text>
            <Text className={styles.filterCount}>{getFilterCount(f.key)}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.messageList}>
        {filteredReminders.length === 0 ? (
          <View className={styles.filterEmpty}>
            <Text className={styles.filterEmptyIcon}>🔍</Text>
            <Text className={styles.filterEmptyText}>该分类下暂无消息</Text>
          </View>
        ) : (
          filteredReminders.map((reminder) => {
            const meta = getCategoryMeta(reminder)
            return (
              <View
                key={reminder.id}
                className={classnames(
                  styles.messageCard,
                  !reminder.isRead && styles.unread,
                  getCategory(reminder) === 'light' && styles.lightType,
                  getCategory(reminder) === 'formal' && styles.formalType,
                  getCategory(reminder) === 'arrival' && styles.arrivalType
                )}
                onClick={() => handleMessageClick(reminder)}
              >
                {!reminder.isRead && <View className={styles.unreadDot}></View>}

                <View className={styles.messageHeader}>
                  <View
                    className={classnames(
                      styles.messageType,
                      getCategory(reminder) === 'light' && styles.lightType,
                      getCategory(reminder) === 'formal' && styles.formalType,
                      getCategory(reminder) === 'arrival' && styles.arrivalType
                    )}
                  >
                    <Text className={styles.icon}>{meta.icon}</Text>
                    {meta.label}
                  </View>
                  <Text className={styles.messageTime}>
                    {formatRelativeTime(reminder.createTime)}
                  </Text>
                </View>

                <Text className={styles.messageTitle}>{reminder.title}</Text>
                <Text className={styles.messageContent}>{reminder.content}</Text>

                <View className={styles.messageFooter}>
                  <Text className={styles.viewDetailHint}>
                    点击查看详情 ›
                  </Text>
                </View>
              </View>
            )
          })
        )}
      </View>

      {detailReminder && (
        <MessageDetailModal
          reminder={detailReminder}
          onClose={handleCloseDetail}
        />
      )}
    </ScrollView>
  )
}

const MessageDetailModal: React.FC<{ reminder: Reminder; onClose: () => void }> = ({
  reminder,
  onClose
}) => {
  const meta = (() => {
    const cat = getCategory(reminder)
    switch (cat) {
      case 'light':
        return { label: '轻提醒', icon: '⏰' }
      case 'formal':
        return { label: '正式提醒', icon: '🚍' }
      case 'arrival':
        return { label: '下车确认', icon: '✅' }
    }
  })()

  return (
    <View className={styles.detailOverlay} onClick={onClose}>
      <View className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
        <View className={styles.detailHeader}>
          <Text className={styles.detailIcon}>{meta.icon}</Text>
          <Text className={styles.detailType}>{meta.label}</Text>
          <Text className={styles.detailTime}>
            {formatDateTime(reminder.createTime)}
          </Text>
        </View>

        <Text className={styles.detailTitle}>{reminder.title}</Text>
        <Text className={styles.detailContent}>{reminder.content}</Text>

        <View className={styles.detailSection}>
          <Text className={styles.detailSectionTitle}>📍 站点信息</Text>
          <View className={styles.detailInfoRow}>
            <Text className={styles.detailInfoLabel}>下车站点</Text>
            <Text className={styles.detailInfoValue}>{reminder.stationName}</Text>
          </View>
          {reminder.remainingStations > 0 && (
            <View className={styles.detailInfoRow}>
              <Text className={styles.detailInfoLabel}>还剩</Text>
              <Text className={styles.detailInfoValue}>{reminder.remainingStations} 站</Text>
            </View>
          )}
          {reminder.remainingStations === 0 && (
            <View className={styles.detailInfoRow}>
              <Text className={styles.detailInfoLabel}>状态</Text>
              <Text className={styles.detailInfoValue}>已到达下车站</Text>
            </View>
          )}
        </View>

        {reminder.busInfo && (
          <View className={styles.detailSection}>
            <Text className={styles.detailSectionTitle}>🚌 接车信息</Text>
            <View className={styles.detailInfoRow}>
              <Text className={styles.detailInfoLabel}>车牌号码</Text>
              <Text className={styles.detailInfoValue}>{reminder.busInfo.plateNumber}</Text>
            </View>
            <View className={styles.detailInfoRow}>
              <Text className={styles.detailInfoLabel}>随车老师</Text>
              <Text className={styles.detailInfoValue}>{reminder.busInfo.teacherName}</Text>
            </View>
            <View className={styles.detailInfoRow}>
              <Text className={styles.detailInfoLabel}>接站口</Text>
              <Text className={styles.detailInfoValue}>{reminder.busInfo.pickupLocation}</Text>
            </View>
          </View>
        )}

        {reminder.tips && reminder.tips.length > 0 && (
          <View className={styles.detailSection}>
            <Text className={styles.detailSectionTitle}>📋 出门准备</Text>
            {reminder.tips.map((tip, index) => (
              <View key={index} className={styles.detailTipItem}>
                <Text className={styles.detailTipIcon}>✓</Text>
                <Text className={styles.detailTipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <Button className={styles.detailCloseBtn} onClick={onClose}>
          关闭
        </Button>
      </View>
    </View>
  )
}

export default MessagesPage
