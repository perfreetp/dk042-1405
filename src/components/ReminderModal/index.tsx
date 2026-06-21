import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { normalizeReminder } from '@/utils'
import type { Reminder, ReminderType } from '@/types/bus'

interface ReminderModalProps {
  visible: boolean
  reminder: Reminder | null
  onClose: () => void
}

const TYPE_META: Record<ReminderType, { icon: string; label: string; isLight: boolean; isArrival: boolean }> = {
  light: { icon: '⏰', label: '🔔 轻提醒', isLight: true, isArrival: false },
  formal: { icon: '🚍', label: '📢 正式提醒', isLight: false, isArrival: false },
  arrival: { icon: '✅', label: '🎉 到站确认', isLight: false, isArrival: true }
}

const ReminderModal: React.FC<ReminderModalProps> = ({ visible, reminder, onClose }) => {
  if (!visible || !reminder) return null

  const meta = TYPE_META[reminder.type]
  const isLight = meta.isLight
  const isArrival = meta.isArrival
  const normalized = normalizeReminder(reminder)
  const busInfo = normalized.busInfo!

  return (
    <View className={styles.modalOverlay} onClick={onClose}>
      <View
        className={classnames(
          styles.modalContent,
          isLight && styles.lightReminder,
          !isLight && !isArrival && styles.formalReminder,
          isArrival && styles.arrivalReminder
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <View className={styles.modalHeader}>
          <Text className={classnames(styles.reminderIcon, isLight && styles.light)}>
            {meta.icon}
          </Text>
          <View className={classnames(
            styles.reminderType,
            isLight && styles.lightType,
            !isLight && !isArrival && styles.formalType,
            isArrival && styles.arrivalType
          )}>
            {meta.label}
          </View>
          <Text className={styles.reminderTitle}>{reminder.title}</Text>
        </View>

        <View className={styles.modalBody}>
          <Text className={styles.reminderContent}>{reminder.content}</Text>

          {reminder.tips && reminder.tips.length > 0 && (
            <View className={styles.tipsSection}>
              <Text className={styles.tipsTitle}>📋 出门前请准备：</Text>
              {reminder.tips.map((tip, index) => (
                <View key={index} className={styles.tipItem}>
                  <Text className={styles.tipIcon}>✓</Text>
                  <Text>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          <View className={styles.busInfoSection}>
            <Text className={styles.busInfoTitle}>🚌 接车信息</Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>车牌号码</Text>
              <Text className={styles.infoValue}>{busInfo.plateNumber}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>随车老师</Text>
              <Text className={styles.infoValue}>{busInfo.teacherName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>接站口</Text>
              <Text className={styles.infoValue}>{busInfo.pickupLocation}</Text>
            </View>
          </View>
        </View>

        <View className={styles.modalFooter}>
          <Button
            className={classnames(
              styles.confirmButton,
              !isLight && !isArrival && styles.formalButton,
              isArrival && styles.arrivalButton
            )}
            onClick={onClose}
          >
            知道了 ✓
          </Button>
        </View>
      </View>
    </View>
  )
}

export default ReminderModal
