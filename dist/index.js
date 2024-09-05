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
var _IS_MOCK_FUNCTION = '_isMockFunction';
var TO_STRING = 'toString';
// Props to be ignored are any keys in jest.fn excluding "toString" which is an implicit property of any object
function shouldGetRealValue(prop, isMockFunctionAccess) {
    // Is part of "_isMockFunction" object access
    if (isMockFunctionAccess) {
        return true;
    }
    // Is a prop "toString"
    if (prop === TO_STRING) {
        return false;
    }
    // If it isn't a typeof string then jestFnKeys won't return true anyway
    if (typeof prop !== 'string') {
        return false;
    }
    // is key of jest.fn()
    return exports.jestFnKeys[prop];
}
exports.shouldGetRealValue = shouldGetRealValue;
function mockInterface() {
    function recurseProxy(target, isMockFunctionAccess) {
        return new Proxy(target, {
            get: function (getTarget, prop) {
                // Is recursive branch a part of _isMockFunction access
                // This is important as anything after this access should be treated as normal object access.
                // e.g. when you use ".toHaveBeenCalledTimes()" the access chain might look like *.*._isMockFunction.calls.getMockName.mock
                // In this case the key "calls" is far too generic to be added to a whitelist of shouldGetRealValue() function
                isMockFunctionAccess = isMockFunctionAccess || prop === _IS_MOCK_FUNCTION;
                // Base case:
                // Get actual value of object access instead of creating a jest.fn proxy object
                if (shouldGetRealValue(prop, isMockFunctionAccess)) {
                    return getTarget[prop];
                }
                // Initialize the value to a jest.fn if property doesn't exist yet
                if (!getTarget.hasOwnProperty(prop)) {
                    getTarget[prop] = jest.fn();
                }
                // Recurse case:
                // Recursively create proxy object on each get until Base case
                return recurseProxy(getTarget[prop], isMockFunctionAccess);
            },
        });
    }
    return recurseProxy({}, false);
}
exports.mockInterface = mockInterface;
