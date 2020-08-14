import { ContentScriptData } from "./types";

console.log("cph-submit script injected");

const handleData = (data: ContentScriptData) => {
  const problemNameEl = document.getElementsByName("submittedProblemCode")[0] as HTMLInputElement;
  const languageEl = document.getElementsByName("programTypeId")[0] as HTMLSelectElement;
  const sourceCodeEl = document.getElementById("sourceCodeTextarea") as HTMLTextAreaElement;
  const submitBtn = document.querySelector('input[type="submit"]') as HTMLButtonElement;

  problemNameEl.value = data.problemName;
  languageEl.value = data.languageId.toString();
  sourceCodeEl.value = data.sourceCode;

  console.log("Submitting problem");
  submitBtn.click();
};

console.log("Adding event listener", browser);
browser.runtime.onMessage.addListener((data: any, sender: any) => {
  console.log("Got message", data, sender);
  if (data.type == "cph-submit") {
    handleData(data);
  }
});
