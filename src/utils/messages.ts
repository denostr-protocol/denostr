import {
  EndOfStoredEventsNotice,
  IncomingEventMessage,
  IncomingRelayedEventMessage,
  MessageType,
  NoticeMessage,
  OutgoingMessage,
  SubscribeMessage,
} from '../@types/messages.ts'
import { Event, RelayedEvent } from '../@types/event.ts'
import { SubscriptionFilter, SubscriptionId } from '../@types/subscription.ts'
import { EventId } from '../@types/base.ts'

export const createNoticeMessage = (notice: string): NoticeMessage => {
  return [MessageType.NOTICE, notice]
}

export const createOutgoingEventMessage = (
  subscriptionId: SubscriptionId,
  event: Event,
): OutgoingMessage => {
  return [MessageType.EVENT, subscriptionId, event]
}

// NIP-15
export const createEndOfStoredEventsNoticeMessage = (
  subscriptionId: SubscriptionId,
): EndOfStoredEventsNotice => {
  return [MessageType.EOSE, subscriptionId]
}

// NIP-20
export const createCommandResult = (eventId: EventId, successful: boolean, message: string) => {
  return [MessageType.OK, eventId, successful, message]
}

export const createSubscriptionMessage = (
  subscriptionId: SubscriptionId,
  filters: SubscriptionFilter[]
): SubscribeMessage => {
  return [MessageType.REQ, subscriptionId, ...filters] as any
}

export const createRelayedEventMessage =
  (event: RelayedEvent, secret?: string): IncomingRelayedEventMessage | IncomingEventMessage => {
    if (!secret) {
      return [MessageType.EVENT, event]
    }

    return [MessageType.EVENT, event, secret]
  }
