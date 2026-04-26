import { handleSubmit } from './handleSubmit';
import log from './log';
import config from './config';
import { CphSubmitResponse, CphEmptyResponse } from './types';

const hasOffscreen =
    typeof chrome !== 'undefined' && typeof chrome.offscreen !== 'undefined';

if (hasOffscreen) {
    const OFFSCREEN_URL = 'dist/offscreen.html';

    const ensureOffscreen = async () => {
        const exists = await chrome.offscreen.hasDocument();
        if (exists) return;

        log('Background: creating offscreen document');

        await chrome.offscreen.createDocument({
            url: OFFSCREEN_URL,
            reasons: ['BLOBS'] as any,
            justification: 'CPH submit polling',
        });
    };

    chrome.runtime.onStartup.addListener(ensureOffscreen);
    chrome.runtime.onInstalled.addListener(ensureOffscreen);

    ensureOffscreen();

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type !== 'CPH_SUBMIT') return;

        const { problemName, languageId, sourceCode, url } = message.payload;

        log('Background: received submit request');
        handleSubmit(problemName, languageId, sourceCode, url);
    });
} else {
    log('Firefox detected: using background polling');

    const mainLoop = async () => {
        let res: Response;

        try {
            res = await fetch(config.cphServerEndpoint.href, {
                headers: { 'cph-submit': 'true' },
            });
        } catch {
            return;
        }

        if (!res.ok) return;

        const data: CphSubmitResponse | CphEmptyResponse = await res.json();

        if (data.empty) return;

        handleSubmit(
            data.problemName,
            data.languageId,
            data.sourceCode,
            data.url,
        );
    };

    setInterval(mainLoop, config.loopTimeOut);
}
