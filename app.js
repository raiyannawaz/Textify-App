const express = require('express')
const app = express();
const hbs = require('hbs')
const bodyParser = require('body-parser')
const axios = require('axios')
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
    res.status(200).render('index', {
        title: 'Textify'
    })
})

// HOME 

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
                    texts: 'failed!'
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

app.listen(port, ()=>{
    console.log('running')
})