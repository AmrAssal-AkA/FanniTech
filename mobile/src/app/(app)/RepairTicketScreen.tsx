import React, { useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  StatusBar,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import {
  useRepairTicket,
  TicketHeader,
  TicketMetaHeader,
  DiagnosticHeroCard,
  DeviceSummaryCard,
  RepairTimelineStepper,
  BenchDiagnosticFeedCard,
  TechnicianAuditLogCard,
  TicketActionButtons,
  ToastNotificationPill,
  RepairTicketLoading,
  RepairTicketError,
} from '../../features/repair-tickets';

export default function RepairTicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ticketNumber?: string | string[];
    ticketId?: string | string[];
    requestId?: string | string[];
  }>();

  const ticketNumberParam = Array.isArray(params.ticketNumber)
    ? params.ticketNumber[0]
    : params.ticketNumber;
  const ticketIdParam = Array.isArray(params.ticketId)
    ? params.ticketId[0]
    : params.ticketId;
  const requestIdParam = Array.isArray(params.requestId)
    ? params.requestId[0]
    : params.requestId;

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  }, []);

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      showToast(`Live update: Status changed to ${newStatus.replace(/_/g, ' ')}`);
    },
    [showToast]
  );

  const { ticket, isLoading, isError, error, isLiveConnected, refetch } = useRepairTicket({
    ticketNumber: ticketNumberParam,
    ticketId: ticketIdParam,
    requestId: requestIdParam,
    onStatusChange: handleStatusChange,
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/HomeScreen');
    }
  };

  const handleProfilePress = () => {
    router.push('/(app)/ProfileScreen');
  };

  const handleCopyTicket = () => {
    const ticketId =
      ticket?.ticketNumber || ticketNumberParam || requestIdParam || '';
    if (ticketId) {
      showToast(`Ticket #${ticketId} copied to clipboard`);
    }
  };

  const handleCall = () => {
    const phone = ticket?.hubInfo?.phone || '+966114567890';
    showToast('Calling FanniTech Central Hub...');
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {
      // Fallback if device cannot make phone calls
    });
  };

  const handleMessage = () => {
    showToast('Starting technician live chat...');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />
        <TicketHeader onBack={handleBack} onProfilePress={handleProfilePress} />
        <RepairTicketLoading />
      </SafeAreaView>
    );
  }

  if (isError || !ticket) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />
        <TicketHeader onBack={handleBack} onProfilePress={handleProfilePress} />
        <RepairTicketError
          message={error?.message || 'Repair ticket could not be found.'}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Fixed Sticky Header */}
      <TicketHeader
        title="Repair Detail"
        onBack={handleBack}
        onProfilePress={handleProfilePress}
      />

      {/* Main Scroll Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={['#00236f', '#0051d5']}
            tintColor="#0051d5"
          />
        }
      >
        {/* Ticket Reference & Live Status Header */}
        <TicketMetaHeader
          ticketNumber={ticket.ticketNumber}
          requestNumber={ticket.requestNumber}
          isLiveConnected={isLiveConnected}
          onCopyTicket={handleCopyTicket}
        />

        {/* Hero Diagnostic Status Banner */}
        <DiagnosticHeroCard
          status={ticket.status}
          statusDescription={ticket.statusDescription}
        />

        {/* Device Summary Card with Reported Issue and Specs */}
        <DeviceSummaryCard
          device={ticket.device}
          problem={ticket.problem}
          description={ticket.description}
        />

        {/* Visual 5-Stage Repair Timeline Stepper */}
        <RepairTimelineStepper
          timeline={ticket.timeline}
          currentStage={ticket.currentStage}
          totalStages={ticket.totalStages}
        />

        {/* Bench Diagnostic Feed Photo & Telemetry (if available) */}
        <BenchDiagnosticFeedCard feed={ticket.diagnosticFeed} />

        {/* Technician Audit Log */}
        <TechnicianAuditLogCard logs={ticket.auditLogs} />



        {/* Action Controls & Care Guarantee Footer */}
        <TicketActionButtons
          onCall={handleCall}
          onMessage={handleMessage}
        />
      </ScrollView>

      {/* Floating Interactive Toast Feedback Pill */}
      <ToastNotificationPill
        visible={toastVisible}
        message={toastMessage}
      />
    </SafeAreaView>
  );
}