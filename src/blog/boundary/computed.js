import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const model = compute(
  state`blog.userName`,
  state`blog.posts`,
  (userName, posts = []) => {
    posts = posts.map(({ _id, message, deleted, parentMessage }) => {
      const [created, creator] = _id.split("-");
      return {
        id: _id,
        creator,
        created: new Date(Number.parseInt(created)).toLocaleString(),
        message,
        deleted,
        parentMessage,
      };
    });
    return {
      userName,
      posts,
    };
  },
);
