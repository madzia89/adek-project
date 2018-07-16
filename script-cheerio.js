const fetch = require('node-fetch')
const cheerio = require('cheerio')


const url = [`http://kodeturbo.com/index.php`, `?marka=`, `?do=cars2&marka=`, `&do=cars`, `&model=`, `?do=turbo&oem=`]
// let mainProducers = []//odkomentować żeby ściagać wszystko
let mainProducers = [`Ford`] //zakomentować gdy ściągane jest wszystko
let linkToCars = []
let arrayofCars = []
let arrayOfTurbines = []

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
// }//odkomentować żeby ściagać wszystko

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
    return arrayofCars.push(arrayForPushingStuff)
}

async function getAllTurboNo() {
    let properArrayOfTurbines = []
    await Promise.all(arrayofCars.map(async (elementOfMainArray) => {
        await Promise.all(elementOfMainArray.map(async elOfModels => {
            await Promise.all(elOfModels.map(async elOfModelsSingleElement => {
                if (elOfModelsSingleElement.length !== 0) {
                    let arrayOfSliceIndexes = [0,]
                    let arrayOfTurbines = []
                    let variableForSixthIndexOfElement = elOfModelsSingleElement[6]
                    for (let i = 0; i < variableForSixthIndexOfElement.length; i++) {
                        if (variableForSixthIndexOfElement[i] === '\n') {
                            arrayOfSliceIndexes.push(i)
                        }
                    }
                    for (let j = 0; j < arrayOfSliceIndexes.length; j++) {
                        let turbineNumber = variableForSixthIndexOfElement.slice(arrayOfSliceIndexes[j], arrayOfSliceIndexes[j + 1])
                        arrayOfTurbines.push(turbineNumber)
                    }
                    await Promise.all(arrayOfTurbines.map(async singleTurbine => {
                        // singleTurbine.replace(/\s+/g, ' ');
                        let removeWhiteSpaces = await singleTurbine.replace(/(^\s+|\s+$)/g, '')
                        if ((removeWhiteSpaces.length !== 0) &&
                            (removeWhiteSpaces !== ' ')) {
                            const turbineWithoutWhiteSpaces = removeWhiteSpaces.replace(/\s/g, "-")
                            if (properArrayOfTurbines.indexOf(turbineWithoutWhiteSpaces) === -1) {
                                properArrayOfTurbines.push(turbineWithoutWhiteSpaces)
                            }
                        }
                    }))
                    return properArrayOfTurbines
                }
                return properArrayOfTurbines
            }))
        }))
        return properArrayOfTurbines

    }))
    return arrayOfTurbines.push(properArrayOfTurbines)
}

async function getTurboData() {
    await Promise.all(arrayOfTurbines[0].map(async (turbineNumber) => {
        try {

            const allTurbines = await fetch(`${url[0]}?szukaj=${turbineNumber}&go=SEARCH+&do=search`)
            const resp = await allTurbines.text()
            const $ = cheerio.load(resp)
            // let arrayOfData = [turbineNumber,]
            let arrayOfData = await Promise.all($('tr').map(async function (i, el) {
                return $(this).text()
            }).get())
            console.log(arrayOfData)
        }
            // try {
            //     const allTurbines = await fetch(`${url[0]}${url[5]}${turbineNumber}`)
            //     const resp = await allTurbines.text()
            //     const $ = cheerio.load(resp)
            //     let arrayOfData = [turbineNumber,]
            //     await Promise.all($('.prawa .lista').map(async function (i, el) {
            //         let data = {}
            //         let zmienna = await $(el).find('ul').text()
            //         if (zmienna.includes('Actuator')) {
            //             let actuatorBeginning = zmienna.indexOf('Actuator')
            //             let actuatorEnding = zmienna.indexOf('\n\n')
            //             data.actuator = zmienna.slice(actuatorBeginning + 9, actuatorEnding - 1)
            //             return data
            //         }
            //         if (zmienna.includes('Bearing Housing')) {
            //             let bearingBeginning = zmienna.indexOf('Bearing Housing')
            //             let bearingEnding = zmienna.indexOf( '\n\n', bearingBeginning)
            //             data.bearingHousing = zmienna.slice(bearingBeginning + 16, bearingEnding - 1)
            //             console.log(turbineNumber, zmienna)
            //             return data
            //         }
            //
            //         // arrayOfData.push(zmienna)
            //         return arrayOfData
            //     }).get())
            //     // console.log('arrayOfData ', arrayOfData)
            // }
        catch {
            console.log('nie działa getTurboData')
        }
    }))
}

async function callFunctions() {
    // await getProducers() //odkomentować żeby ściagać wszystko
    await getModelsLinks()
    await getAllModelsNames()
    await getAllTurboNo()
    await getTurboData()
    // await console.log('arrayOfTurbines ', arrayOfTurbines[0])
}

callFunctions()