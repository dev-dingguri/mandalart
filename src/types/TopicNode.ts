export type TopicNode = {
  text: string;
  children: TopicNode[];
};

export const parseTopicNode = (json: string) => {
  return JSON.parse(json) as TopicNode;
};

export const cloneTopicNode = (node: TopicNode) => {
  return parseTopicNode(JSON.stringify(node));
};
