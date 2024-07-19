// This script is injected into Codeforces submission page.
import { ContentScriptData } from './types';
import log from './log';

declare const browser: any;

if (typeof browser !== 'undefined') {
    self.chrome = browser;
}

log('cph-submit script injected');

const isContestProblem = (problemUrl: string) => {
    return problemUrl.indexOf('contest') != -1;
};

const handleData = (data: ContentScriptData) => {
    log('Handling submit message');
    const languageEl = document.getElementsByName(
        'programTypeId',
    )[0] as HTMLSelectElement;
    const sourceCodeEl = document.getElementById(
        'sourceCodeTextarea',
    ) as HTMLTextAreaElement;

    sourceCodeEl.value = data.sourceCode;
    languageEl.value = data.languageId.toString();

    if (!isContestProblem(data.url)) {
        const problemNameEl = document.getElementsByName(
            'submittedProblemCode',
        )[0] as HTMLInputElement;

        problemNameEl.value = data.problemName;
    } else {
        const problemIndexEl = document.getElementsByName(
            'submittedProblemIndex',
        )[0] as HTMLSelectElement;

        // Dont use problemName from data as it includes the contest number.
        const problemName = data.url.split('/problem/')[1];
        problemIndexEl.value = problemName;
    }

    log('Submitting problem');
    const submitBtn = document.querySelector('.submit') as HTMLButtonElement;
    submitBtn.disabled = false;
    submitBtn.click();
};

log('Adding event listener', chrome);
chrome.runtime.onMessage.addListener((data: any, sender: any) => {
    log('Got message', data, sender);
    if (data.type == 'cph-submit') {
        handleData(data);
    }
});
