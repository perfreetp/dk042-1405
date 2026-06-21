import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Reminder } from '@/types/bus'

interface ReminderModalProps {
  visible: boolean
  reminder: Reminder | null
  onClose: () => void
}

const ReminderModal: React.FC<ReminderModalProps> = ({ visible, reminder, onClose }) => {
  if (!visible || !reminder) return null

  const isLight = reminder.type === 'light'

  return (
    <View className={styles.modalOverlay} onClick={onClose}>
      <View
        className={classnames(
          styles.modalContent,
          isLight ? styles.lightReminder : styles.formalReminder
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <View className={styles.modalHeader}>
          <Text className={classnames(styles.reminderIcon, isLight && styles.light)}>
            {isLight ? '⏰' : '🚍'}
          </Text>
          <View className={classnames(
            styles.reminderType,
            isLight ? styles.lightType : styles.formalType
          )}>
            {isLight ? '🔔 轻提醒' : '📢 正式提醒'}
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

          {reminder.busInfo && (
            <View className={styles.busInfoSection}>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>🚌 车牌号码</Text>
                <Text className={styles.infoValue}>{reminder.busInfo.plateNumber}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>👩‍🏫 随车老师</Text>
                <Text className={styles.infoValue}>{reminder.busInfo.teacherName}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>📍 接站口</Text>
                <Text className={styles.infoValue}>{reminder.busInfo.pickupLocation}</Text>
              </View>
            </View>
          )}
        </View>

        <View className={styles.modalFooter}>
          <Button
            className={classnames(
              styles.confirmButton,
              !isLight && styles.formalButton
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
