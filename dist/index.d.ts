/// <reference types="jest" />
export type MockedInterface<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer B ? jest.Mock<B, A> : MockedInterface<T[K]>;
};
export declare const jestFnKeys: Record<string, boolean>;
export declare function shouldGetRealValue(prop: unknown, isMockFunctionAccess: boolean): boolean;
export declare function mockInterface<T>(): MockedInterface<T>;
