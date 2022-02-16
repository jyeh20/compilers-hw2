class Term {
  constructor(coefficient = 1, exponent = 1) {
    this.coefficient = Number(coefficient);
    this.exponent = Number(exponent);
  }

  toString() {
    return `Term: {coefficient: ${this.coefficient}, exponent: ${this.exponent}}`;
  }
}

class Operator {
  constructor(lexeme) {
    this.lexeme = lexeme;
  }

  toString() {
    return `Operator: {lexeme: ${this.lexeme}}`;
  }
}

function* tokenize(inputStream) {
  const coeffXAndExp = /\d+(\.\d+)?\x\^\-?\d+/g;
  const coeffX = /\d+(?:\.\d+)?\x/g;
  const coeff = /\d+(?:\.\d+)?/g;
  const xAndExp = /\x\^\-?\d+/g;
  const x = /\x/g;
  const exp = /\^-?\d+/g;
  const minus = /\-/g;
  const plus = /\+/g;

  let currentString = inputStream;
  let tokenIndex = 0;

  while (tokenIndex < currentString.length) {
    currentString = currentString.slice(tokenIndex).trim();

    if (currentString.match(minus)) {
      //   console.log("Minus MATCH FOUND");
      const matchedString = currentString.match(minus)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        tokenIndex = matchedString.length;

        yield new Operator(matchedString);
        continue;
      }
    }
    if (currentString.match(coeffXAndExp)) {
      const matchedString = currentString.match(coeffXAndExp)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        const termCoeff = matchedString.match(coeff)[0];
        const termExp = matchedString.match(exp)[0].slice(1);
        tokenIndex = matchedString.length;

        yield new Term(termCoeff, termExp);
        continue;
      }
    }
    if (currentString.match(coeffX)) {
      const matchedString = currentString.match(coeffX)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        const termCoeff = matchedString.match(coeff)[0];
        tokenIndex = matchedString.length;

        yield new Term(termCoeff);
        continue;
      }
    }
    if (currentString.match(xAndExp)) {
      const matchedString = currentString.match(xAndExp)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        const termExp = matchedString.match(exp)[0].slice(1);
        tokenIndex = matchedString.length;

        yield new Term(1, termExp);
        continue;
      }
    }
    if (currentString.match(x)) {
      const matchedString = currentString.match(x)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        tokenIndex = matchedString.length;

        yield new Term();
        continue;
      }
    }
    if (currentString.match(coeff)) {
      const matchedString = currentString.match(coeff)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        tokenIndex = matchedString.length;

        yield new Term(matchedString, 0);
        continue;
      }
    }
    if (currentString.match(plus)) {
      const matchedString = currentString.match(plus)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        tokenIndex = matchedString.length;

        yield new Operator(matchedString);
        continue;
      }
    }
    throw "LEXING ERROR";
    return;
  }
}

function* parse(tokenStream) {
  let index = 0;
  let token = tokenStream[index++];
  let previousToken = undefined;

  function at(tokenToCheck) {
    if (tokenToCheck.constructor === Term) {
      if (
        previousToken === undefined ||
        previousToken.constructor === Operator
      ) {
        previousToken = tokenToCheck;
        return tokenToCheck;
      }
    }

    if (tokenToCheck.constructor === Operator) {
      if (previousToken === undefined || previousToken.constructor === Term) {
        if (index === tokenStream.length) {
          throw "Polynomial must end in a Term";
        }
        previousToken = tokenToCheck;
        return tokenToCheck;
      }
      throw "Expected an Operator token";
    }
    return tokenToCheck;
  }

  function match(expected) {
    if (expected === undefined || at(expected)) {
      const consumedToken = token;
      token = tokenStream[index++];
      return consumedToken;
    }
    throw (`Expected: ${expected}`, token);
  }

  function parseOperator() {
    if (at(token).constructor === Operator) {
      const op = match().lexeme;
      const term = parseTerm();
      if (op === "-") {
        term.coefficient *= -1;
      }
      return term;
    } else if (at(token).constructor === Term) {
      return parseTerm();
    }
    throw "Expected an Operator";
  }

  function parseTerm() {
    if (at(token).constructor === Term) {
      const term = match();
      return term;
    }
    throw "Expected a Term";
  }

  do {
    yield parseOperator();
  } while (index < tokenStream.length);
}

function differentiate(terms) {
  const termMap = terms.map(
    (t) => new Term(t.exponent * t.coefficient, t.exponent - 1)
  );

  // Edge Cases
  if (termMap.length === 1 && termMap[0].coefficient === 0) {
    return "0";
  }

  let termString = "";

  for (let index = 0; index < termMap.length; index++) {
    const term = termMap[index];
    if (index !== 0) {
      if (term.coefficient > 0 && termString.length > 0) {
        termString += "+";
      }
    }
    if (term.coefficient !== 0) {
      termString += term.coefficient;
      if (term.exponent !== 0) {
        if (term.exponent === 1) {
          termString += "x";
        } else {
          termString += `x^${term.exponent}`;
        }
      }
    }
  }

  return termString;
}

export default function derivative(poly) {
  return differentiate([...parse([...tokenize(poly)])]);
}
