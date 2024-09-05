"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockInterface = exports.shouldGetRealValue = exports.jestFnKeys = void 0;
// jest.fn() returned object keys
exports.jestFnKeys = Object.freeze({
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
var _IS_MOCK_FUNCTION = '_isMockFunction';
// Key for toString() method of Object instances returns a string representing this object
var TO_STRING = 'toString';
// Props to be ignored are any keys in jest.fn excluding "toString" which is an implicit property of any object
function shouldGetRealValue(prop, isMockFunctionAccess, lastCalledProp) {
    // Is part of "_isMockFunction" object access
    if (isMockFunctionAccess) {
        return true;
    }
    if (isJestTryingToSpyCheck(prop, lastCalledProp)) {
        return true;
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
    return exports.jestFnKeys.hasOwnProperty(prop);
}
exports.shouldGetRealValue = shouldGetRealValue;
// This is guarding against improperly defining the mock as a spy via the isSpy internal jest method
// If no checked the mockInterface proxy will continue to incorrectly populate based on the last called property
// if left unchecked this will fulfill the received.calls.all === 'function' && received.calls.count === 'function';
// thus just will think it's a spy and will incorrectly get the count of how many times the mock.fn was called.
// Implementation of isSpy from jest.
// const isSpy = received =>
//   received != null &&
//   received.calls != null &&
//   typeof received.calls.all === 'function' &&
//   typeof received.calls.count === 'function';
var CALLS_KEY = 'calls';
var ALL_KEY = 'all';
var COUNT_KEY = 'count';
function isJestTryingToSpyCheck(prop, lastCalled) {
    return lastCalled === CALLS_KEY && (prop === ALL_KEY || prop === COUNT_KEY);
}
function mockInterface() {
    function recurseProxy(target, isPrevMockFunctionAccess, lastCalledProp) {
        if (isPrevMockFunctionAccess === void 0) { isPrevMockFunctionAccess = false; }
        return new Proxy(target, {
            get: function (getTarget, prop) {
                // Is recursive branch a part of _isMockFunction access
                // This is important as anything after this access should be treated as normal object access.
                // e.g. when you use ".toHaveBeenCalledTimes()" the access chain might look like *.*._isMockFunction.calls.getMockName.mock
                // In this case the key just "calls" is far too generic to be added to a whitelist of shouldGetRealValue() function
                var isMockFunctionAccess = isPrevMockFunctionAccess || prop === _IS_MOCK_FUNCTION;
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
                return recurseProxy(getTarget[prop], isMockFunctionAccess, prop);
            },
        });
    }
    return recurseProxy({});
}
exports.mockInterface = mockInterface;
