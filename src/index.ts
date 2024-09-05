export type MockedInterface<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer B
    ? jest.Mock<B, A>
    : MockedInterface<T[K]>;
};
type Target<T> = { [K in keyof T]?: MockedInterface<T[K]> };

// jest.fn() returned object keys
export const jestFnKeys: Record<string, boolean> = Object.freeze({
  _isMockFunction: true,
  getMockImplementation: true,
  mock: true,
  mockClear: true,
  mockReset: true,
  mockRestore: true,
  mockReturnValueOnce: true,
  mockResolvedValueOnce: true,
  mockRejectedValueOnce: true,
  mockReturnValue: true,
  mockResolvedValue: true,
  mockRejectedValue: true,
  mockImplementationOnce: true,
  mockImplementation: true,
  mockReturnThis: true,
  mockName: true,
  getMockName: true,
});

// Property key from jest.fn()
const _IS_MOCK_FUNCTION = '_isMockFunction';
// Key for toString() method of Object instances returns a string representing this object
const TO_STRING = 'toString';

// Props to be ignored are any keys in jest.fn excluding "toString" which is an implicit property of any object
export function shouldGetRealValue(prop: unknown, isMockFunctionAccess: boolean, lastCalledProp?: unknown): boolean {
  // Is part of "_isMockFunction" object access
  if (isMockFunctionAccess) {
    return true;
  }
  if(isJestTryingToSpyCheck(prop, lastCalledProp)){
    return true
  }
  // Is a prop "toString"
  if (prop === TO_STRING) {
    return false;
  }
  // For type safety as incoming prop is type unknown
  if (typeof prop !== 'string') {
    return false;
  }
  // is key of jest.fn()
  return jestFnKeys.hasOwnProperty(prop);
}

// This is guarding against improperly defining the mock as a spy via the isSpy internal jest method
// If no checked the mockInterface proxy will continue to incorrectly populate based on the last called property
// if left unchecked this will fulfill the received.calls.all === 'function' && received.calls.count === 'function';
// thus jest will think it's a spy and will incorrectly get the count of how many times the mock.fn was called.
// Implementation of isSpy from jest.
// const isSpy = received =>
//   received != null &&
//   received.calls != null &&
//   typeof received.calls.all === 'function' &&
//   typeof received.calls.count === 'function';
const CALLS_KEY = 'calls';
const ALL_KEY = 'all';
const COUNT_KEY = 'count';
function isJestTryingToSpyCheck(prop: unknown, lastCalled: unknown): boolean {
  return  lastCalled === CALLS_KEY && (prop === ALL_KEY || prop === COUNT_KEY)
}

export function mockInterface<T>(): MockedInterface<T> {
  function recurseProxy(target: Target<T>, isPrevMockFunctionAccess: boolean = false, lastCalledProp?: unknown): MockedInterface<T> {
    return new Proxy(target, {
      get(getTarget: Record<string | number | symbol, unknown>, prop: string | number | symbol) {
        // Is recursive branch a part of _isMockFunction access
        // This is important as anything after this access should be treated as normal object access.
        // e.g. when you use ".toHaveBeenCalledTimes()" the access chain might look like *.*._isMockFunction.calls.getMockName.mock
        // In this case the key just "calls" is far too generic to be added to a whitelist of shouldGetRealValue() function
        const isMockFunctionAccess = isPrevMockFunctionAccess || prop === _IS_MOCK_FUNCTION;
        // Base case:
        // Get actual value of object access instead of creating a jest.fn proxy object
        if (shouldGetRealValue(prop, isMockFunctionAccess, lastCalledProp)) {
          return getTarget[prop];
        }

        // Initialize the value to a jest.fn if property doesn't exist yet
        if (!getTarget.hasOwnProperty(prop)) {
          getTarget[prop] = jest.fn();
        }

        // Recurse case:
        // Recursively create proxy object on each get until Base case
        return recurseProxy(getTarget[prop] as Target<T>, isMockFunctionAccess , prop);
      },
    }) as MockedInterface<T>;
  }
  return recurseProxy({});
}