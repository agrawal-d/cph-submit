import config from './config';
import { CphSubmitResponse, CphEmptyResponse } from './types';
import log from './log';

const mainLoop = async () => {
    let cphResponse: Response;

    try {
        const headers = new Headers();
        headers.append('cph-submit', 'true');

        const request = new Request(config.cphServerEndpoint.href, {
            method: 'GET',
            headers,
        });

        cphResponse = await fetch(request);
    } catch (err) {
        log('Offscreen: fetch error', err);
        return;
    }

    if (!cphResponse.ok) {
        log('Offscreen: bad response', cphResponse.status);
        return;
    }

    const response: CphSubmitResponse | CphEmptyResponse =
        await cphResponse.json();

    if (response.empty) {
        return;
    }

    log('Offscreen: submission detected');

    chrome.runtime.sendMessage({
        type: 'CPH_SUBMIT',
        payload: response,
    });
};

setInterval(mainLoop, config.loopTimeOut);
