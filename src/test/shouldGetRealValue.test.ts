import {jestFnKeys, shouldGetRealValue} from "../index";

describe('shouldGetRealValue',()=>{
  it('Should return false if no prop and no isMockFunctionAccess', ()=>{
    expect(shouldGetRealValue(undefined, false)).toBe(false)
  })

  it('Should return true if isMockFunctionAccess', ()=>{
    expect(shouldGetRealValue(undefined, true)).toBe(true)
  })

  it('Should return false if prop is "toString"', ()=>{
    expect(shouldGetRealValue("toString", false)).toBe(false)
  })

  test.each([
    [123],
    [{}],
    [Symbol("I am symbol")]
  ])('Should return false if prop is not a string, value: %p', (prop)=>{
    expect(shouldGetRealValue(prop, false)).toBe(false)
  })

  test.each(Object.keys(jestFnKeys).map(k => [k]))('Should return true if in jestFnKeys, key: %s', (prop)=>{
    expect(shouldGetRealValue(prop, false)).toBe(true)
  })

  test.each([
    {prop:'all', lastCalledProp: 'calls', expected: true},
    {prop:'count', lastCalledProp: 'calls', expected: true},
    {prop:'calls', lastCalledProp: 'all', expected: false},
    {prop:'calls', lastCalledProp: undefined, expected: false},
  ])('Should test if spy is trying to be accessed, prop: $prop, lastCalledProp: $lastCalledProp', ({prop, lastCalledProp, expected})=>{
    expect(shouldGetRealValue(prop, false, lastCalledProp)).toBe(expected)
  })

})