import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const model = compute(
  state`blog.userName`,
  state`blog.posts`,
  (userName, posts = []) => ({
    userName,
    posts: posts.map(({ _id, message, deleted }) => {
      const [created, creator] = _id.split("-");
      return {
        id: _id,
        creator,
        created: new Date(Number.parseInt(created)).toLocaleString(),
        message,
        deleted,
      };
    }),
  }),
);
