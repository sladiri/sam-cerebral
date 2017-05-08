export function computeControlState(state) {
  if (Number.isInteger(state.count)) {
    if (state.count <= -2) return ["small", ["increaseClicked", "cancel"]];

    if (state.count >= 2) return ["big", ["decreaseClicked", "cancel"]];

    return ["default", ["increaseClicked", "decreaseClicked", "cancel"]];
  }
}

export function computeNextAction(controlState) {
  if (controlState === "small") return ["increaseClicked", { value: 6 }];

  if (controlState === "big") return ["decreaseClicked", { value: 3 }];
}
