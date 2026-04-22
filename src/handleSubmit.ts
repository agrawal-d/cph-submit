import config from './config';
import log from './log';

declare const browser: any;

if (typeof browser !== 'undefined') {
    self.chrome = browser;
}

export const isContestProblem = (problemUrl: string) => {
    return problemUrl.indexOf('contest') != -1;
};

export const isAlgoZenithProblem = (problemUrl: string) => {
    try {
        const url = new URL(problemUrl);
        return url.hostname === 'maang.in' || url.hostname.endsWith('.maang.in');
    } catch {
        return false;
    }
};

export const getSubmitUrl = (problemUrl: string) => {
    if (!isContestProblem(problemUrl)) {
        return config.cfSubmitPage.href;
    }
    const url = new URL(problemUrl);
    const contestNumber = url.pathname.split('/')[2];
    const submitURL = `https://codeforces.com/contest/${contestNumber}/submit`;
    return submitURL;
};

export const handleAlgoZenithSubmit = async (
    problemName: string,
    languageId: number,
    sourceCode: string,
    problemUrl: string,
) => {
    log('Handling AlgoZenith submit for', problemUrl);

    const tab = await chrome.tabs.create({
        active: true,
        url: problemUrl,
    });

    const tabId = tab.id as number;

    chrome.windows.update(tab.windowId, { focused: true });

    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);

            setTimeout(async () => {
                if (typeof browser !== 'undefined') {
                    await browser.tabs.executeScript(tabId, {
                        file: '/dist/algoZenithInjectedScript.js',
                    });
                } else {
                    await chrome.scripting.executeScript({
                        target: { tabId, allFrames: false },
                        files: ['/dist/algoZenithInjectedScript.js'],
                    });
                }

                chrome.tabs.sendMessage(tabId, {
                    type: 'cph-submit-algozenith',
                    problemName,
                    languageId,
                    sourceCode,
                    url: problemUrl,
                });

                log('Message sent to AlgoZenith tab');
            }, 2000); 
        }
    });
};

export const handleSubmit = async (
    problemName: string,
    languageId: number,
    sourceCode: string,
    problemUrl: string,
) => {
    if (problemName === '' || languageId == -1 || sourceCode == '') {
        log('Invalid arguments to handleSubmit');
        return;
    }

    if (isAlgoZenithProblem(problemUrl)) {
        return handleAlgoZenithSubmit(problemName, languageId, sourceCode, problemUrl);
    }

    log('isContestProblem', isContestProblem(problemUrl));

    let tab = await chrome.tabs.create({
        active: true,
        url: getSubmitUrl(problemUrl),
    });

    const tabId = tab.id as number;

    chrome.windows.update(tab.windowId, {
        focused: true,
    });

    if (typeof browser !== 'undefined') {
        await browser.tabs.executeScript(tab.id, {
            file: '/dist/injectedScript.js',
        });
    } else {
        await chrome.scripting.executeScript({
            target: {
                tabId,
                allFrames: true,
            },
            files: ['/dist/injectedScript.js'],
        });
    }
    chrome.tabs.sendMessage(tabId, {
        type: 'cph-submit',
        problemName,
        languageId,
        sourceCode,
        url: problemUrl,
    });
    log('Sending message to tab with script');

    const filter = {
        url: [{ urlContains: 'codeforces.com/problemset/status' }],
    };

    log('Adding nav listener');

    chrome.webNavigation.onCommitted.addListener((args) => {
        log('Navigation about to happen');
        if (args.tabId === tab.id) {
            log('Our tab is navigating');
        }
    }, filter);
};
