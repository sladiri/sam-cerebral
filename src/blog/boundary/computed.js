import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const model = compute(
  state`blog.userName`,
  state`blog.posts`,
  (userName, posts = []) => {
    posts = posts.map(post => {
      return {
        ...post,
        created: new Date(Number.parseInt(post.created)).toLocaleString(),
        parentMessage:
          post.parentMessage && `${post.parentMessage.substr(0, 15)}...`,
        vote: post.vote.value,
      };
    });
    return {
      userName,
      posts,
    };
  },
);
