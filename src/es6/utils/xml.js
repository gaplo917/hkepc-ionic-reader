export const XMLUtils = {
  removeCDATA: (str) => {
    try {
      return str.replace(/<!\[CDATA\[([^\]]+)]\]>/gi, '$1')
    } catch (e) {
      return str
    }
  },
}
