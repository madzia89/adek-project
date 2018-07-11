let arrayOfAllMake
let arrayOfAllLinksToCarMake
let arrayOfCarsTableRows
let arrayOfCarsMakeAndModels = []

const fetch = require('node-fetch')

async function getFetch() {
    const resp = await fetch('http://kodeturbo.com/index.php?do=turbo&oem=767378-0013')
    const respTpText = await resp.text()
    const funcToFindAllOptions = await findOptions(respTpText)
    arrayOfAllMake = await funcToFindAllOptions
    arrayOfAllLinksToCarMake = await linksOfAllMake(arrayOfAllMake)
    const makeDataFromArrayOfLunksToCarMake = await dataFromArrayOfAllLinksToCarMake(arrayOfAllLinksToCarMake)
    return console.log(makeDataFromArrayOfLunksToCarMake)
}

getFetch()

const findOptions = (dateFromFirstStepFetch) => {
    const arrayOfData = [dateFromFirstStepFetch]
    let arrayOfMake = []
    let currentIndexOfOption = 0
    let currentIndexOfClosingOption = 0
    for (let i = 0; i < arrayOfData[0].length; i++) {
        let beginning = arrayOfData[0].indexOf("<option>", currentIndexOfOption)
        let end = arrayOfData[0].indexOf("</option>", currentIndexOfClosingOption)
        if (((end) || (beginning)) !== -1) {
            arrayOfMake.push(arrayOfData[0].slice(beginning + 8, end))
            currentIndexOfClosingOption = end + 1
            currentIndexOfOption = beginning + 1
        }
    }
    return arrayOfAllMake = arrayOfMake
}

const linksOfAllMake = (arrayOfAllMake) => {
    const links = arrayOfAllMake.map(stringToLink => `http://kodeturbo.com/index.php?marka=${stringToLink}&do=cars`)
    return arrayOfAllLinksToCarMake = links
}

const dataFromArrayOfAllLinksToCarMake = (arrayOfAllLinksToCarMake) => {
    arrayOfAllLinksToCarMake.map(singleLink => findAllModels(singleLink))
    // ODKOMENTOWAĆ NA KONIEC, USUNĄĆ NASTEPNĄ LINIKĘ
    // findAllModels(arrayOfAllLinksToCarMake[1])
}
const findAllModels = (singleLink) => {
    fetch(`${singleLink}`)
        .then(resp => resp.text())
        .then(resp => {
            trimInportantStuffFromAllModelsPage(resp)
        })
        .then(() => makeArrayOfCarAttributes(arrayOfCarsTableRows))
        .then(() => console.log(arrayOfCarsMakeAndModels))
}

const trimInportantStuffFromAllModelsPage = (pageText) => {
    const arrayOfInsideOfSingleMakePage = [pageText]
    let arrayOfCarsTr = []
    let currentIndexOfCar = 0 //poczatektr
    let currentIndexOfClosingCar = 0 //koniectr
    for (let i = 0; i < arrayOfInsideOfSingleMakePage[0].length; i++) {
        let beginning = arrayOfInsideOfSingleMakePage[0].indexOf("<tr ", currentIndexOfCar)
        let end = arrayOfInsideOfSingleMakePage[0].indexOf("</tr>", currentIndexOfClosingCar)
        if (((end) || (beginning)) !== -1) {
            arrayOfCarsTr.push(arrayOfInsideOfSingleMakePage[0].slice(beginning, end))
            currentIndexOfClosingCar = end + 1
            currentIndexOfCar = beginning + 1
        }
    }
    arrayOfCarsTr.shift() //usuwa pierwszy rząd tabeli
    return arrayOfCarsTableRows = arrayOfCarsTr
}

const makeArrayOfCarAttributes = (trFormWebPage) => {
    let beginningOfCarsName = 0 //pierwsze td
    let endOfCarsName = 0 //koniecpierwszegoTd
    let carsMake = () => {
        let beginningOfCarsName = trFormWebPage[0].indexOf("<td class=\"wazne\">")
        let endOfCarsName = trFormWebPage[0].indexOf("</td>")
        return trFormWebPage[0].slice(beginningOfCarsName + 18, endOfCarsName)
    }
    let carssMake = carsMake()
    console.log('carssMake', carssMake)
    let arrayOfFullCarNames = trFormWebPage.map((singleTrFormWebPage, i) => {
        let firstEndOfTd = singleTrFormWebPage.indexOf("</td>", endOfCarsName)
        let beginning = singleTrFormWebPage.indexOf("<td>", beginningOfCarsName)
        let end = singleTrFormWebPage.indexOf("</td>", firstEndOfTd + 1)
        return singleTrFormWebPage.slice(beginning + 4, end)
    })
    return arrayOfCarsMakeAndModels[carssMake] = arrayOfFullCarNames
}
