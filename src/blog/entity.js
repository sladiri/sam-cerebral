import { wait } from "../util/control";

export const acceptFactory = db => {
  const accept = async ({ state, props }) => {
    await db.init;
    const blog = state.get();

    {
      if (Object.keys(blog).length === 0) {
        state.set("userName", "");

        const docs = (await db.local.allDocs()).rows
          .map(r => r.doc)
          .filter(d => d.type === "post");
        state.set("posts", docs);
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
      const { creator = blog.userName, created, message } = props;
      if (creator && created && message) {
        const newPost = {
          _id: `${created}-${creator}`,
          type: "post",
          message,
        };
        await db.local.put(newPost);
        state.push("posts", newPost);
      }
    }

    {
      const { deleteId } = props;
      if (deleteId) {
        const post = await db.local.get(deleteId);
        const [, creator] = post._id.split("-");
        if (creator === blog.userName) {
          post.deleted = !post.deleted;
          await db.local.put(post);
          const index = blog.posts.findIndex(p => p._id === deleteId);
          state.set(`posts.${index}.deleted`, post.deleted);
        }
        await wait(1000);
      }
    }

    await wait(200);
  };
  return accept;
};

export const computeControlState = blog => {
  if (!blog.posts || blog.posts.length === 0) {
    return [["empty", ["postSystem"]]];
  }

  return [
    [
      "normal",
      blog.userName
        ? ["logout", "postSystem", "post", "deletePost", "cancel"]
        : ["login", "postSystem", "deletePost"],
    ],
  ];
};

export const computeNextAction = controlState => {
  if (controlState === "empty") {
    return [
      [
        [
          "postSystem",
          { creator: "system", message: "Example post ... add more posts!" },
        ],
      ],
    ];
  }
};
