import { sep } from 'path'
import { Async, IO, Maybe, Either, either, getProp, run, composeK } from 'crocks'
import { chain, compose, identity, prop, split, last, map, always } from 'ramda'

const { Just, Nothing } = Maybe
const { Left, Right } = Either

describe('Monads', () => {
  // Exercise 1 ✅
  test('Use getProp and map/join or chain to safely get the street name when given a user.', () => {
    const user = {
      id: 2,
      name: 'albert',
      address: {
        street: {
          number: 22,
          name: 'Walnut St',
        },
      },
    }
    // getStreetName :: User -> Maybe String
    const getStreetName = composeK(
      getProp('name'),
      getProp('street'),
      getProp('address')
    )
    expect(getStreetName({}).equals(Nothing())).toBeTruthy()
    expect(getStreetName(user).equals(Maybe('Walnut St'))).toBeTruthy()
  })

  // Exercise 2 🤔
  test("Use getFile to get the filename, remove the directory so it's just the file, then purely log it.", () => {
    // getFile :: IO String
    const getFile = IO.of(() => __filename)
    // pureLog :: String -> IO String
    const pureLog = str => IO.of(() => `logged ${str}`)

    // logFilename :: IO ()
    const logFilename = composeK(pureLog, always(getFile));

    logFilename().run(res => expect(res).toBe('logged monads.js'))
  })

  // Exercise 3 ✅
  test("Use getPost() then pass the post's id to getComments().", () => {
    const getPost = id =>
      Async((_, res) => setTimeout(() => res({ id, title: 'Love them tasks' }), 300))

    const getComments = post_id =>
      Async((_, res) =>
        setTimeout(
          () =>
            res([
              { post_id, body: 'This book should be illegal' },
              { post_id, body: 'Monads are like smelly shallots' },
            ]),
          300
        )
      )
    
    // getCommentsFromPost :: Int -> [Comments]
    const getCommentsFromPost = compose(
      chain(getComments),
      map(prop('id')),
      getPost
    )


    getCommentsFromPost(13).fork(console.log, res => {
      expect(map(prop('post_id'), res)).toEqual([13, 13])
      expect(map(prop('body'), res)).toEqual([
        'This book should be illegal',
        'Monads are like smelly shallots',
      ])
    })
  })

  // Exercise 4 🤔
  test("Use validateEmail, addToMailingList, and emailBlast to implement ex4's type signature.", () => {
    //  addToMailingList :: Email -> IO([Email])
    const addToMailingList = (list => email => IO(() => [...list, email]))([])
    // emailBlast :: [Email] -> IO ()
    const emailBlast = list => IO(() => `emailed: ${list.join(',')}`)
    // validateEmail :: Email -> Either String Email
    const validateEmail = x => (x.match(/\S+@\S+\.\S+/) ? Right(x) : Left('invalid email'))
    // TODO: joinMailingList :: Email -> Either String (IO ())
    
    const joinMailingList = compose(
      io => io.run(),
      map(validateEmail),
      chain(emailBlast),
      addToMailingList
    )

    expect(joinMailingList('notanemail').equals(Left('invalid email'))).toBeTruthy()
    expect(
      joinMailingList('flaviocorpa@gmail.com').equals(Right('emailed: flaviocorpa@gmail.com'))
    ).toBeTruthy()
  })
})
