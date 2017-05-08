export function computeControlState(state) {
  if (Number.isInteger(state.count)) {
    if (state.count <= -2) return ["small", ["increase", "cancel"]];

    if (state.count >= 2) return ["big", ["decrease", "cancel"]];

    return ["default", ["increase", "decrease", "cancel"]];
  }
}

export function computeNextAction(controlState) {
  if (controlState === "small") return ["increase", { value: 6 }];

  if (controlState === "big") return ["decrease", { value: 3 }];
}
