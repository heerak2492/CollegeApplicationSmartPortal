// jest.setup.ts
import "@testing-library/jest-dom";

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: jest.fn(),
});
