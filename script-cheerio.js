const fetch = require('node-fetch')
const cheerio = require('cheerio')


const url = [`http://kodeturbo.com/index.php`, `?marka=`, `?do=cars2&marka=`, `&do=cars`, `&model=`, `?do=turbo&oem=`]
let mainObject = []
let mainProducers = []
let linkToCars = []

async function getProducers() {

    const allMarks = await fetch(`${url[0]}`)
    const resp = await allMarks.text()

    const $ = cheerio.load(resp)

    $(`option`).each(function (i, mark) {
        const $mark = $(mark)
        mainProducers.push($mark.text())
        mainObject.push([$mark.text()])
    })
}

async function getModelsLinks() {
    const zmienna = await Promise.all(mainProducers.map(async (producer, i) => {
            try {
                const allModels = await fetch(`${url[0]}${url[2]}${producer}${url[3]}`)
                // const allModels = await fetch(`http://kodeturbo.com/index.php?marka=BMW&do=cars`)
                const resp = await allModels.text()
                const $ = cheerio.load(resp)
                const bleh = await Promise.all($('tr').map(async function (i, el) {
                    let spr = []
                    const linkString = await $(el).attr('onclick')
                    if (linkString !== undefined) {
                        let slicedLinkString = linkString.slice(15, linkString.length - 1)
                        let carLinkReadyToPush = slicedLinkString.replace(/ /g, "%");
                        spr.push(carLinkReadyToPush)
                    }
                    return spr
                }).get())

                return bleh
            }
            catch {
                console.log('nie działa getModelsLinks()')
            }
        }
    ))
    return linkToCars.push(zmienna)
}


async function getAllModelsNames() {
    linkToCars.map(async (alink, i) => {
        console.log(linkToCars[0])
        // const allModels = await fetch(`${url[0]}${alink}`)
        // const resp = await allModels.text()
        //
        // const $ = await cheerio.load(resp)
        //
        // $('tr').each(async function(i, e) {
        //     console.log()
        // })
        //
        // console.log(allModels)
    })
}

async function callFunctions() {
    await getProducers()
    await getModelsLinks()
    await getAllModelsNames()

}

callFunctions()