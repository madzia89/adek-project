const fetch = require('node-fetch')
const cheerio = require('cheerio')


const url = [`http://kodeturbo.com/index.php`, `?marka=`, `?do=cars2&marka=`, `&do=cars`, `&model=`, `?do=turbo&oem=`]
let mainObject = []
let mainProducers = []
var linkToCars = []

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
    const listOfLinksToEdit = await mainProducers.map(async (producer, i) => {
        // const allModels = await fetch(`${url[0]}${url[2]}${producer}${url[3]}`)
        const allModels = await fetch(`http://kodeturbo.com/index.php?marka=BMW&do=cars`)
        const resp = await  allModels.text()
        const $ = await cheerio.load(resp)
        const editedList = await ($('tr').each(async () => {
            const linkString = await ($(this).attr('onclick'))
            if (linkString !== undefined) {
                let slicedLinkString = await linkString.slice(15, linkString.length - 1)
                let carLinkReadyToPush = await slicedLinkString.replace(/ /g, "%");
                 return linkToCars.push(carLinkReadyToPush)
            }
        }))
        return linkToCars.push(editedList)
    })
}


async function getAllModelsNames() {
    linkToCars.map(async (alink, i) => {
        console.log(linkToCars)
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