# Mock Interface
Zero dependency library that deeply mocks typescript interfaces via jest.fn() allowing you to adhere easily SOLID principals.

### Type safety
Full type safety is preserved, type errors are thrown if a mock return/resolve type is incorrect or if method called incorrectly.

### Natively Jest
Mock interfaces arbitrarily deeply, and they will behave as jest mocks.  
All jest assertions will work as if it was a jest mock e.g. `toHaveBeenCalledTimes, toHaveBeenCalledWith, ...`  
See full list from jest docs https://jestjs.io/docs/mock-function-api

## Examples

```typescript
describe('Mock Interface', () => {

  it('Should test person interface', () => {
    interface Person {
      speak: Speaker
      getName(): string
    }

    interface Speaker {
      say(phrase: string): string
    }

    const person = mockInterface<Person>()

    person.getName.mockReturnValue('Navi')
    person.speak.say.mockReturnValue('Hey, listen!')

    const name = person.getName()
    const say = person.speak.say('Hey, listen!')

    expect(name).toEqual('Navi')
    expect(person.getName).toHaveBeenCalledTimes(1)

    expect(say).toEqual('Hey, listen!')
    expect(person.speak.say).toHaveBeenNthCalledWith(1, 'Hey, listen!')
  })

  // This is typically an edge case of similar interface mockers that aren't caught
  it('Should mock toString function of interface', ()=>{
    interface JsonWriter{
      toString(): string
    }
    const mockJsonWriter = mockInterface<JsonWriter>()
    mockJsonWriter.toString.mockReturnValue('{"nice": "json"}')
    const w = mockJsonWriter.toString()
    expect(w).toBe('{"nice": "json"}')
    expect(mockJsonWriter.toString).toHaveBeenCalledTimes(1)
    expect(mockJsonWriter.toString).toHaveBeenCalledWith()
  })
  
  it('Should test arbitrarily deep interface', ()=>{
    interface l1 {
      l2: l2;
    }
    interface l2 {
      l3: l3;
    }
    interface l3 {
      l4: l4;
    }
    interface l4 {
      dig(): string;
    }

    const levels = mockInterface<l1>();
    levels.l2.l3.l4.dig.mockReturnValue('end of the line');

    const d = levels.l2.l3.l4.dig();
    expect(d).toBe('end of the line');
    expect(levels.l2.l3.l4.dig).toHaveBeenCalledTimes(1);
  })
})
```
