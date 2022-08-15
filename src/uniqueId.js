export default (function () {
  const prefixes = { default: 0 };
  return (prefix) => {
    if (prefix) {
      if (!prefixes[prefix]) prefixes[prefix] = 0;
      prefixes[prefix] += 1;
      return `${prefix}-${prefixes[prefix]}`;
    }
    prefixes.default += 1;
    return `${prefixes.default}`;
  };
}());
