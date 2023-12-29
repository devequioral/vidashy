const getError = (err) =>
  err.response && err.response.data && err.response.data.message
    ? err.response.data.message
    : err.message;

const consoleError = (...args) => {
  args.forEach((err) => {
    console.error(`\x1b[41m ${err} \x1b[30m\x1b[0m`);
  });
};

//CONSOLE WARNING
const consoleWarning = (...args) => {
  args.forEach((err) => {
    console.warn(`\x1b[43m ${err} \x1b[30m\x1b[0m`);
  });
};
export { getError, consoleError, consoleWarning };
