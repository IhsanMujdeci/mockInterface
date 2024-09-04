import {mockInterface} from "../";

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
})