import config from "./config";
import log from "./log";

/** Opens the codefoces submit page and injects script to submit code. */
export const handleSubmit = async (problemName: string, languageId: number, sourceCode: string) => {
  if (problemName === "" || languageId == -1 || sourceCode == "") {
    log("Ivalid arguments to handleSubmit");
    return;
  }

  const tab = await browser.tabs.create({
    active: true,
    url: config.cfSubmitPage.href,
  });

  browser.windows.update(tab.windowId, {
    focused: true,
  });

  if (tab.id == undefined) {
    log("No tab id to send message to", tab);
    return;
  }

  await browser.tabs.executeScript(tab.id, {
    file: "/dist/injectedScript.js",
  });

  browser.tabs.sendMessage(tab.id, {
    type: "cph-submit",
    problemName,
    languageId,
    sourceCode,
  });
  log("Sending message to tab with script");
};
