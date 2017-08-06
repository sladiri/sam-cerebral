export default dbPromise => {
  let db;

  const init = async () => {
    db = await dbPromise;
  };

  const allDocs = async () => {
    const defaultOptions = {
      include_docs: true,
      conflicts: true,
    };
    return {
      docs: await db.allDocs(defaultOptions),
    };
  };

  const get = async ({ props: { id } }) => {
    const defaultOptions = {
      revs: true,
      revs_info: true,
      conflicts: true,
    };
    return {
      doc: await db.get(id, defaultOptions),
    };
  };

  const put = async ({ props: { data } }) => {
    const { happenedAfter } = data;
    if (happenedAfter) {
      const id =
        typeof happenedAfter === "string" ? happenedAfter : happenedAfter._id;
      const { doc: previous } = await get({
        props: { id },
      });
      data.happenedAfter = previous;
    } else {
      data.happenedAfter = undefined;
    }
    const payload = {
      updated: Date.now(),
      ...data,
    };
    return {
      ...(await db.put(payload)),
      ...(await allDocs()),
      ...(await get({ props: { id: payload._id } })),
    };
  };

  const deleteAll = async () => {
    const docs = await db.allDocs();
    await Promise.all(docs.rows.map(row => db.remove(row.id, row.value.rev)));
    return {
      ...(await allDocs()),
    };
  };

  return { init, allDocs, get, put, deleteAll };
};
