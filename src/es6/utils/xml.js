export const XMLUtils = {
  removeCDATA: (str) => str.replace(/<!\[CDATA\[([^\]]+)]\]>/ig, "$1")
}