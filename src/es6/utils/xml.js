export const XMLUtils = {
  removeCDATA: (str) => {
    try {
      return str.replace(/<!\[CDATA\[([^\]]+)]\]>/ig, "$1")
    } catch (e) {
      return str
    }
  }
}