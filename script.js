const inputBox = document.querySelector("input");
const answerDiv = document.querySelector("#result");

class Term {
  constructor(coefficient = 1, exponent = 1) {
    this.coefficient = Number(coefficient);
    this.exponent = Number(exponent);
  }

  toString() {
    return `Term: {coefficient: ${this.coefficient}, hasX: ${this.hasX} exponent: ${this.exponent}}`;
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

  // const tokensArr =  [...sourceCode.matchAll(pattern)]
  let currentString = inputStream;
  let tokenIndex = 0;

  while (tokenIndex < currentString.length) {
    currentString = currentString.slice(tokenIndex).trim();
    console.log(`\nToken Index ${tokenIndex}`);
    console.log(`Spliced String: ${currentString}`);

    console.log(`Matches: [
    coeffXAndExp: ${currentString.match(coeffXAndExp)},
    coeffX: ${currentString.match(coeffX)},
    coeff: ${currentString.match(coeff)},
    xAndExp: ${currentString.match(xAndExp)},
    x: ${currentString.match(x)},
    exp: ${currentString.match(exp)},
    minus: ${currentString.match(minus)},
    plus: ${currentString.match(plus)},
    ]\n
    `);
    if (currentString.match(minus)) {
      console.log("Minus MATCH FOUND");
      const matchedString = currentString.match(minus)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        console.log(`Yiedling Minus: [${matchedString}]`);
        tokenIndex = matchedString.length;

        yield new Operator(matchedString);
        continue;
      }
    }
    if (currentString.match(coeffXAndExp)) {
      console.log("COEFFXANDEXP MATCH FOUND");
      const matchedString = currentString.match(coeffXAndExp)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        console.log(`Yielding coeffXAndExp: [${matchedString}]`);
        const termCoeff = matchedString.match(coeff)[0];
        const termExp = matchedString.match(exp)[0].slice(1);
        tokenIndex = matchedString.length;

        yield new Term(termCoeff, termExp);
        continue;
      }
    }
    if (currentString.match(coeffX)) {
      // coeffs no exponent
      console.log("COEFFX MATCH FOUND");
      const matchedString = currentString.match(coeffX)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        console.log(`Yielding CoeffX: [${matchedString}]`);
        const termCoeff = matchedString.match(coeff)[0];
        tokenIndex = matchedString.length;

        yield new Term(termCoeff);
        continue;
      }
    }
    if (currentString.match(xAndExp)) {
      console.log("XANDEXP");
      const matchedString = currentString.match(xAndExp)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        console.log(`Yielding xAndExp: [${matchedString}]`);
        const termExp = matchedString.match(exp)[0].slice(1);
        tokenIndex = matchedString.length;

        yield new Term(1, termExp);
        continue;
      }
    }
    if (currentString.match(x)) {
      console.log("X MATCH FOUND");
      const matchedString = currentString.match(x)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        console.log(`Yielding x: [${matchedString}]`);
        tokenIndex = matchedString.length;

        yield new Term();
        continue;
      }
    }
    if (currentString.match(coeff)) {
      // coeffs no x
      console.log("COEFF MATCH FOUND");
      const matchedString = currentString.match(coeff)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        console.log(`Yiedling Coeff: [${matchedString}]`);
        tokenIndex = matchedString.length;

        yield new Term(matchedString, 0);
        continue;
      }
    }
    if (currentString.match(plus)) {
      console.log("PLUS MATCH FOUND");
      const matchedString = currentString.match(plus)[0];
      if (matchedString === currentString.slice(0, matchedString.length)) {
        console.log(`Yielding Plus: [${matchedString}]`);
        tokenIndex = matchedString.length;

        yield new Operator(matchedString);
        continue;
      }
    }
    throw "LEXING ERROR";
    return;
  }
  console.log("============================done============================\n");
}

inputBox.addEventListener("input", () => {
  let i = [...tokenize(inputBox.value.toLowerCase())];
  i.forEach((m) => console.log(m));
  answerDiv.textContent = i;
  // let it = tokenize(inputBox.value)
});
