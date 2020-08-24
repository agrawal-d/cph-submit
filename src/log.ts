import config from "./config";

export default (...args: any) => {
  if (config.debug) {
    console.log(...args);
  }
};
