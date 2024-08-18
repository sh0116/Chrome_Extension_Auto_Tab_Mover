const tabs = await chrome.tabs.query({
    url: ['https://board.yakjin.com:3000/*']
  });
  
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById('li_template');
const elements = new Set();
for (const tab of tabs) {
const element = template.content.firstElementChild.cloneNode(true);

const title = tab.title.split('|')[0].trim();
const pathname = new URL(tab.url).pathname.slice('/docs'.length);

element.querySelector('.title').textContent = title;
element.querySelector('.pathname').textContent = pathname;
element.querySelector('a').addEventListener('click', async () => {
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
});

elements.add(element);
}
document.querySelector('ul').append(...elements);

const groupTabs = document.getElementById('groupTabs');
groupTabs.addEventListener('click', async () => {
    const tabIds = tabs.map(({ id }) => id);
    if (tabIds.length) {
        const group = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(group, { title: 'BOARD' });
    }
});

const startButton = document.getElementById('startCycle');
const stopButton = document.getElementById('stopCycle');
const intervalSelect = document.getElementById('cycleInterval');

startButton.addEventListener('click', function () {
    const interval = Number(intervalSelect.value);
    chrome.runtime.sendMessage({ command: 'start', interval: interval });
});

stopButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({ command: 'stop' });
});

intervalSelect.addEventListener('change', function () {
    const interval = Number(intervalSelect.value);
    chrome.runtime.sendMessage({ command: 'updateInterval', interval: interval });
});
