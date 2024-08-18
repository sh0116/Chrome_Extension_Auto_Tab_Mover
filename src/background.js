let currentIndex = 0;

// onInstalled 리스너에서 알람 생성 로직 제거
chrome.runtime.onInstalled.addListener(() => {
  // 초기 알람 생성 로직 제거
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'tabCycle') {
    cycleTabs();
  }
});

function cycleTabs() {
  chrome.tabs.query({ url: 'https://board.yakjin.com:3000/*' }, function(queriedTabs) {
    if (queriedTabs.length === 0) {
      console.error("No tabs available for cycling.");
      return;
    }
    currentIndex = (currentIndex + 1) % queriedTabs.length;
    chrome.tabs.update(queriedTabs[currentIndex].id, { active: true });
    chrome.windows.update(queriedTabs[currentIndex].windowId, { focused: true });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.command) {
    case "stop":
      chrome.alarms.clear('tabCycle', () => {
        console.log('Cycling stopped.'); // 로그를 추가하여 알람이 삭제되었는지 확인
      });
      break;
    case "start":
      // 사용자가 명시적으로 시작할 때만 알람 생성
      chrome.alarms.create('tabCycle', { periodInMinutes: 1 / 6 });
      break;
    case "updateInterval":
      if (request.interval > 0) {
        chrome.alarms.clear('tabCycle', () => {
          chrome.alarms.create('tabCycle', { periodInMinutes: request.interval / 60000 });
        });
      }
      break;
  }
});
