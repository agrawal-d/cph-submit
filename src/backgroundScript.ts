import config from "./config";
import { CphSubmitResponse, CphEmptyResponse } from "./types";
import { handleSubmit } from "./handleSubmit";

const mainLoop = async () => {
  let cphResponse;
  try {
    const headers = new Headers();
    headers.append("cph-submit", "true");

    const request = new Request(config.cphServerEndpoint.href, {
      method: "GET",
      headers,
    });

    cphResponse = await fetch(request);
  } catch (err) {
    console.log("Error while fetching cph response", err);
    return;
  }

  if (!cphResponse.ok) {
    console.log("Error while fetching cph response", cphResponse);
    return;
  }

  const response: CphSubmitResponse | CphEmptyResponse = await cphResponse.json();

  if (response.empty) {
    console.log("Got empty valid response from CPH");

    return;
  }

  console.log("Got non-empty valid response from CPH");
  handleSubmit(response.problemName, response.languageId, response.sourceCode);
};

setInterval(mainLoop, config.loopTimeOut);
