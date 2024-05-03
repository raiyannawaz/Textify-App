const express = require('express')
const app = express();
const hbs = require('hbs')
const bodyParser = require('body-parser')
const axios = require('axios')
const Gtts = require('gtts')
const { check, validationResult } = require('express-validator')
const cookieParser = require('cookie-parser')
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

app.get('/', async (req, res) => {
    res.status(200)
    res.render('index', {
        title: 'Textify'
    })
})

// HOME 

// Translate

app.get('/translate', (req, res) => {
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
                texts: 'Please enter the language and the text to translate.'
            })
        }
        else if (body.to === '') {
            res.status(300)
            res.render('translate', {
                title: 'Textify',
                texts: 'Please enter the language to convert.'
            })
        }
        else if (body.texts === '') {
            res.status(300)
            res.render('translate', {
                title: 'Textify',
                texts: 'Please enter the text to convert.'
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

// Translate

// DICTIONARY

app.get('/dictionary', (req, res) => {
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

app.get('/texttospeech', (req, res) => {
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
                texts: 'Please enter the language and the text to convert into speech.'
            })
        }
        else if (body.to === '') {
            res.status(302)
            res.render('texttospeech', {
                title: 'Textify',
                texts: 'Please enter the language to convert into speech.'
            })
        }
        else if (body.texts === '') {
            res.status(302)
            res.render('texttospeech', {
                title: 'Textify',
                texts: 'Please enter the text to convert into speech.'
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

app.get('/grammercheck', (req, res) => {
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