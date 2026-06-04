import { ContentScriptData } from './types';
import log from './log';

declare const browser: any;
if (typeof browser !== 'undefined') {
    self.chrome = browser;
}

log('cph-submit cses script injected');

const extMap: Record<string, string> = {
    'cpp':        'solution.cpp',
    'c':          'solution.c',
    'java':       'solution.java',
    'python':     'solution.py',
    'pypy':       'solution.py',
    'rust':       'solution.rs',
    'javascript': 'solution.js',
    'ruby':       'solution.rb',
    'haskell':    'solution.hs',
    'pascal':     'solution.pas',
    'scala':      'solution.scala',
};

const langMap: Record<string, string> = {
    'cpp':        'C++',
    'c':          'C',
    'java':       'Java',
    'python':     'Python3',
    'pypy':       'Python3',
    'rust':       'Rust',
    'javascript': 'Node.js',
    'ruby':       'Ruby',
    'haskell':    'Haskell',
    'pascal':     'Pascal',
    'scala':      'Scala',
};
const idToKey: Record<number, string> = {
    54: 'cpp',
    43: 'c',
    60: 'java',
    31: 'python',
    40: 'pypy',
    75: 'rust',
    55: 'javascript',
    67: 'ruby',
    12: 'haskell',
};

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== 'cph-submit-cses') return;

    const { sourceCode, languageId } = message;

    const form = document.querySelector('form');
    if (!form) {
        log('CSES form not found');
        return;
    }

   
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
        const langKey = idToKey[languageId] ?? 'cpp';
        const fileName = extMap[langKey] ?? 'solution.cpp';
       const file = new File([sourceCode], fileName, { type: 'text/plain' });
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
    }

    
    const langSelect = form.querySelector('select[name="lang"]') as HTMLSelectElement;
    if (langSelect) {
        const langKey = idToKey[languageId] ?? 'cpp';
        langSelect.value = langMap[langKey] ?? 'C++';
    }

   
    form.submit();
    log('CSES form submitted');
});