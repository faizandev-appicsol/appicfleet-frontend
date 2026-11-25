import type { MessageKey } from '@/i18n'

export type Option = { value: string; label: string }

type Translator = (key: MessageKey) => string

const sourceNames = [
  'Google Ads', 'Google Ads Arabic', 'Office', 'OneClickDrive', 'Referral', 'Rentop', 'REPEAT',
  'Web service', 'Website', 'WhatsApp', 'Yango Drive', 'ACE Driving', 'Adagio Premium The Palm',
  'B2B Direct', 'B2B web', 'B2C Portal', 'B2C web', 'Broadcast', 'Broker', 'External System',
  'Facebook/Instagram', 'Travel Saga', 'Self Drive', 'Dubizzle', 'Guide of Dubai', 'Online Booking',
  'Umer', 'TAMER', 'NETH', 'CLICK', 'AMIR', 'CANEES', 'KARA', 'PANORAMA', 'ALAA', 'SASA', 'ITQAN',
  'H SADEQ', 'NOOR', 'HK', 'RSS', 'GOLDEN VIP', 'SUPER STAR', 'HIGH FLY', 'ZEED', 'MIMI',
  'CAR LINK', 'BASHAR', 'NASHWAN', 'TOP BABIL', 'ADRENALINE', 'MENAWY', 'ROMA', 'SFK', 'ISSA',
  'CHETTIBI', 'YASSIR', 'Organic', 'True Blue Travel', 'Rentico', 'Soloman',
]
const paymentMethods = [
  ['cash', 'Cash'],
  ['onlineTransfer', 'Online Transfer'],
  ['cheque', 'Cheque'],
  ['bankerDraft', 'Banker Draft'],
  ['bankDeposit', 'Bank Deposit'],
  ['preAuth', 'Pre Auth'],
  ['pos', 'POS'],
  ['crypto', 'Crypto'],
] as const

export function getContractFormOptions(t: Translator) {
  const methods = paymentMethods.map(([key, value]) => ({
    value,
    label: t(`contracts.form.payment.${key}` as MessageKey),
  }))
  const noOption = { value: '', label: t('contracts.form.none') }

  return {
    emirateOptions: [
      noOption,
      ...([
        ['Abu Dhabi', 'abuDhabi'],
        ['Ajman', 'ajman'],
        ['Dubai', 'dubai'],
        ['Fujairah', 'fujairah'],
        ['Ras Al Khaimah', 'rasAlKhaimah'],
        ['Sharjah', 'sharjah'],
        ['Umm Al Quwain', 'ummAlQuwain'],
      ] as const).map(([value, key]) => ({ value, label: t(`contracts.form.emirates.${key}` as MessageKey) })),
    ],
    customerKindOptions: [
      { value: 'individual', label: t('contracts.form.kindIndividual') },
      { value: 'organization', label: t('contracts.form.kindOrganization') },
      { value: 'tourist', label: t('contracts.form.kindTourist') },
    ],
    residencyOptions: [
      { value: 'residential', label: t('contracts.form.residencyResidential') },
      { value: 'gcc', label: t('contracts.form.residencyGcc') },
      { value: 'tourist', label: t('contracts.form.residencyTourist') },
    ],
    rentalTypeOptions: [
      noOption,
      { value: 'short_term', label: t('contracts.form.rentalShort') },
      { value: 'long_term', label: t('contracts.form.rentalLong') },
      { value: 'lease', label: t('contracts.form.rentalLease') },
    ],
    rentalPeriodOptions: [
      { value: 'daily', label: t('contracts.form.periodDaily') },
      { value: 'weekly', label: t('contracts.form.periodWeekly') },
      { value: 'monthly', label: t('contracts.form.periodMonthly') },
    ],
    advanceTypeOptions: [
      { value: 'full', label: t('contracts.form.advanceFull') },
      { value: 'custom', label: t('contracts.form.advanceCustom') },
    ],
    advancePaymentOptions: [
      ...methods,
      { value: 'Payment Link', label: t('contracts.form.payment.paymentLink') },
    ],
    depositPaymentOptions: methods,
    staffDriverOptions: [
      { value: '', label: t('contracts.form.selectDriver') },
      { value: 'Natilieknox', label: 'Natilieknox' },
      { value: 'HamzaAbbasi', label: 'HamzaAbbasi' },
    ],
    salesAgentOptions: [noOption, { value: 'TestAdmin3', label: 'TestAdmin3' }],
    sourceOptions: [noOption, ...sourceNames.map((value) => ({ value, label: value }))],
    protectionPlans: [
      { value: 'TC', label: 'TC' },
      { value: 'WC', label: 'WC' },
      { value: 'RSN', label: 'RSN' },
      { value: 'PAI', label: 'PAI' },
      { value: 'SCDW', label: 'SCDW' },
      { value: 'COMPLETE', label: t('contracts.form.completeProtection') },
    ],
  }
}