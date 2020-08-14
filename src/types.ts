export type CphEmptyResponse = {
  empty: true;
};

export type CphSubmitResponse = {
  empty: false;
  problemName: string;
  sourceCode: string;
  languageId: number;
};

export type ContentScriptData = {
  type: "cph-submit";
} & CphSubmitResponse;
