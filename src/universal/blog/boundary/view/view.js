import h from "react-hyperscript";
import React from "react";
import samStateIndicator from "../../../sam-state-indicator";

const SamStateIndicator = samStateIndicator("blog");

export default function Blog({
  model,
  actions,
  actionsDisabled,
  cancelDisabled,
  styles,
}) {
  const posts = model.posts.map(({ id, creator, created, message, deleted }) =>
    h("li", { key: id, className: deleted && styles.blogDeleted }, [
      h("p", { className: styles.blogMetaInfo }, `${creator} on ${created}:`),
      h("p", message),
      deleted
        ? undefined
        : h(
            "button",
            {
              onClick: () => {
                actions.deletePost({ id });
              },
            },
            "delete",
          ),
    ]),
  );

  return (
    <section>
      <SamStateIndicator styles={styles} />

      <p>
        User: {model.userName || "none"}
      </p>

      {model.userName
        ? <p>
            <button
              disabled={actionsDisabled}
              onClick={() => {
                actions.login({});
              }}
              className={styles.buttonFog}
            >
              Logout
            </button>
          </p>
        : <form
            onSubmit={event => {
              event.preventDefault();
              actions.login({
                userName: event.target.getElementsByTagName("input")[0].value,
              });
            }}
          >
            <input disabled={actionsDisabled} placeholder="Anton" />

            <br />
            <button disabled={actionsDisabled} className={styles.buttonFog}>
              Login
            </button>
          </form>}

      <br />
      <form
        onSubmit={event => {
          event.preventDefault();
          actions.post({
            message: event.target.getElementsByTagName("input")[0].value,
          });
          event.target.getElementsByTagName("input")[0].value = "";
        }}
      >
        <input disabled={actionsDisabled} placeholder="My two cents ..." />

        <br />
        <button disabled={actionsDisabled} className={styles.buttonFog}>
          Post!
        </button>

        <br />
        <button
          disabled={cancelDisabled}
          type="button"
          onClick={() => {
            actions.cancel();
          }}
          className={styles.cancelButtonFog}
        >
          Cancel
        </button>
      </form>

      <ul>
        {posts}
      </ul>
    </section>
  );
}
