import config from "./config";

/** Opens the codefoces submit page and injects script to submit code. */
export const handleSubmit = async (problemName: string, languageId: number, sourceCode: string) => {
  if (problemName === "" || languageId == -1 || sourceCode == "") {
    console.error("Ivalid arguments to handleSubmit");
    return;
  }

  const tab = await browser.tabs.create({
    active: true,
    url: config.cfSubmitPage.href,
  });

  await browser.tabs.executeScript(tab.id, {
    file: "/dist/injectedScript.js",
  });

  if (tab.id == undefined) {
    console.error("No tab id to send message to", tab);
    return;
  }

  browser.tabs.sendMessage(tab.id, {
    type: "cph-submit",
    problemName,
    languageId,
    sourceCode,
  });
  console.log("Sending message to tab with script");
  browser.windows.update(tab.windowId, {
    focused: true,
  });
};
