import { wait } from "../util/control";

export const accept = async ({ db, state, props }) => {
  const blog = state.get();

  {
    if (!blog.posts) {
      state.set("userName", "");

      const { docs } = await db.allDocs();
      const posts = docs.rows.map(r => r.doc).filter(d => d.type === "post");
      state.set("posts", posts);
    }
  }

  {
    const { userName } = props;
    if (userName !== undefined) {
      state.set("userName", userName === null ? "" : userName);
      await wait(1000);
    }
  }

  {
    const { posts } = props;
    if (posts) {
      state.set("posts", posts);
    }
  }

  {
    const { creator = blog.userName, created, message, replyId } = props;
    if (creator && created && message && replyId !== undefined) {
      const newPost = {
        _id: `${created}-${creator}`,
        type: "post",
        creator,
        message,
        happenedAfter: replyId,
      };
      await db.post({ data: newPost });
      state.push("posts", newPost);
    }
  }

  {
    const { deleteId } = props;
    if (deleteId) {
      const { doc: post } = await db.get({ id: deleteId });
      const [, creator] = post._id.split("-");
      if (creator === blog.userName) {
        const deleted = !post.deleted;
        await db.put({ data: { ...post, deleted } });
        const index = blog.posts.findIndex(p => p._id === deleteId);
        state.set(`posts.${index}.deleted`, deleted);
      }
      await wait(1000);
    }
  }

  await wait(200);
};

export const computeControlState = blog => {
  if (blog.posts.length === 0) {
    return [["emptyExample", ["post"]]];
  }

  if (blog.posts.length === 1 && blog.posts[0].creator === "system") {
    return [["replyExample", ["post"]]];
  }

  return [
    [
      "normal",
      [blog.userName ? "logout" : "login", "post", "deletePost", "cancel"],
    ],
  ];
};

export const computeNextAction = (controlState, blog) => {
  if (controlState === "emptyExample") {
    return [
      [
        [
          "post",
          { creator: "system", message: "Example post ... add more posts!" },
        ],
      ],
    ];
  }

  if (controlState === "replyExample") {
    return [
      [
        [
          "post",
          {
            replyId: blog.posts[0]._id,
            creator: "system",
            message: "Example reply!",
          },
        ],
      ],
    ];
  }
};
