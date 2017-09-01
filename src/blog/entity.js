import { uniq } from "ramda";

import { wait } from "../util/control";
import { canDelete, canVote } from "./control/validation";

const getPosts = async db => {
  const docs = await db.getAll();
  return docs.rows
    .filter(row => row.doc && row.doc.type === "post")
    .map(row => row.doc);
};

const createPost = async (db, state, props) => {
  const { userName } = state.get();
  const { creator = userName, message, parentId } = props;
  if (creator && message && parentId !== undefined) {
    const created = Date.now();
    let parent;
    if (parentId) {
      const { posts } = state.get();
      parent = posts.find(post => post._id === parentId);
    }
    const newPost = {
      _id: `${created}-${creator}`,
      type: "post",
      created,
      creator,
      message,
      parentMessage: parent && parent.message,
      happenedAfter:
        parentId !== null ? [...parent.happenedAfter, parentId] : [],
      vote: { value: 0, happenedAfter: [] },
      voteList: [],
    };
    await db.put({ data: newPost });
    const updatedPosts = await getPosts(db);
    const index = updatedPosts.findIndex(post => post._id === newPost._id);
    state.set(`posts.${index}`, updatedPosts[index]);
  }
};

const updatePost = async (db, state, props) => {
  const { id, update } = props;
  if (id && update) {
    const { userName } = state.get();
    const { posts } = state.get();
    const postIndex = posts.findIndex(p => p._id === id);
    const post = posts[postIndex];
    await deletePost();
    await votePost();

    async function deletePost() {
      if (update.deleted !== undefined && canDelete(userName, post)) {
        const { doc: updated } = await db.put({
          data: { ...post, ...update },
        });
        state.set(`posts.${postIndex}`, updated);
      }
    }

    async function votePost() {
      if (update.vote && canVote(userName, post)) {
        post.voteList.push(userName);
        post.vote.value += update.vote;
        const thread = [];
        post.happenedAfter = uniq([...post.happenedAfter, ...thread]);
        const { doc: updated } = await db.put({ data: post });
        state.set(`posts.${postIndex}`, updated);
      }
    }
  }
};

export const accept = async ({ db, state, props }) => {
  {
    const { posts } = state.get();
    if (!Array.isArray(posts)) {
      state.set("userName", "Sladi"); // Easier dev
      state.set("posts", await getPosts(db));
    }
  }

  {
    const { posts } = props;
    if (posts) {
      state.set("posts", posts);
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
    }
  }

  await createPost(db, state, props);

  await updatePost(db, state, props);

  await wait(1000);
};

export const computeStateRepresentation = state => {
  const blog = state.get();

  if (blog.posts.length === 0) {
    return [["emptyExample", ["refresh", "post"]]];
  }

  if (blog.posts.length === 1 && blog.posts[0].creator === "system") {
    return [["replyExample", ["refresh", "post"]]];
  }

  return [
    [
      "normal",
      [
        blog.userName ? "logout" : "login",
        "refresh",
        "cancel",
        "post",
        "deletePost",
        "vote",
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
