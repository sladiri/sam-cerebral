import { wait } from "../util";

export async function init({ db }) {
  await db.foo();
  const david = await db.local.get("dave@gmail.com").catch(e => e);
  console.log("entity", david);

  if (!david.error) return { david };
}

export async function increase({ props: { value = 1 } }) {
  return await wait(1500, { increment: value });
}

export async function decrease({ props: { value = 1 } }) {
  return await wait(1500, { increment: value * -1 });
}

export async function cancel() {
  return await wait(100, { cancel: true });
}
