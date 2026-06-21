import React, { useCallback } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useBusStore } from '@/store/busStore'
import { formatRelativeTime } from '@/utils'
import type { Reminder } from '@/types/bus'

const MessagesPage: React.FC = () => {
  const { reminders, markAllRemindersRead, markReminderRead } = useBusStore()

  const unreadCount = reminders.filter((r) => !r.isRead).length
  const hasUnread = unreadCount > 0

  const handleMarkAll = useCallback(() => {
    console.log('[MessagesPage] 标记所有为已读')
    markAllRemindersRead()
  }, [markAllRemindersRead])

  const handleMessageClick = useCallback((reminder: Reminder) => {
    console.log('[MessagesPage] 点击消息', { id: reminder.id })
    if (!reminder.isRead) {
      markReminderRead(reminder.id)
    }
  }, [markReminderRead])

  const getTypeLabel = (type: string) => {
    return type === 'light' ? '轻提醒' : '正式提醒'
  }

  const getTypeIcon = (type: string) => {
    return type === 'light' ? '⏰' : '🚍'
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

      <View className={styles.messageList}>
        {reminders.map((reminder) => (
          <View
            key={reminder.id}
            className={classnames(
              styles.messageCard,
              !reminder.isRead && styles.unread,
              reminder.type === 'light' && styles.lightType,
              reminder.type === 'formal' && styles.formalType
            )}
            onClick={() => handleMessageClick(reminder)}
          >
            {!reminder.isRead && <View className={styles.unreadDot}></View>}

            <View className={styles.messageHeader}>
              <View
                className={classnames(
                  styles.messageType,
                  reminder.type === 'light' ? styles.lightType : styles.formalType
                )}
              >
                <Text className={styles.icon}>{getTypeIcon(reminder.type)}</Text>
                {getTypeLabel(reminder.type)}
              </View>
              <Text className={styles.messageTime}>
                {formatRelativeTime(reminder.createTime)}
              </Text>
            </View>

            <Text className={styles.messageTitle}>{reminder.title}</Text>
            <Text className={styles.messageContent}>{reminder.content}</Text>

            {reminder.tips && reminder.tips.length > 0 && (
              <View className={styles.messageTags}>
                {reminder.tips.map((tip, index) => (
                  <Text key={index} className={styles.messageTag}>
                    {tip}
                  </Text>
                ))}
              </View>
            )}

            {reminder.busInfo && (
              <View className={styles.messageTags}>
                <Text className={styles.messageTag}>
                  🚌 {reminder.busInfo.plateNumber}
                </Text>
                <Text className={styles.messageTag}>
                  👩‍🏫 {reminder.busInfo.teacherName}
                </Text>
                <Text className={styles.messageTag}>
                  📍 {reminder.busInfo.pickupLocation}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default MessagesPage
