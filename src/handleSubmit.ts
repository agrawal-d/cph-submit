// Code run when background script detects there is a problem to submit
import config from "./config";
import log from "./log";

declare const browser: any;

if (typeof chrome === "undefined") {
  self.chrome = browser;
}

export const isContestProblem = (problemUrl: string) => {
  return problemUrl.indexOf("contest") != -1;
};

export const getSubmitUrl = (problemUrl: string) => {
  if (!isContestProblem(problemUrl)) {
    return config.cfSubmitPage.href;
  }
  const url = new URL(problemUrl);
  const contestNumber = url.pathname.split("/")[2];
  const submitURL = `https://codeforces.com/contest/${contestNumber}/submit`;
  return submitURL;
};

/** Opens the codefoces submit page and injects script to submit code. */
export const handleSubmit = async (problemName: string, languageId: number, sourceCode: string, problemUrl: string) => {
  if (problemName === "" || languageId == -1 || sourceCode == "") {
    log("Invalid arguments to handleSubmit");
    return;
  }

  log("isContestProblem", isContestProblem(problemUrl));

  const tab = await chrome.tabs.create({
    active: true,
    url: getSubmitUrl(problemUrl),
  });

  chrome.windows.update(tab.windowId, {
    focused: true,
  });

  if (tab.id == undefined) {
    log("No tab id to send message to", tab);
    return;
  }

  await chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
      allFrames: true,
    },
    files: ["/dist/injectedScript.js"],
  });

  chrome.tabs.sendMessage(tab.id, {
    type: "cph-submit",
    problemName,
    languageId,
    sourceCode,
    url: problemUrl,
  });
  log("Sending message to tab with script");

  const filter = {
    url: [{ urlContains: "codeforces.com/problemset/status" }],
  };

  log("Adding nav listener");

  chrome.webNavigation.onCommitted.addListener((args) => {
    log("Navigation about to happen");

    if (args.tabId === tab.id) {
      log("Our tab is navigating");

      // const url = new URL(args.url);
      // const searchParams = new URLSearchParams(url.search);

      // if (searchParams.has("friends")) {
      //   return;
      // }

      // log("Navigating to friends mode");

      // chrome.tabs.update(args.tabId, { url: args.url + "?friends=on" });
    }
  }, filter);
};
