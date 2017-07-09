import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const model = compute(get => ({
  userName: get(state`blog.userName`),
  posts: (get(state`blog.posts`) || []).map(({ _id, message, deleted }) => {
    const [created, creator] = _id.split("-", 2);
    return {
      id: _id,
      creator,
      created: new Date(Number.parseInt(created)).toLocaleString(),
      message,
      deleted,
    };
  }),
}));
