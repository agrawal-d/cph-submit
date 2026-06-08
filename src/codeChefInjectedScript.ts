import { ContentScriptData } from './types';
import log from './log';

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

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== 'cph-submit-codechef') return;

    const languageName = idToCodechefLanguage[message.languageId];
    if (!languageName) return;

    const languageSelect = document.querySelector(
        '#language-select',
    ) as HTMLElement | null;
    if (languageSelect) languageSelect.textContent = languageName;

    const languageInput = document.querySelector(
        'input.MuiSelect-nativeInput',
    ) as HTMLInputElement | null;
    if (languageInput) languageInput.value = languageMap[languageName];
});
