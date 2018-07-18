const fetch = require('node-fetch')
const cheerio = require('cheerio')


const url = [`http://kodeturbo.com/index.php`, `?marka=`, `?do=cars2&marka=`, `&do=cars`, `&model=`, `?do=turbo&oem=`]
let mainProducers = []
// let mainProducers = ['BMW']
let linkToCars = []
let arrayofCars = []
let mainArrayOfTurbines = []
let objectOfTurbines = []

async function getProducers() {

    const allMarks = await fetch(`${url[0]}`)
    const resp = await allMarks.text()
    const $ = cheerio.load(resp)
    $(`option`).each(function (i, mark) {
        const $mark = $(mark)
        mainProducers.push($mark.text())
    })
}

async function getModelsLinks() {
    const mapToReceiveCarLinks = await Promise.all(mainProducers.map(async (producer, i) => {
            const allModels = await fetch(`${url[0]}${url[2]}${producer}${url[3]}`)
            const resp = await allModels.text()
            const $ = cheerio.load(resp)
            const maptoDirectLinks = await Promise.all($('tr').map(async function (i, el) {
                let arrayToPushLinks = []
                const linkString = await $(el).attr('onclick')
                if (linkString !== undefined) {
                    let slicedLinkString = linkString.slice(15, linkString.length - 1).replace(/ /g, "%");
                    arrayToPushLinks.push(slicedLinkString)
                }
                return arrayToPushLinks
            }).get())
            return maptoDirectLinks
        }
    ))
    return linkToCars.push(...mapToReceiveCarLinks)
}

async function getAllModelsNames() {
    let arrayForPushingModels = []
    await Promise.all(linkToCars.map(async (alink, i) => {
            let mapToSaveInAboveArray = await Promise.all(alink.map(async function (singleLinkToModel) {
                try {
                    const allModels = await fetch(`${url[0]}${singleLinkToModel}`)
                    const resp = await allModels.text()
                    const $ = cheerio.load(resp)
                    let trModelsToTD = await Promise.all($('tr').map(async function (i, el) {
                        if (i !== 0) {
                            let arrayForSingleModelData = []
                            let tdModelsData = await $(el).find('td').map(async (ii, singleElement) => {
                                let singleModelsData = await($(singleElement).text())
                                return arrayForSingleModelData.push(singleModelsData)
                            }).get()
                            return arrayForSingleModelData
                        }
                    }).get())
                    trModelsToTD.shift()
                    return arrayForPushingModels.push(trModelsToTD)
                }
                catch (error) {
                    console.log('nie działa map z singleLinkToModel', singleLinkToModel, error)
                }
            }))
            return mapToSaveInAboveArray
        }
    ))
    return arrayofCars.push(...arrayForPushingModels)
}

async function getAllTurboNo() {
    let arrayOfTurbines = []
    await Promise.all(arrayofCars.map(async (elementOfMainArray) => {
        await Promise.all(elementOfMainArray.map(async elOfModelsSingleElement => {
            if (elOfModelsSingleElement.length !== 0) {
                let arrayOfSliceIndexes = [0,]
                let turbinesArray = []
                let variableForSixthIndexOfElement = elOfModelsSingleElement[6]
                for (let i = 0; i < variableForSixthIndexOfElement.length; i++) {
                    if (variableForSixthIndexOfElement[i] === '\n') {
                        arrayOfSliceIndexes.push(i)
                    }
                }
                for (let j = 0; j < arrayOfSliceIndexes.length; j++) {
                    let turbineNumber = variableForSixthIndexOfElement.slice(arrayOfSliceIndexes[j], arrayOfSliceIndexes[j + 1])
                    turbinesArray.push(turbineNumber)

                }
                await Promise.all(turbinesArray.map(async singleTurbine => {
                    let removeWhiteSpaces = await singleTurbine.trim()
                    if ((removeWhiteSpaces.length !== 0) &&
                        (removeWhiteSpaces !== ' ')) {
                        const turbineWithoutWhiteSpaces = removeWhiteSpaces.replace(/\s/g, "-")
                        if (arrayOfTurbines.indexOf(turbineWithoutWhiteSpaces) === -1) {
                            arrayOfTurbines.push(turbineWithoutWhiteSpaces)
                        }
                    }
                }))
                return arrayOfTurbines
            }
            return arrayOfTurbines
        }))
    }))
    return mainArrayOfTurbines.push(...arrayOfTurbines)
}

async function getTurboData() {
    let objectOfTurbinesData = []
    await Promise.all(mainArrayOfTurbines.map(async (turbineNumber) => {

        const allTurbines = await fetch(`${url[0]}?szukaj=${turbineNumber}&go=SEARCH+&do=search`)
        const resp = await allTurbines.text()
        const $ = cheerio.load(resp)
        let arrayOfData = await ($('tr').map(async function (i, el) {
            if (i !== 0) {
                let skladniki = await Promise.all($(el).find('td').map(async function (index, element) {
                        if (i !== 0) {
                            return $(element).text()
                        }
                    }
                ).get())
                const rowOfData = await {
                    turbina: skladniki[0],
                    skladniki: {
                        CW: skladniki[1],
                        TW: skladniki[2],
                        BH: skladniki[3],
                        BP: skladniki[4],
                        HS: skladniki[5],
                        AC: skladniki[6],
                        NZ: skladniki[7],
                        GK: skladniki[8],
                        RK: skladniki[9],
                        KODECH: skladniki[10],
                    }
                }
                return objectOfTurbinesData.push(rowOfData)
            }
        }))
        return objectOfTurbinesData
    }))
    return objectOfTurbines.push(...objectOfTurbinesData)
}

async function callFunctions() {
    await getProducers() //odkomentować żeby ściagać wszystko
    await getModelsLinks()
    await getAllModelsNames()
    await getAllTurboNo()
    await getTurboData()
    await console.log('arrayofCars ', objectOfTurbines)
}

callFunctions()