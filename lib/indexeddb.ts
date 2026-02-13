import { get, set, del, entries } from 'idb-keyval'

export interface UsageRecord {
  id: string
  timestamp: number
  provider: string
  model: string
  requestTokens: number
  responseTokens: number
  totalTokens: number
  endpoint: string
  responseTime: number
}

export interface ProviderConfig {
  name: string
  apiBase: string
  modelsEndpoint: string
}

const USAGE_KEY_PREFIX = 'usage_'
const CONFIG_KEY = 'provider_configs'

export async function saveUsageRecord(record: UsageRecord): Promise<void> {
  const key = `${USAGE_KEY_PREFIX}${record.id}`
  await set(key, record)
}

export async function getAllUsageRecords(): Promise<UsageRecord[]> {
  const allEntries = await entries()
  const usageRecords: UsageRecord[] = []
  
  for (const [key, value] of allEntries) {
    if (typeof key === 'string' && key.startsWith(USAGE_KEY_PREFIX)) {
      usageRecords.push(value as UsageRecord)
    }
  }
  
  return usageRecords.sort((a, b) => b.timestamp - a.timestamp)
}

export async function getUsageRecordsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<UsageRecord[]> {
  const allRecords = await getAllUsageRecords()
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()
  
  return allRecords.filter(
    record => record.timestamp >= startTime && record.timestamp <= endTime
  )
}

export async function clearUsageRecords(): Promise<void> {
  const allEntries = await entries()
  
  for (const [key] of allEntries) {
    if (typeof key === 'string' && key.startsWith(USAGE_KEY_PREFIX)) {
      await del(key)
    }
  }
}

export async function getProviderConfigs(): Promise<ProviderConfig[]> {
  const configs = await get<ProviderConfig[]>(CONFIG_KEY)
  return configs || []
}

export async function saveProviderConfigs(configs: ProviderConfig[]): Promise<void> {
  await set(CONFIG_KEY, configs)
}
