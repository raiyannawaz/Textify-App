require('dotenv').config()
require('./db/conn')

const express = require('express')
const app = express();

const hbs = require('hbs')
const bodyParser = require('body-parser')

const auth = require('./middleware/auth')
const User = require('./models/User')

const { check, validationResult } = require('express-validator')
const cookieParser = require('cookie-parser')

const axios = require('axios')
const Gtts = require('gtts')

const path = require('path')
const fs = require('fs');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/public')))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '/template/views'))
hbs.registerPartials(path.join(__dirname, '/template/partials'))
app.use(bodyParser.urlencoded())
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '/public')))

// HOME 

app.get('/', auth, async (req, res) => {
    
    let _id = req._id;

    let user = await User.findOne({ _id })
    console.log(user)

    res.status(200)
    res.render('index', {
        title: 'Textify'
    })
})

// HOME 

// Login 

app.get('/login', (req, res) => {
    res.status(200).render('login', {
        title: 'Textify',
        type: 'normal',
        message: 'Enter Your Details',
        normal: true,
        success: false,
        failed: false,
        warning: false
    })
})

app.post('/login', [
    check('email', 'Invalid Email').isEmail(),
    check('password', 'Password Minimum 8 Characters').isLength({ min: 8 })
], async (req, res) => {
    try {
        let { email, password } = req.body;

        let errors = validationResult(req)

        if (email && password) {
            if (errors.isEmpty()) {

                let user = await User.findOne({ email })

                if (user) {

                    let comparePassword = await user.comparePassword(password)

                    if (comparePassword) {
                        let token = await user.generateAuthToken();

                        res.cookie('jwt', token, {
                            expires: new Date(Date.now() + 2592000000)
                        })
                        res.status(200).redirect('/')
                    }
                    else {
                        res.status(400).render('login', {
                            title: 'Textify',
                            type: 'danger',
                            message: 'Wrong Password',
                            normal: false,
                            success: false,
                            warning: false,
                            failed: true
                        })
                    }
                }
                else {
                    res.status(400).render('login', {
                        title: 'Textify',
                        type: 'danger',
                        message: 'User Not Exist',
                        normal: false,
                        success: false,
                        warning: false,
                        failed: true
                    })
                }
            }
            else {
                res.status(400).render('login', {
                    title: 'Textify',
                    type: 'danger',
                    message: errors.array()[0].msg,
                    normal: false,
                    success: false,
                    warning: false,
                    failed: true
                })
            }
        }
        else {
            if (email === '' && password === '') {
                res.status(300).render('login', {
                    title: 'Textify',
                    type: 'warning',
                    message: 'Enter Your Details',
                    normal: false,
                    success: false,
                    warning: true,
                    failed: false
                })
            }
            else if (email === '') {
                res.status(300).render('login', {
                    title: 'Textify',
                    type: 'warning',
                    message: 'Enter Your Email',
                    normal: false,
                    success: false,
                    warning: true,
                    failed: false
                })
            }
            else if (password === '') {
                res.status(300).render('login', {
                    title: 'Textify',
                    type: 'warning',
                    message: 'Enter Your Password',
                    normal: false,
                    success: false,
                    warning: true,
                    failed: false
                })
            }
        }
    }
    catch (err) {
        console.log(err)
        res.status(404).render('login', {
            title: 'Textify',
            type: 'danger',
            message: 'Uncaught Error',
            normal: false,
            success: false,
            warning: false,
            failed: true
        })
    }
})

// Login 

// Register 

app.get('/register', (req, res) => {
    res.status(200).render('register', {
        title: 'Textify',
        type: 'normal',
        message: 'Enter Your Details',
        normal: true,
        success: false,
        warning: false,
        failed: false
    })
})

app.post('/register', [
    check('name').isString(),
    check('email', 'Invalid Email').isEmail(),
    check('password', 'Password Minimum 8 Characters').isLength({ min: 8 }),
    check('confirmpassword', 'Password Minimum 8 Characters').isLength({ min: 8 })

], async (req, res) => {
    try {

        let { name, email, password, confirmpassword } = req.body;

        let errors = await validationResult(req)

        if (name && email && password && confirmpassword) {

            if (errors.isEmpty()) {

                if (password === confirmpassword) {

                    let user = await User.findOne({ email })

                    if (user) {
                        res.status(400).render('register', {
                            title: 'Textify',
                            type: 'danger',
                            message: `Email Already Exist`,
                            normal: false,
                            success: false,
                            warning: false,
                            failed: true
                        })
                    }
                    else {

                        let response = await new User({ name, email, password, confirmpassword })
                        await response.save()

                        let token = await response.generateAuthToken();

                        res.cookie('jwt', token, {
                            expires: new Date(Date.now() + 2592000000)
                        })

                        res.status(200).redirect('/')
                    }
                }
                else {
                    res.status(400).render('register', {
                        title: 'Textify',
                        type: 'danger',
                        message: `Password not matching`,
                        normal: false,
                        success: false,
                        warning: false,
                        failed: true
                    })
                }
            }
            else {
                res.status(400).render('register', {
                    title: 'Textify',
                    type: 'danger',
                    message: errors.array()[0].msg,
                    normal: false,
                    success: false,
                    warning: false,
                    failed: true
                })
            }
            // console.log(errors.array(), errors.isEmpty())
        }
        else {
            if (name === '' && email === '' && password === '' && confirmpassword === '') {
                res.status(300).render('register', {
                    title: 'Textify',
                    type: 'warning',
                    message: 'Enter Your Details',
                    normal: false,
                    success: false,
                    warning: true,
                    failed: false
                })
            }
            else if (name === '') {
                res.status(300).render('register', {
                    title: 'Textify',
                    type: 'warning',
                    message: 'Enter Your Name',
                    normal: false,
                    success: false,
                    warning: true,
                    failed: false
                })
            }
            else if (email === '') {
                res.status(300).render('register', {
                    title: 'Textify',
                    type: 'warning',
                    message: 'Enter Your Email',
                    normal: false,
                    success: false,
                    warning: true,
                    failed: false
                })
            }
            else if (password === '') {
                res.status(300).render('register', {
                    title: 'Textify',
                    type: 'warning',
                    message: 'Enter Password',
                    normal: false,
                    success: false,
                    warning: true,
                    failed: false
                })
            }
            else if (confirmpassword === '') {
                res.status(300).render('register', {
                    title: 'Textify',
                    type: 'warning',
                    message: 'Enter Confirm Password',
                    normal: false,
                    success: false,
                    warning: true,
                    failed: false
                })
            }
        }
    }
    catch (err) {
        console.log(err)
        res.status(404).render('register', {
            title: 'Textify',
            type: 'danger',
            message: 'Uncaught Error',
            normal: false,
            success: false,
            warning: false,
            failed: true
        })
    }
})

// Register 

// TRANSLATE

app.get('/translate', auth, (req, res) => {
    res.status(201)
    res.render('translate', {
        title: 'Textify',
        texts: 'Enter the language and the text to translate.'
    })
})


app.post('/translate', async (req, res) => {

    const body = {
        to: req.body.to,
        texts: req.body.texts
    }

    try {
        if (body.texts === '' && body.to === '') {
            res.status(300)
            res.render('translate', {
                title: 'Textify',
                texts: 'Please select the language and enter some texts'
            })
        }
        else if (body.to === '') {
            res.status(300)
            res.render('translate', {
                title: 'Textify',
                texts: 'Please select the language'
            })
        }
        else if (body.texts === '') {
            res.status(300)
            res.render('translate', {
                title: 'Textify',
                texts: 'Please enter some texts'
            })
        }
        else {

            const options = {
                method: 'POST',
                url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
                params: {
                    'to[0]': body.to,
                    'api-version': '3.0',
                    profanityAction: 'NoAction',
                    textType: 'plain'
                },
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': '6d3682af21mshb332e6fed9d3529p1f9390jsn5715d3cf30a7',
                    'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
                },
                data: [
                    {
                        Text: body.texts
                    }
                ]
            };

            const response = await axios.request(options);

            res.status(200)
            res.render('translate', {
                title: 'Textify',
                texts: response.data[0].translations[0].text
            })
        }
    } catch (error) {
        console.log(error)
        res.status(404)
        res.render('translate', {
            title: 'Textify',
            texts: 'Failed!'
        })
    }

})

// TRANSLATE

// DICTIONARY

app.get('/dictionary', auth, (req, res) => {
    res.status(201)
    res.render('dictionary', {
        title: 'Textify',
        texts: 'Get the Definitions'
    })
})

app.post('/dictionary', async (req, res) => {

    let texts = req.body.texts;

    try {

        if (texts === '') {
            res.status(300)
            res.render('dictionary', {
                title: 'Textify',
                texts: 'Please write something'
            })
        }
        else {
            let url = `https://api.dictionaryapi.dev/api/v2/entries/en/` + texts;

            axios.request(url).then((response) => {

                let data = response.data;

                const getMeanings = () => {
                    let totalMeanings = []
                    for (let i = 0; i < data.length; i++) {
                        let meanings = data[i].meanings;
                        for (let j = 0; j < meanings.length; j++) {
                            let definitions = meanings[j].definitions;
                            for (let k = 0; k < definitions.length; k++) {
                                let definition = definitions[k].definition
                                definition !== undefined ? totalMeanings.push(definition) : ''
                            }
                        }
                    }
                    let meanings = totalMeanings.sort((a, b) => {
                        if (a.length > b.length)
                            return -1;
                        if (a.length < b.length)
                            return 1;
                        return 0;
                    })[0]

                    return meanings
                }

                const getExamples = () => {
                    let totalExamples = []
                    for (let i = 0; i < data.length; i++) {
                        let meanings = data[i].meanings;
                        for (let j = 0; j < meanings.length; j++) {
                            let definitions = meanings[j].definitions;
                            for (let k = 0; k < definitions.length; k++) {
                                let example = definitions[k].example
                                example === undefined ? '' : totalExamples.push(example)
                            }
                        }
                    }
                    let examples = totalExamples.sort((a, b) => {
                        if (a.length > b.length)
                            return -1;
                        if (a.length < b.length)
                            return 1;
                        return 0;
                    })[0]

                    return examples
                }

                const getSynonyms = () => {
                    let totalSynonyms = []
                    for (let i = 0; i < data.length; i++) {
                        let meanings = data[i].meanings;
                        for (let j = 0; j < meanings.length; j++) {
                            let definitions = meanings[j].definitions;
                            for (let k = 0; k < definitions.length; k++) {
                                let synonyms = definitions[k].synonyms
                                for (let l = 0; l < synonyms.length; l++) {
                                    let synonym = synonyms[l]
                                    totalSynonyms.push(synonym)
                                }
                            }
                        }
                    }
                    let synonyms = totalSynonyms.slice(0, 5).join(', ')
                    return synonyms
                }

                const getAntonyms = () => {
                    let totalAntonyms = []
                    for (let i = 0; i < data.length; i++) {
                        let meanings = data[i].meanings;
                        for (let j = 0; j < meanings.length; j++) {
                            let definitions = meanings[j].definitions;
                            for (let k = 0; k < definitions.length; k++) {
                                let antonyms = definitions[k].antonyms
                                for (let l = 0; l < antonyms.length; l++) {
                                    let antonym = antonyms[l]
                                    totalAntonyms.push(antonym)
                                }
                            }
                        }
                    }
                    let antonyms = totalAntonyms.slice(0, 5).join(', ')
                    return antonyms
                }

                let meaning = getMeanings();
                let example = getExamples();
                let synonyms = getSynonyms();
                let antonyms = getAntonyms();

                res.status(200)
                res.render('dictionary', {
                    title: 'Textify',
                    texts: `${meaning ? 'Meaning: ' + meaning : ''}

${example ? 'Example: ' + example : ''}

${synonyms ? 'Synonyms: ' + synonyms : ''}

${antonyms ? 'Antonyms: ' + antonyms : ''}`

                })

            }).catch((err) => {
                res.status(400)
                res.render('dictionary', {
                    title: 'Textify',
                    texts: 'Failed!'
                })
                console.log(err)
            })
        }
    }
    catch (err) {
        res.status(404);
        res.render('dictionary', {
            title: 'Textify',
            texts: 'Failed!'
        })
        console.log(err)
    }
})

// DICTIONARY

// Text To Speech 

app.get('/texttospeech', auth, (req, res) => {
    res.status(201)
    res.render('texttospeech', {
        title: 'Textify',
        texts: 'Enter the language and the text to convert into speech'
    })
})

app.post('/texttospeech', async (req, res) => {

    const body = {
        to: req.body.to,
        texts: req.body.texts
    }

    try {
        if (body.texts === '' && body.to === '') {
            res.status(302)
            res.render('texttospeech', {
                title: 'Textify',
                texts: 'Please select the language and enter some texts'
            })
        }
        else if (body.to === '') {
            res.status(302)
            res.render('texttospeech', {
                title: 'Textify',
                texts: 'Please select the language'
            })
        }
        else if (body.texts === '') {
            res.status(302)
            res.render('texttospeech', {
                title: 'Textify',
                texts: 'Please enter some texts'
            })
        }
        else {

            const gtts = new Gtts(body.texts, body.to);

            gtts.save(`./public/audio.mp3`, (err, result) => {
                if (err) {
                    fs.unlinkSync('audio.mp3')
                }
                else {

                    res.redirect('texttospeech/audio')

                    app.get('/texttospeech/audio', (req, res) => {

                        let file = path.join(__dirname, '/public/audio.mp3')

                        res.writeHead(200, { 'Content-Type': 'audio/mp3' })

                        fs.exists(file, (exist) => {
                            if (exist) {
                                var readStream = fs.createReadStream(file)
                                readStream.pipe(res)
                            }
                            else {
                                console.log('not woring')
                                res.status(300)
                                res.render('texttospeech', {
                                    title: 'Textify',
                                    texts: 'Please Try Again Later'
                                })
                            }
                        })

                    })

                }
            })
        }


    } catch (err) {
        console.log(err)
        res.status(404)
        res.render('texttospeech', {
            title: 'Textify',
            texts: 'Failed!'
        })
    }

})

// Text To Speech

// GRAMMER CHECK 

app.get('/grammercheck', auth, (req, res) => {
    res.status(201)
    res.render('grammercheck', {
        title: 'Textify',
        texts: 'Get the Correct Words'
    })
})

app.post('/grammercheck', async (req, res) => {

    let texts = req.body.texts;

    try {
        if (texts === '') {
            res.status(300)
            res.render('grammercheck', {
                title: 'Textify',
                texts: 'Please write something'
            })
        }
        else {

            const options = {
                method: 'POST',
                url: 'https://api.edenai.run/v2/text/spell_check',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDk2OWExODMtZDg5Ny00NGU4LWIzMzUtNTlkNmNlZjk1MjhiIiwidHlwZSI6ImFwaV90b2tlbiJ9.A8s59aBopzeUeSxNe7F4dIlBPDZEFYlSGzkOPzzXKW0'
                },
                data: {
                    response_as_dict: true,
                    attributes_as_list: false,
                    show_original_response: false,
                    providers: 'nlpcloud,openai,microsoft,cohere,sapling,prowritingaid',
                    language: 'en',
                    text: texts
                }
            };

            axios.request(options).then((response) => {

                response.data.nlpcloud.items.forEach((data) => {

                    res.status(200)
                    res.render('grammercheck', {
                        title: 'Textify',
                        texts: data.suggestions[0].suggestion
                    })
                })

            }).catch((err) => {
                console.log(err)
                res.status(400)
                res.render('grammercheck', {
                    title: 'Textify',
                    texts: 'Failed!'
                })
            })

        }
    }
    catch (err) {
        res.status(404)
        res.render('grammercheck', {
            title: 'Textify',
            texts: 'Failed!'
        })
        console.log(err)
    }
})

// GRAMMER CHECK 

app.listen(port, () => {
    console.log('running')
})