import { render, useState } from "../../src/index"

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  )
}

render(<App />, document.getElementById("app"))
