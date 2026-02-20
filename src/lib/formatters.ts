export function formatTEU(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatHours(value: number): string {
  return `${value.toFixed(1)}h`
}

export function formatIndex(value: number): string {
  return value.toFixed(0)
}

export function formatTimestamp(): string {
  const now = new Date()
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
