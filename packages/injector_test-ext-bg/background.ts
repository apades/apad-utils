import {
  sendMessage,
  onMessage,
} from './node_modules/webext-bridge/dist/background'

const getActiveTabId = async () => {
  let [tab] = await chrome.tabs.query({ active: true })
  console.log('tab', tab)
  return tab.id
}
;(globalThis as any).sendMsg = async (type: string, data: any) =>
  sendMessage(type, data, { context: 'window', tabId: await getActiveTabId() })

onMessage('on-bg', (data) => {
  console.log('on-bg', data)
})
