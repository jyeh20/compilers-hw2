import React, { useState } from "react";

import "./App.css";

function App() {
  const [inString, setInString] = useState("");
  const [out, setOut] = useState("");
  const [parseTree, setParseTree] = useState([]);
  const [tokenTree, setTokens] = useState([]);

  const PATTERN =
    /\-?\d+(\.\d+)?x?(?:\^\-?\d+)?(\+?\-?\d+(\.\d+)?x?(\^\-?\d+)?)*/g;
  const COEFFXANDEXP = /\d+(\.\d+)?\x\^\-?\d+/g;
  const COEFFX = /\d+(?:\.\d+)?\x/g;
  const COEFF = /\d+(?:\.\d+)?/g;
  const XANDEXP = /\x\^\-?\d+/g;
  const X = /\x/g;
  const EXP = /\^-?\d+/g;
  const MINUS = /\-/g;
  const PLUS = /\+/g;

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
    if (!inputStream.match(PATTERN)) {
      throw new SyntaxError("Unexpected Pattern");
    }
    let currentString = inputStream;
    let tokenIndex = 0;

    while (tokenIndex < currentString.length) {
      currentString = currentString.slice(tokenIndex).trim();

      if (currentString.match(MINUS)) {
        const matchedString = currentString.match(MINUS)[0];
        if (matchedString === currentString.slice(0, matchedString.length)) {
          tokenIndex = matchedString.length;

          yield new Operator(matchedString);
          continue;
        }
      }
      if (currentString.match(COEFFXANDEXP)) {
        const matchedString = currentString.match(COEFFXANDEXP)[0];
        if (matchedString === currentString.slice(0, matchedString.length)) {
          const termCoeff = matchedString.match(COEFF)[0];
          const termExp = matchedString.match(EXP)[0].slice(1);
          tokenIndex = matchedString.length;

          yield new Term(termCoeff, termExp);
          continue;
        }
      }
      if (currentString.match(COEFFX)) {
        const matchedString = currentString.match(COEFFX)[0];
        if (matchedString === currentString.slice(0, matchedString.length)) {
          const termCoeff = matchedString.match(COEFF)[0];
          tokenIndex = matchedString.length;

          yield new Term(termCoeff);
          continue;
        }
      }
      if (currentString.match(XANDEXP)) {
        const matchedString = currentString.match(XANDEXP)[0];
        if (matchedString === currentString.slice(0, matchedString.length)) {
          const termExp = matchedString.match(EXP)[0].slice(1);
          tokenIndex = matchedString.length;

          yield new Term(1, termExp);
          continue;
        }
      }
      if (currentString.match(X)) {
        const matchedString = currentString.match(X)[0];
        if (matchedString === currentString.slice(0, matchedString.length)) {
          tokenIndex = matchedString.length;

          yield new Term();
          continue;
        }
      }
      if (currentString.match(COEFF)) {
        const matchedString = currentString.match(COEFF)[0];
        if (matchedString === currentString.slice(0, matchedString.length)) {
          tokenIndex = matchedString.length;

          yield new Term(matchedString, 0);
          continue;
        }
      }
      if (currentString.match(PLUS)) {
        const matchedString = currentString.match(PLUS)[0];
        if (matchedString === currentString.slice(0, matchedString.length)) {
          tokenIndex = matchedString.length;

          yield new Operator(matchedString);
          continue;
        }
      }
      throw new SyntaxError("Unexpected token");
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
            throw new SyntaxError("Polynomial must end in a Term");
          }
          previousToken = tokenToCheck;
          return tokenToCheck;
        }
        throw new SyntaxError("Expected an Operator token");
      }
      return tokenToCheck;
    }

    function match(expected) {
      if (expected === undefined || at(expected)) {
        const consumedToken = token;
        token = tokenStream[index++];
        return consumedToken;
      }
      throw new SyntaxError(`Expected: ${expected}`, token);
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
      throw new SyntaxError("Expected an Operator");
    }

    function parseTerm() {
      if (at(token).constructor === Term) {
        const term = match();
        return term;
      }
      throw new SyntaxError("Expected a Term");
    }

    do {
      yield parseOperator();
    } while (index < tokenStream.length);
  }

  function differentiate(terms) {
    const termMap = terms.map(
      (t) => new Term(t.exponent * t.coefficient, t.exponent - 1)
    );
    if (termMap.length === 1 && termMap[0].coefficient === 0) {
      return "0";
    }
    let termString = "";
    for (let index = 0; index < termMap.length; index++) {
      const term = termMap[index];
      if (index !== 0) {
        if (term.coefficient > 0 && termString.length > 0) {
          termString += " + ";
        } else {
          termString += " ";
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

  function derivative(poly) {
    let tokens = undefined;
    let AST = undefined;
    try {
      tokens = [...tokenize(poly)];
    } catch (e) {
      console.log(e);
      return undefined;
    }

    try {
      AST = [...parse(tokens)];
    } catch (e) {
      console.log(e);
      return undefined;
    }
    setTokens(tokens);
    setParseTree(AST);
    return differentiate(AST);
  }

  const handleFunctionInput = (e) => {
    setInString(e.target.value);
    setOut(derivative(e.target.value));
  };

  return (
    <div className="App">
      <div className="App-input-prompt">
        Input a single-variable function with x as the variable:
      </div>
      <input
        className="App-input"
        autoComplete="off"
        id="input"
        onChange={handleFunctionInput}
      />
      <div>f(x) = {inString}</div>
      <div className="App-output" id="output">
        f'(x) = {out}
      </div>
      <div className="App-stream-container" id="streamContainer">
        <div className="App-token-stream" id="tokenStream">
          <div className="App-stream-header">Token Stream:</div>
          {tokenTree.map((tok) => (
            <div>{tok.toString()}</div>
          ))}
        </div>
        <div className="App-parse-tree" id="parseTree">
          <div className="App-stream-header">Parse Tree:</div>
          {parseTree.map((term) => (
            <div id="term">{term.toString()}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
