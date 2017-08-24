import { wait } from "../util/control";

const getPosts = async db => {
  const docs = await db.getAll();
  return docs.rows
    .filter(row => row.doc && row.doc.type === "post")
    .map(row => row.doc);
};

export const accept = async ({ db, state, props }) => {
  {
    const { posts } = state.get();
    if (!Array.isArray(posts)) {
      state.set("userName", "");
      state.set("posts", await getPosts(db));
    }
  }

  {
    const { refresh } = props;
    if (refresh) {
      state.set("posts", await getPosts(db));
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
    const { userName } = state.get();
    const { creator = userName, created, message, parentId } = props;
    if (creator && created && message && parentId !== undefined) {
      let parentMessage;
      if (parentId) {
        const { posts } = state.get();
        const parent = posts.find(post => post._id === parentId);
        parentMessage = parent && `${parent.message.substr(0, 20)}...`;
      }
      const newPost = {
        _id: `${created}-${creator}`,
        type: "post",
        creator,
        message,
        parentMessage,
        inResponseTo: parentId !== null ? [parentId] : [],
      };
      await db.put({ data: newPost });
      const updatedPosts = await getPosts(db);
      const index = updatedPosts.findIndex(post => post._id === newPost._id);
      state.set(`posts.${index}`, updatedPosts[index]);
    }
  }

  {
    const { deleteId } = props;
    if (deleteId) {
      const { posts } = state.get();
      const post = posts.find(p => p._id === deleteId);
      const [, creator] = post._id.split("-");
      const { userName } = state.get();
      if (userName === "system" || creator === userName) {
        const deleted = !post.deleted;
        await db.put({ data: { ...post, deleted } });
        const updatedPosts = await getPosts(db);
        const index = updatedPosts.findIndex(post => post._id === deleteId);
        state.set(`posts.${index}.deleted`, updatedPosts[index].deleted);
      }
      await wait(1000);
    }
  }

  {
    const { clearDb } = props;
    if (clearDb) {
      await db.removeAll();
      state.set("posts", await getPosts(db));
    }
  }

  await wait(200);
};

export const computeStateRepresentation = state => {
  const blog = state.get();

  if (blog.posts.length === 0) {
    return [["emptyExample", ["post", "refresh"]]];
  }

  if (blog.posts.length === 1 && blog.posts[0].creator === "system") {
    return [["replyExample", ["post", "refresh"]]];
  }

  return [
    [
      "normal",
      [
        blog.userName ? "logout" : "login",
        "post",
        "deletePost",
        "clearDb",
        "refresh",
        "cancel",
      ],
    ],
  ];
};

export const computeNextAction = (controlState, blog) => {
  if (controlState === "emptyExample") {
    return [
      [
        [
          "post",
          { creator: "system", message: "Example post, add more posts!" },
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
            parentId: blog.posts[0]._id,
            creator: "system",
            message: "Example reply!",
          },
        ],
      ],
    ];
  }
};
