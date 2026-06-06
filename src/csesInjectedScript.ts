import { ContentScriptData } from './types';
import log from './log';

declare const browser: any;
if (typeof browser !== 'undefined') {
    self.chrome = browser;
}

log('cph-submit cses script injected');

const extMap: Record<string, string> = {
    cpp: `.cpp`,
    c: '.c',
    java: '.java',
    python: '.py',
    rust: '.rs',
    javascript: '.js',
    ruby: '.rb',
    haskell: '.hs',
    scala: '.scala',
    pascal: '.pas',
};

const langMap: Record<string, string> = {
    cpp: 'C++',
    c: 'C',
    java: 'Java',
    python: 'Python3',
    rust: 'Rust',
    javascript: 'Node.js',
    ruby: 'Ruby',
    haskell: 'Haskell',
    scala: 'Scala',
    pascal: 'Pascal',
};
const idToKey: Record<number, string> = {
    54: 'cpp',
    50: 'cpp',
    42: 'cpp',
    61: 'cpp',
    89: 'cpp',
    91: 'cpp',
    59: 'cpp',
    2: 'cpp',
    52: 'cpp',
    43: 'c',
    36: 'java',
    60: 'java',
    87: 'java',
    7: 'python',
    31: 'python',
    40: 'python',
    41: 'python',
    70: 'python',
    75: 'rust',
    98: 'rust',
    34: 'javascript',
    55: 'javascript',
    67: 'ruby',
    12: 'haskell',
    20: 'scala',
    3: 'pascal',
    4: 'pascal',
    51: 'pascal',
};

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== 'cph-submit-cses') return;

    const { sourceCode, problemName, languageId } = message;

    const form = document.querySelector('form');
    if (!form) {
        alert('CSES form not found');
        log('CSES form not found');
        return;
    }

    const fileInput = form.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput) {
        log(`langID is ${languageId}`);

        const langKey = idToKey[languageId] ?? 'cpp';
        log(`langKey is ${langKey}`);
        const fileName = `${problemName}+extMap[langKey]`;
        const file = new File([sourceCode], fileName, { type: 'text/plain' });
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
    }

    const langSelect = form.querySelector(
        'select[name="lang"]',
    ) as HTMLSelectElement;
    if (langSelect) {
        const langKey = idToKey[languageId] ?? 'cpp';
        langSelect.value = langMap[langKey] ?? 'C++';
    }

    form.submit();
    log('CSES form submitted');
});
