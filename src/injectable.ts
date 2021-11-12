import { ContentScriptData } from "./types";

export function injectProblem(data: ContentScriptData) {
    console.log("Handling submit message");
    const languageEl = document.getElementsByName("programTypeId")[0] as HTMLSelectElement;
    const sourceCodeEl = document.getElementById("sourceCodeTextarea") as HTMLTextAreaElement;
  
    sourceCodeEl.value = data.sourceCode;
    languageEl.value = data.languageId.toString();
  
  
    if (data.url.indexOf("contest") == -1) {
      const problemNameEl = document.getElementsByName("submittedProblemCode")[0] as HTMLInputElement;
      problemNameEl.value = data.problemName;
    }
    else {
      const problemIndexEl = document.getElementsByName("submittedProblemIndex")[0] as HTMLSelectElement;
      // Dont use problemName from data as it includes the contest number.
      const problemNumber = data.url.split("/problem/")[1];
      problemIndexEl.value = problemNumber;
    }
  
    console.log("Submitting problem");
    const submitBtn = document.querySelector(".submit") as HTMLButtonElement;
    submitBtn.disabled = false;
    submitBtn.click();
  };