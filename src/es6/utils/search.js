const searchKeywordIndex = (str, keyword, indexArr = []) => {
  const lastIndexPos = indexArr.length === 0 ? 0 : indexArr[indexArr.length - 1] + 1
  const index = str.indexOf(keyword, lastIndexPos)
  if (index === -1 || !str || !keyword) {
    return indexArr
  } else {
    return searchKeywordIndex(str, keyword, indexArr.concat([index]))
  }
}

const searchBraceIndex = (str, indexArr = []) => {
  return searchKeywordIndex(str, '<')
    .concat(searchKeywordIndex(str, '>'))
    .sort((a, b) => a - b)
}

const isIndexInBrace = (content, bracePos, index) => {
  switch (bracePos.length) {
    case 0:
      return false
    case 1:
      return false
    default:
      return (
        (content[bracePos[0]] === '<' && content[bracePos[1]] === '>' && index > bracePos[0] && index < bracePos[1]) ||
        isIndexInBrace(content, bracePos.slice(2), index)
      )
  }
}

const breakContent = (content, len, validIndexes, prevPos = 0, splits = []) => {
  switch (validIndexes.length) {
    case 0:
      // concat the rest of the content
      return splits.concat([content.slice(Math.min(prevPos, content.length))])
    default:
      const contentIndex = validIndexes[0]
      // break down into two part
      const s = splits.concat([content.slice(prevPos, contentIndex), content.slice(contentIndex, contentIndex + len)])
      return breakContent(content, len, validIndexes.slice(1), contentIndex + len, s)
  }
}

const mergeAndInjectHightLightContent = (splits, hlContent = '') => {
  switch (splits.length) {
    case 0:
      return hlContent
    case 1:
      return `${hlContent}${splits[0]}`
    default:
      const merged = `${hlContent}${splits[0]}<span class="search-highlight">${splits[1]}</span>`
      return mergeAndInjectHightLightContent(splits.slice(2), merged)
  }
}

const searchAndInjectHighlightBetweenKeyword = (content, keyword) => {
  // find all brace for identify the html tag
  const bracePos = searchBraceIndex(content)

  // search the keyword position
  const validIndexes = searchKeywordIndex(content.toLowerCase(), keyword.toLowerCase()).filter(
    (index) => !isIndexInBrace(content, bracePos, index)
  ) // we do not want accidentally search the html tag

  return {
    matches: validIndexes.length,
    hlContent: mergeAndInjectHightLightContent(breakContent(content, keyword.length, validIndexes)),
  }
}

export const searchMultipleKeyword = (keywordArr, contentToSearch, result = { matches: 0 }) => {
  switch (keywordArr.length) {
    case 0:
      return result.hlContent ? result : { matches: 0, hlContent: contentToSearch }
    default:
      const title = angular
        .element('<div/>')
        .html(result.hlContent || contentToSearch)
        .html()
      const [keyword, ...tail] = keywordArr

      const { matches, hlContent } = searchAndInjectHighlightBetweenKeyword(title, keyword)

      result = {
        matches: result.matches + matches,
        hlContent,
      }

      return searchMultipleKeyword(tail, contentToSearch, result)
  }
}
