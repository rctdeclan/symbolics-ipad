import { render } from "@testing-library/react";
import { App } from "./App.jsx";

test("renders the stage", () => {
  const { container } = render(<App />);
  expect(container.querySelector("svg")).toBeInTheDocument();
});
