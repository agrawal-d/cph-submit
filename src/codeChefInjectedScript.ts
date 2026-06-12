import { ContentScriptData } from './types';
import log from './log';

declare const ace: any;

log(`cph-submit Codechef script injected`);

const idToCodechefLanguage: Record<number, string> = {
    42: 'C++',
    50: 'C++',
    54: 'C++',
    61: 'C++',
    89: 'C++',
    91: 'C++',
    52: 'C++',
    43: 'C',
    36: 'Java',
    60: 'Java',
    87: 'Java',
    31: 'Python3',
    7: 'Python3',
    40: 'PyPy 3',
    41: 'PyPy 3',
    70: 'PyPy 3',
    9: 'C#',
    65: 'C#',
    79: 'C#',
    34: 'JavaScript',
    55: 'JavaScript',
    32: 'Go',
    6: 'PHP',
    83: 'Kotlin',
    88: 'Kotlin',
    75: 'Rust',
    98: 'Rust',
};

const languageMap: Record<string, string> = {
    'C++': 'C++',
    Python3: 'PYTH 3',
    C: 'C',
    Java: 'JAVA',
    'PyPy 3': 'PYPY3',
    'C#': 'C#',
    JavaScript: 'NODEJS',
    Go: 'GO',
    PHP: 'PHP',
    Kotlin: 'KTLN',
    Rust: 'rust',
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const simulateHumanClick = (element: HTMLElement) => {
    ['mouseover', 'mousedown', 'mouseup', 'click'].forEach((eventType) => {
        element.dispatchEvent(
            new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window,
                buttons: 1,
            }),
        );
    });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== 'cph-submit-codechef') return false;

    const execute = async () => {
        try {
            const languageName = idToCodechefLanguage[message.languageId];
            if (!languageName) {
                sendResponse({ success: false, error: 'Unsupported language' });
                return;
            }

            const languageSelectBtn = document.querySelector(
                '#language-select',
            ) as HTMLElement | null;
            if (languageSelectBtn) {
                simulateHumanClick(languageSelectBtn);
                await sleep(300);

                const options = Array.from(
                    document.querySelectorAll('[role="option"]'),
                ) as HTMLElement[];
                const targetOption = options.find((opt) => {
                    const val = opt.getAttribute('data-value');
                    return (
                        val === languageMap[languageName] ||
                        opt.textContent?.trim() === languageName
                    );
                });

                if (targetOption) {
                    simulateHumanClick(targetOption);
                    await sleep(400);
                }
            }

            const editor = document.querySelector('.ace_editor');
            if (editor && typeof ace !== 'undefined') {
                ace.edit(editor).setValue(message.sourceCode, -1);
            }

            await sleep(200);

            const submitBtn = document.getElementById('submit_btn');
            if (submitBtn) {
                simulateHumanClick(submitBtn);
                sendResponse({ success: true });
            } else {
                sendResponse({
                    success: false,
                    error: 'Submit button not found',
                });
            }
        } catch (error: any) {
            sendResponse({ success: false, error: error.message });
        }
    };

    execute();
    return true;
});
