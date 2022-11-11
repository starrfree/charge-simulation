function getPosition(t, expressionX, expressionY) {
  with (Math) {
    return {
      x: eval(expressionX),
      y: eval(expressionY),
    }
  }
}