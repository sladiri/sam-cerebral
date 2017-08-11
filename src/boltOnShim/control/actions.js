import { uniqBy } from "ramda";

export default dbPromise => {
  let db;

  const init = async () => {
    db = await dbPromise;
  };

  const allDocs = async ({ props } = {}) => {
    const options = (props && props.options) || {};
    const defaultOptions = {
      include_docs: true,
      conflicts: true,
      ...options,
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

  const getMany = async ({ props: { ids } }) => {
    return {
      docMany: await db.allDocs({ keys: ids }),
    };
  };

  const put = async ({ props: { data } }) => {
    const { inResponseTo } = data;
    let previous;
    if (inResponseTo.length === 1) {
      const [previousId] = inResponseTo;
      const { doc } = await get({ props: { id: previousId } });
      previous = previousId;
      console.log("previous", previous);
    }
    if (previous) {
      data.inResponseTo.push(previous);
      data.inResponseTo = uniqBy(x => x, data.inResponseTo);
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

  return { init, allDocs, get, getMany, put, deleteAll };
};
