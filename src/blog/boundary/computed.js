import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const model = compute(
  state`blog.userName`,
  state`blog.posts`,
  (userName, posts = []) => {
    posts = posts.map(
      ({ _id, message, deleted, happenedAfter: { _id: parentId } = {} }) => {
        const [created, creator] = _id.split("-");
        const parent = parentId && posts.find(p => p._id === parentId);
        return {
          id: _id,
          creator,
          created: new Date(Number.parseInt(created)).toLocaleString(),
          message,
          deleted,
          replyTo: parent && parent.message.substr(0, 20),
        };
      },
    );
    return {
      userName,
      posts,
    };
  },
);
