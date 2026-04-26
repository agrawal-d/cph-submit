import config from './config';
import log from './log';

declare const browser: any;

if (typeof browser !== 'undefined') {
    self.chrome = browser;
}

type SubmitRule = {
    re: RegExp;
    to: (match: RegExpMatchArray, origin: string) => string;
    submitByIndex: boolean;
};

const SUBMIT_RULES: SubmitRule[] = [
    {
        re: /^\/contest\/(\d+)(?:\/problem\/(?<problemIndex>[^\/]+))?\/?$/,
        to: (m, o) => `${o}/contest/${m[1]}/submit`,
        submitByIndex: true,
    },
    {
        re: /^\/gym\/(\d+)(?:\/problem\/(?<problemIndex>[^\/]+))?\/?$/,
        to: (m, o) => `${o}/gym/${m[1]}/submit`,
        submitByIndex: true,
    },
    {
        re: /^\/problemset\/gymProblem\/(\d+)\/(?<problemIndex>[^\/]+)\/?$/,
        to: (m, o) => `${o}/gym/${m[1]}/submit`,
        submitByIndex: true,
    },
    {
        re: /^\/group\/([^\/]+)\/contest\/(\d+)(?:\/problem\/(?<problemIndex>[^\/]+))?\/?$/,
        to: (m, o) => `${o}/group/${m[1]}/contest/${m[2]}/submit`,
        submitByIndex: true,
    },
    {
        re: /^\/edu\/course\/([^\/]+)\/lesson\/([^\/]+)\/([^\/]+)\/practice\/contest\/(\d+)\/problem\/(?<problemIndex>[^\/]+)\/?$/,
        to: (m, o) =>
            `${o}/edu/course/${m[1]}/lesson/${m[2]}/${m[3]}/practice/contest/${m[4]}/submit`,
        submitByIndex: true,
    },
    {
        re: /^\/problemset\/problem\/(\d+)\/(?<problemIndex>[^\/]+)\/?$/,
        to: (m, o) => `${o}/problemset/submit/${m[1]}/${m[2]}`,
        submitByIndex: false,
    },
    {
        re: /^\/problemsets\/acmsguru\/problem\/(\d+)\/(?<problemIndex>[^\/]+)\/?$/,
        to: (m, o) => `${o}/problemsets/acmsguru/submit/${m[1]}/${m[2]}`,
        submitByIndex: false,
    },
];

const DEFAULT_SUBMIT_TARGET = {
    submitUrl: config.cfSubmitPage.href,
    submitByIndex: false,
    problemIndex: null,
};

const resolveSubmitTarget = (problemUrl: string) => {
    try {
        const url = new URL(problemUrl);
        const path = url.pathname;
        const origin = `${url.protocol}//${url.host}`;

        for (const rule of SUBMIT_RULES) {
            const match = path.match(rule.re);
            if (match) {
                return {
                    submitUrl: rule.to(match, origin),
                    submitByIndex: rule.submitByIndex,
                    problemIndex: match.groups?.problemIndex || null,
                };
            }
        }

        return DEFAULT_SUBMIT_TARGET;
    } catch {
        return DEFAULT_SUBMIT_TARGET;
    }
};

export const isAlgoZenithProblem = (problemUrl: string) => {
    try {
        const url = new URL(problemUrl);
        return (
            url.hostname === 'maang.in' || url.hostname.endsWith('.maang.in')
        );
    } catch {
        return false;
    }
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

    chrome.tabs.onUpdated.addListener(
        function listener(updatedTabId, changeInfo) {
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
        },
    );
};

export const handleSubmit = async (
    problemName: string,
    languageId: number,
    sourceCode: string,
    problemUrl: string,
) => {
    if (languageId == -1 || sourceCode == '') {
        log('Invalid arguments to handleSubmit');
        return;
    }

    if (isAlgoZenithProblem(problemUrl)) {
        return handleAlgoZenithSubmit(
            problemName,
            languageId,
            sourceCode,
            problemUrl,
        );
    }

    const submitTarget = resolveSubmitTarget(problemUrl);

    log('isContestProblem', submitTarget.submitByIndex);
    log('problemIndex', submitTarget.problemIndex);

    let tab = await chrome.tabs.create({
        active: true,
        url: submitTarget.submitUrl,
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
        problemIndex: submitTarget.problemIndex,
        submitByIndex: submitTarget.submitByIndex,
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
