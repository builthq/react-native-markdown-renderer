import getUniqueID from './getUniqueID';

/**
 *
 * @param {{type: string, tag:string, content: string, children: *, attrs: Array}} token
 * @param {number} tokenIndex
 * @return {{type: string, content, tokenIndex: *, index: number, attributes: {}, children: *}}
 */
function createNode(token, tokenIndex) {
  let type = 'root';

  if (token) {
    if (!token.tag) {
      type = token.type;
    } else {
      type = token.tag;
    }
  }

  const content = token.content;
  let attributes = {};

  if (token.attrs) {
    attributes = token.attrs.reduce((prev, curr) => {
      const [name, value] = curr;
      return { ...prev, [name]: value };
    }, {});
  }

  if (token.type === 'video') {
    attributes.service = token.service;
    attributes.videoID = token.videoID;
  }

  return {
    type,
    sourceType: token.type,
    key: getUniqueID(),
    content,
    tokenIndex,
    index: 0,
    attributes,
    children: tokensToAST(token.children),
  };
}

/**
 *
 * @param {Array<{type: string, tag:string, content: string, children: *, attrs: Array}>}tokens
 * @return {Array}
 */
export default function tokensToAST(tokens) {
  let stack = [];
  let children = [];

  if (!tokens || tokens.length === 0) {
    return [];
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const astNode = createNode(token, i);

    if (!(astNode.type === 'text' && astNode.children.length === 0 && astNode.content === '')) {
      astNode.index = children.length;

      if (token.nesting === 1) {
        children.push(astNode);
        stack.push(children);
        children = astNode.children;
      } else if (token.nesting === -1) {
        children = stack.pop();
      } else if (token.nesting === 0 || token.type === 'video' || token.type === 'img') {
        children.push(astNode);
      }
    }
  }
  // console.log(children);

  return children;
}
