export function computeControlState(model) {
  if (Number.isInteger(model.count)) {
    if (model.count <= -2) return ["small", ["increase", "cancel"]];

    if (model.count >= 2) return ["big", ["decrease", "cancel"]];

    return ["normal", ["increase", "decrease", "cancel"]];
  }
}

export function computeNextAction(controlState) {
  // if (controlState === "small") return ["increase", { value: 5 }];
  // if (controlState === "big") return ["decrease", {}];
  // return ["tick", {}];
}
