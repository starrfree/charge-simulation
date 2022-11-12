function getPosition(t, expressionX, expressionY) {
  with (Math) {
    try {
      return {
        x: eval(expressionX),
        y: eval(expressionY),
      }
    } catch (e) {
      return undefined
    }
  }
}

function checkExpression(t, expression) {
  with (Math) {
    try {
      eval(expression)
      return true
    } catch (e) {
      return false
    }
  }
}