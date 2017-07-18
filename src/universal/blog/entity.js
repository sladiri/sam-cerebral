// import { wait } from "../util";
import { pouchDbFactory } from "../pouchdb";

export const defaultState = {};

const db = pouchDbFactory({
  inMemory: true,
  remoteDbHost: "http://localhost:5984",
  remoteDbName: "blogposts",
  localDbName: "local_blogposts",
});

export async function accept({ state, props }) {
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
    }
  }
}

export function computeControlState(blog) {
  const states = [];

  if (!blog.posts || blog.posts.length === 0) {
    states.push(["empty", ["login", "postSystem", "cancel"]]);
  } else if (blog.userName) {
    states.push([
      "loggedIn",
      ["logout", "postSystem", "post", "deletePost", "cancel"],
    ]);
  } else {
    states.push(["loggedOut", ["login", "postSystem", "cancel"]]);
  }

  return states;
}

export function computeNextAction(controlState) {
  const nextActions = [];

  if (controlState === "empty") {
    nextActions.push([
      "postSystem",
      { creator: "system", message: "Example post ... add more posts!" },
    ]);
  }

  return [nextActions];
}
