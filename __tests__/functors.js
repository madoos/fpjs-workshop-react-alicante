import { Async, Identity, IO, Maybe, Either, either, getProp, composeP } from 'crocks'
import { add, compose, concat, prop, map, head, toUpper, identity } from 'ramda'

const { Just, Nothing } = Maybe
const { Left, Right } = Either

describe('Functors', () => {
  // Exercise 1
  test('Use add(x,y) and map(f,x) to make a function that increments a value inside a functor.', () => {
    // incrF :: Functor f => f Int -> f Int
    const incrF = map(add(1))
    expect(incrF(Identity(1)).equals(Identity(2))).toBeTruthy()
  })

  // Exercise 2
  test('Use head to get the first element of the list.', () => {
    const xs = Identity.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do'])
    // first :: [String] -> String
    const first = map(head);
    expect(first(xs).equals(Identity('do'))).toBeTruthy()
  })

  // Exercise 3
  test('Use getProp and head to find the first initial of the user.', () => {
    const user = { id: 2, name: 'Albert' }
    // HINT: getProp :: (String | Integer) -> a -> Maybe b
    // initial :: User -> Maybe String
    const initial = compose(
      map(head),
      getProp('name')
    )
    expect(initial(user).equals(Just('A'))).toBeTruthy()
    expect(initial({}).equals(Nothing())).toBeTruthy()
  })

  // Exercise 4
  test('Use Maybe to rewrite ex4 without an if statement.', () => {
    // safeNum :: Number -> Maybe Number
    const safeNum = (n) => Maybe.of(parseInt(n));
    expect(safeNum('4').equals(Maybe(4))).toBeTruthy()
  })

  // Exercise 5
  test("Write a function that will getPost then toUpperCase the post's title.", () => {
    // getPost :: Int -> Future({id: Int, title: String})
    const getPost = id =>
      Async((_, res) => setTimeout(() => res({ id, title: 'Love them futures' }), 300))


    const _upperTitle = compose(
      toUpper,
      prop('title')
    )
    // TODO: getPostThenUpper :: Int -> String
    const getPostThenUpper = compose(
      map(_upperTitle),
      getPost
    )
    getPostThenUpper(1).fork(console.log, title => expect(title).toBe('LOVE THEM FUTURES'))
  })

  // Exercise 6
  test('Write a function that uses checkActive() and showWelcome() to grant access or return the error.', () => {
    const showWelcome = compose(
      concat('Welcome '),
      prop('name')
    )

    const checkActive = user => (user.active ? Right(user) : Left('Your account is not active'))

    // TODO: eitherWelcome :: User -> Either String String
    const eitherWelcome = compose(
      map(showWelcome),
      checkActive
    );

    expect(
      eitherWelcome({ name: 'Flavio', active: true }).equals(Right('Welcome Flavio'))
    ).toBeTruthy()
    expect(
      eitherWelcome({ name: 'Yannick', active: false }).equals(Left('Your account is not active'))
    ).toBeTruthy()
  })

  // Exercise 7
  test('Write a validation function that checks for a length > 3.', () => {
    // validateName :: User -> Either String ()
    const validateName = (name) => name.length > 3 ? Right(name) : Left('You need > 3');

    expect(validateName('hello').equals(Right('hello'))).toBeTruthy()
    expect(validateName('fla').equals(Left('You need > 3'))).toBeTruthy()
  })

  // Exercise 8
  test('Use ex7 above and Either as a functor to save the user if they are valid or return the error message string.', () => {
    // save :: User -> IO User
    const save = user => IO.of(() => ({ ...user, saved: true }))

    // TODO: validateName :: User -> Either String ()
    const validateName = (name) => name.length > 3 ? Right(name) : Left('You need > 3');

    // TODO: register :: User -> IO String
    // HINT: either :: Either c a ~> ((c -> b), (a -> b)) -> b
    const register = compose(save)
    register('flavio').run(res => expect(res).toBe('flavio-saved'))
    register('fla').run(error => expect(error).toBe('You need > 3!!!'))
  })
})
