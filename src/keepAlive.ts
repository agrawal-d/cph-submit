/*
 manifest v3 inactive background after 5 minutes
 work_around we need page opened eg: codeforces.com
*/

let lifeline: any;

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'keepAlive') {
      lifeline = port;
      setTimeout(keepAliveForced, 295e3); // 5 hours
      port.onDisconnect.addListener(keepAliveForced);
    }
  });
  
  function keepAliveForced() {
    lifeline?.disconnect();
    lifeline = null;
    keepAlive();
  }
  
  export async function keepAlive() {
    if (lifeline) return;
    for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
      try {
        const tabId : any = tab.id;
        await chrome.scripting.executeScript({
          target: { tabId },
          func: () => chrome.runtime.connect({ name: 'keepAlive' }),
          // `function` will become `func` in Chrome 93+
        });
        chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
        return;
      } catch (e) {}
    }
    chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
  }
  
  async function retryOnTabUpdate(tabId: any, info: any, tab: any) {
    if (info.url && /^(file|https?):/.test(info.url)) {
      keepAlive();
    }
  }