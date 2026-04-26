import { ContentScriptData } from './types';
import log from './log';

declare const browser: any;
if (typeof browser !== 'undefined') {
    self.chrome = browser;
}

log('cph-submit AlgoZenith script injected');

const LANGUAGE_MAP: Record<number, string> = {
    48: 'C',
    52: 'C++14',
    54: 'C++14',
    62: 'Java',
    71: 'Python3',
};

const handleData = async (data: ContentScriptData) => {
    log('Handling AlgoZenith submit');

    const targetLang = LANGUAGE_MAP[data.languageId] ?? 'C++14';
    const langBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.trim().match(/^(C|C\+\+14|Java|Python3)$/),
    ) as HTMLButtonElement;

    if (langBtn) {
        langBtn.click();
        await new Promise((r) => setTimeout(r, 500));
        const option = Array.from(
            document.querySelectorAll('[role="option"]'),
        ).find((o) => o.textContent?.trim() === targetLang) as HTMLElement;
        if (option) option.click();
        await new Promise((r) => setTimeout(r, 300));
    }

    const monacoEditor = (window as any).monaco?.editor?.getEditors?.()?.[0];
    if (monacoEditor) {
        monacoEditor.setValue(data.sourceCode);
        log('Code set via Monaco API');
    }

    await new Promise((r) => setTimeout(r, 500));

    const submitBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Submit',
    ) as HTMLButtonElement;

    if (submitBtn) {
        submitBtn.click();
        log('Submit clicked!');
    } else {
        log('Submit button not found!');
    }
};

chrome.runtime.onMessage.addListener((data: any) => {
    if (data.type === 'cph-submit-algozenith') {
        handleData(data);
    }
});
