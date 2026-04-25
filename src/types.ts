export type CphEmptyResponse = {
    empty: true;
};

export type CphSubmitResponse = {
    empty: false;
    problemName: string;
    url: string;
    sourceCode: string;
    languageId: number;
};

export type ContentScriptData = {
    type: 'cph-submit';
    problemIndex: string | null;
    submitByIndex: boolean;
} & CphSubmitResponse;
