import log from "./log";
import config from "./config";
import { ContentScriptData } from "./types";

export const isContestProblem = (problemUrl: string) => {
  return problemUrl.indexOf("contest") != -1;
};


export const getSubmitUrl = (problemUrl: any) => {
  // log("start getsubmit url");
  if (!isContestProblem(problemUrl)) {
    return config.cfSubmitPage.href;
  }
  const url = new URL(problemUrl);
  const contestNumber = url.pathname.split("/")[2];
  const submitURL = `https://codeforces.com/contest/${contestNumber}/submit`;
  // log("submitURL", submitURL);
  return submitURL;
};

export function onTabUrlUpdated(tabId: any) {
  return new Promise((resolve, reject) => {
    const onUpdated = (id: any, info: any) => id === tabId && info.url && done(true);
    const onRemoved = (id: any) => id === tabId && done(false);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.onRemoved.addListener(onRemoved);
    function done(ok: any) {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.onRemoved.removeListener(onRemoved);
      (ok ? resolve : reject)();
    }
  });
}