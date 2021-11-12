import config from "./config";
import log from "./log";
import {isContestProblem, getSubmitUrl, onTabUrlUpdated} from "./utility";
import {injectProblem} from "./injectable";

export const handleSubmit = async (problemName: string, languageId: number, sourceCode: string, problemUrl: string) => {
  if (problemName === "" || languageId == -1 || sourceCode == "") {
    log("Ivalid arguments to handleSubmit");
    return;
  }

  log("isContestProblem", isContestProblem(problemUrl));

  const tab: any = await chrome.tabs.create({
    active: true,
    url: getSubmitUrl(problemUrl),
  });

  await chrome.windows.update(tab.windowId, {
    focused: true,
  });

  if (tab.id == undefined) {
    log("No tab id to send message to", tab);
    return;
  }

  const tabId = tab.id;
  if (!tab.url) await onTabUrlUpdated(tabId);
  chrome.scripting.executeScript({
    target: { tabId },
    func: injectProblem,
    args: [{
      problemName,
      url : problemUrl,
      sourceCode,
      languageId,
    }],
  })
};
