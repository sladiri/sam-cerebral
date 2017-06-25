import { wait } from "../util";

export const defaultState = {
  money: 100,
  card: false,
  pin: 0,
};

// Could be implemented as virtual FSM?
export async function accept({ state, props }) {
  const atm = state.get("atm");
  const { abort, card, pin, moneyIncrement } = props;

  if (abort === true || (atm.card && card === false)) {
    state.set("atm.card", false);
    state.set("atm.pin", 0);
    return;
  }

  if (!atm.card && card === true) {
    state.set("atm.card", card);
    state.set("atm.pin", 0);
  }

  if (atm.card && Number.isSafeInteger(pin)) {
    state.set("atm.pin", pin);
  }

  if (atm.pin && Number.isInteger(moneyIncrement)) {
    const newBalance = atm.money + moneyIncrement;

    if (Number.isSafeInteger(newBalance) && newBalance >= 0) {
      state.set("atm.money", newBalance);
    }
  }
}
