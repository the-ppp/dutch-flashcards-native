import { send } from '@emailjs/react-native'

// From emailjs.com: Email Services -> your service (Service ID),
// Email Templates -> your template (Template ID), Account -> General (Public Key).
// Also requires Account -> Security -> "Allow EmailJS API for non-browser applications".
const SERVICE_ID = 'service_uydcrx4'
const TEMPLATE_ID = 'template_31ilsvd'
const PUBLIC_KEY = 'caPkeebuJ-uf6KVds'

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'other'

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  general: 'General feedback',
  bug: 'Report a bug',
  feature: 'Feature request',
  other: 'Other',
}

export function sendFeedback(params: { email: string; category: FeedbackCategory; message: string }) {
  return send(
    SERVICE_ID,
    TEMPLATE_ID,
    { from_email: params.email, category: CATEGORY_LABELS[params.category], message: params.message },
    { publicKey: PUBLIC_KEY },
  )
}
