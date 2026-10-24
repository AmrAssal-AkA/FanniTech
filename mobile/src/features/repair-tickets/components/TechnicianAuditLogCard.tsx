import React from 'react';
import { View, Text } from 'react-native';
import { ClipboardCheck } from 'lucide-react-native';
import { AuditLogEntry } from '../types';

interface TechnicianAuditLogCardProps {
  logs: AuditLogEntry[];
}

export const TechnicianAuditLogCard: React.FC<TechnicianAuditLogCardProps> = ({
  logs,
}) => {
  if (!logs || logs.length === 0) return null;

  return (
    <View className="mx-4 my-2">
      <View className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container/80 flex-col gap-3">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <ClipboardCheck size={20} color="#0051d5" />
            <Text className="text-base font-bold text-primary">
              Technician Audit Log
            </Text>
          </View>
          <Text className="text-xs font-semibold text-on-surface-variant">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </Text>
        </View>

        {/* Entries */}
        <View className="flex-col gap-3">
          {logs.map((log) => (
            <View
              key={log.id}
              className="p-3 bg-surface-container-low rounded-lg flex-col gap-1.5"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      log.isMaster ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <Text className="text-xs font-bold text-white">
                      {log.initial}
                    </Text>
                  </View>
                  <Text className="text-xs font-bold text-on-surface">
                    {log.author}
                  </Text>
                  <View className="bg-surface-container px-1.5 py-0.5 rounded">
                    <Text className="text-[10px] font-semibold text-on-surface-variant">
                      {log.role}
                    </Text>
                  </View>
                </View>

                <Text className="text-xs font-mono text-on-surface-variant">
                  {log.timestamp}
                </Text>
              </View>

              <Text className="text-xs text-on-surface-variant leading-relaxed">
                {log.content}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

