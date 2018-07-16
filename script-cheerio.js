const fetch = require('node-fetch')
const cheerio = require('cheerio')


const url = [`http://kodeturbo.com/index.php`, `?marka=`, `?do=cars2&marka=`, `&do=cars`, `&model=`, `?do=turbo&oem=`]
// let mainProducers = []
let mainProducers = [`Ford`, `Alfa-Romeo`]
let linkToCars = []
let arrayXYZ = []

// async function getProducers() {
//
//     const allMarks = await fetch(`${url[0]}`)
//     const resp = await allMarks.text()
//
//     const $ = cheerio.load(resp)
//
//     $(`option`).each(function (i, mark) {
//         const $mark = $(mark)
//         mainProducers.push($mark.text())
//     })
// }

async function getModelsLinks() {
    const mapProducersToTr = await Promise.all(mainProducers.map(async (producer, i) => {
            try {
                const allModels = await fetch(`${url[0]}${url[2]}${producer}${url[3]}`)
                const resp = await allModels.text()
                const $ = cheerio.load(resp)
                const mapTrToLinks = await Promise.all($('tr').map(async function (i, el) {
                    let arrayToPushLinks = []
                    const linkString = await $(el).attr('onclick')
                    if (linkString !== undefined) {
                        let slicedLinkString = linkString.slice(15, linkString.length - 1)
                        let carLinkReadyToPush = slicedLinkString.replace(/ /g, "%");
                        arrayToPushLinks.push(carLinkReadyToPush)
                    }
                    return arrayToPushLinks
                }).get())

                return mapTrToLinks
            }
            catch {
                console.log('nie działa getModelsLinks()')
            }
        }
    ))
    return linkToCars.push(mapProducersToTr)
}


async function getAllModelsNames() {
    let arrayForPushingStuff = []

    await Promise.all(linkToCars[0].map(async (alink, i) => {

            try {
                let mapToSaveInAboveArray = await Promise.all(alink.map(async function (singleLinkToModel) {
                    try {
                        const allModels = await fetch(`${url[0]}${singleLinkToModel}`)
                        const resp = await allModels.text()
                        const $ = cheerio.load(resp)
                        let mapTrofModelsToTD = await Promise.all($('tr').map(async function (i, el) {
                            let arrayOfSth = []
                            let mapTdofModelsData = await $(el).find('td').map(async (ii, singleElement) => {
                                let variableWithTdData = await($(singleElement).text())
                                if ((variableWithTdData !== 'MARKA') &&
                                    (variableWithTdData !== 'Model') &&
                                    (variableWithTdData !== 'Engine capacity') &&
                                    (variableWithTdData !== 'Engine power') &&
                                    (variableWithTdData !== 'Production date') &&
                                    (variableWithTdData !== 'Engine No.') &&
                                    (variableWithTdData !== 'Turbo OEM')
                                ) {
                                    return arrayOfSth.push(variableWithTdData)
                                }
                            }).get()
                            return arrayOfSth
                        }).get())
                        mapTrofModelsToTD.shift()

                        return arrayForPushingStuff.push(mapTrofModelsToTD)
                    }
                    catch {
                        console.log('nie działa map z singleLinkToModel', singleLinkToModel)
                    }
                }))
                return mapToSaveInAboveArray
            }
            catch {
                console.log('nie działa getAllModelsNames')
            }
        }
    ))
    return arrayXYZ.push(arrayForPushingStuff)
}

async function getAllTurboNo() {
    await Promise.all(arrayXYZ.map(async (elementOfMainArray) => {
        await Promise.all(elementOfMainArray.map(async elOfModels =>
            await Promise.all(elOfModels.map(elOfModelsSingleElement => {
                if (elOfModelsSingleElement.length !== 0) {
                    let arrayOfSliceIndexes = []
                    let arrayOfTurbines = []
                    let variableForSixthIndexOfElement = elOfModelsSingleElement[6]
                    for (let i = 0; i < variableForSixthIndexOfElement.length; i++) {
                        if (variableForSixthIndexOfElement[i] === '\n') {
                            arrayOfSliceIndexes.push(i)
                        }
                    }
                    for (let j = 0; j < arrayOfSliceIndexes.length; j++) {
                        let turbineNumber = variableForSixthIndexOfElement.slice(arrayOfSliceIndexes[j], arrayOfSliceIndexes[j+1])
                        arrayOfTurbines.push(turbineNumber)
                    }
                    console.log(arrayOfTurbines)
                }
            }))
        ))
    }))
}

async function callFunctions() {
    // await getProducers()
    await getModelsLinks()
    await getAllModelsNames()
    await getAllTurboNo()
}

callFunctions()